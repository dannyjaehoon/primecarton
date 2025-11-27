'use server';

import { shippingAddressSchema, signInFormSchema, signUpFormSchema, paymentMethodSchema, updateUserSchema } from "../validators";
import { auth, signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from 'bcrypt-ts-edge';
import { prisma } from "@/db/prisma";
import { formatError } from "../utils";
import z, { ZodError } from "zod";
import { ShippingAddress } from "@/types";
import { PAGE_SIZE } from "../constants";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { sendVerificationEmail } from "@/email";
import { createEmailVerificationToken, hashVerificationToken } from "../auth/email-verification";
import { encryptText } from "../encrypt";
import { cookies } from "next/headers";

// sign in the user with credentials
export async function signInWithCredentials(prevState : unknown, formDate: FormData) {
    try {
        const credentials = signInFormSchema.parse({
            email: formDate.get('email'),
            password: formDate.get('password')
        });
        const callbackUrl = typeof formDate.get('callbackUrl') === 'string'
          ? (formDate.get('callbackUrl') as string)
          : '/';

        await signIn('credentials', {
          ...credentials,
          redirectTo: callbackUrl || '/',
        });

        return { success: true, message: 'Signed in successfully' }
    } catch (error){
        if(isRedirectError(error)) {
            throw error;
        }

        return { success: false, message : 'Invalid email or password' }
    }
}

export async function signOutUser() {
    await signOut();
}

//sign up a user 
export async function signUpUser(prevState: unknown, formData: FormData) {
    try {
        const cookieStore = await cookies();
        const user = signUpFormSchema.parse({
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            termsAgreed: formData.get('termsAgreed'),
            marketingConsent: formData.get('marketingConsent'),
        });

        const verifiedEmailCookie = cookieStore.get('verifiedEmail')?.value;
        if (!verifiedEmailCookie || verifiedEmailCookie !== user.email) {
            return { success: false, message: 'Please verify your email before signing up.' };
        }

        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (existingUser) {
          return { success: false, message: 'Email already registered. Please sign in.' };
        }

        const hashedPassword = hashSync(user.password, 10);
        const encryptedPhone = user.phone ? await encryptText(user.phone) : null;

        await prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                password: hashedPassword,
                phone: encryptedPhone ?? undefined,
                termsAgreed: user.termsAgreed,
                termsAgreedAt: user.termsAgreed ? new Date() : null,
                marketingConsent: user.marketingConsent,
                marketingConsentAt: user.marketingConsent ? new Date() : null,
            }
        })

        cookieStore.delete('verifiedEmail');

        return {
          success: true,
          email: user.email,
          message: 'Account created. You can sign in now.',
        };
    } catch (error) {

        if(isRedirectError(error)) {
            throw error;
        }

        return { success: false, message : formatError(error)};
    }
}

export async function verifyEmailToken(token: string) {
  try {
    const hashedToken = hashVerificationToken(token);

    const verificationRecord = await prisma.verificationToken.findFirst({
      where: { token: hashedToken },
    });

    if (!verificationRecord) {
      return { success: false, message: 'Invalid or expired verification link' };
    }

    if (verificationRecord.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: verificationRecord.identifier,
            token: hashedToken,
          },
        },
      });

      return {
        success: false,
        message: 'Verification link has expired. Please sign up again.',
      };
    }

    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationRecord.identifier,
          token: hashedToken,
        },
      },
    });

    return { success: true, message: 'Email verified. You can now sign in.' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function requestEmailVerification(
  prevState: { success: boolean; message: string; verified: boolean },
  formData: FormData
) {
  try {
    const rawEmail = formData.get('email');

    if (!rawEmail || typeof rawEmail !== 'string') {
      return { success: false, message: 'Please enter an email before verifying.', verified: false };
    }

    const email = z.string().email().parse(rawEmail);

    const user = await prisma.user.findUnique({ where: { email } });

    if (user?.id) {
      return { success: true, message: 'Email already verified. You can sign in.', verified: true };
    }

    const token = await createEmailVerificationToken(email);
    await sendVerificationEmail({ email, token });

    return { success: true, message: 'Verification email sent. Check your inbox.', verified: false };
  } catch (error) {
    return { success: false, message: formatError(error), verified: false };
  }
}

// get a use by the Id
export async function getUserById(userId: string) {
    const user=await prisma.user.findFirst({
        where: {id: userId}
    });
    if(!user) throw new Error('User not found');

    return user;
}

// update the user's address
export async function updateUserAddress(data: ShippingAddress) {
    try {
        const session = await auth();
        
        const currentUser = await prisma.user.findFirst({
            where: {id: session?.user?.id}
        });

        if(!currentUser) throw new Error("User not found");

        const address = shippingAddressSchema.parse(data);

        await prisma.user.update({
            where : {id: currentUser.id},
            data: { address}
        });

        return { success: true, message: 'User updated successfully'}
    } catch (error) {
        return { success: false, message: formatError(error)}
    }
}

// update user's payment method
export async function updateUserPaymentMethod(data: z.infer<typeof paymentMethodSchema>) {
    try {
        const session = await auth();
        const currentUser = await prisma.user.findFirst({
            where: {id : session?.user?.id}
        });
        if(!currentUser) throw new Error("User not found");

        const paymentMethod = paymentMethodSchema.parse(data);
        
        await prisma.user.update({
            where:{id: currentUser.id},
            data:{ paymentMethod: paymentMethod.type}
        });

        return { success: true, message: 'User updated successfully'}
    } catch (error) {
        return { success: false, message: formatError(error)}
    }
}

//update the user profile
export async function updateProfile(user: {name: string, email: string}) {
    try {
        const session = await auth();
        const currentUser = await prisma.user.findFirst({
            where: {
                id: session?.user?.id
            }
        })

        if(!currentUser) throw new Error('User not found');

        await prisma.user.update({
            where: {id: currentUser.id},
            data: {
                name: user.name
            }
        })
        return { success: true, message: 'User updated successfully'}
    
    } catch (error) {
        return { success: false, message: formatError(error)}
    }
}

// get all the users
export async function getAllUsers({
    limit = PAGE_SIZE,
    page,
    query
}: {
    limit?:number;
    page: number;
    query: string
}) {
    const queryFilter: Prisma.UserWhereInput =
    query && query !== 'all'
        ? {
            name: {
            contains: query,
            mode: 'insensitive',
            } as Prisma.StringFilter,
        }
        : {};

    const data = await prisma.user.findMany({
        where: {
            ...queryFilter,
        },
        orderBy: {createdAt: 'desc'},
        take: limit,
        skip:(page - 1) * limit
    })

    const dataCount = await prisma.user.count();

    return {
        data,
        totalPages: Math.ceil(dataCount / limit)
    }
}

// Delete a user
export async function deleteUser(id: string) {
    try {
        await prisma.user.delete({where:{id}});

        revalidatePath("/admin/users");

        return {
            success: true,
            message: "User deleted successfully",
        }
    } catch (error) {
         return { success: false, message: formatError(error) };
    }
}


// Update a user
export async function updateUser(user: z.infer<typeof updateUserSchema>) {
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        role: user.role,
      },
    });

    revalidatePath('/admin/users');

    return {
      success: true,
      message: 'User updated successfully',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
