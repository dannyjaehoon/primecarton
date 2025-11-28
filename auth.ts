
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/db/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { compareSync } from 'bcrypt-ts-edge';
import type { NextAuthConfig } from "next-auth";
import { cookies } from 'next/headers';


export const config ={ 
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        if (credentials == null) return null;

        // Find user in database
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });

        // Check if user exists and if the password matches
        if (user && user.password) {
          const isMatch = await compareSync(
            credentials.password as string,
            user.password
          );

          // If password is correct, return user
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }
        // If user does not exist or password does not match return null
        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const email = profile?.email || user?.email;
        if (!email) return false;
        const cookieStore = await cookies();

        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
          await prisma.account.upsert({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
            update: {
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
              session_state: (account as any).session_state,
            },
            create: {
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
              session_state: (account as any).session_state,
            },
          });

          if (existingUser.termsAgreed === true) {
            cookieStore.set('termsAgreed', 'true', { path: '/', maxAge: 60 * 60 * 24 * 30 });
          } else {
            cookieStore.delete('termsAgreed');
          }
        }
        // For new users, PrismaAdapter will create user; ensure no stale cookie
        if (!existingUser) {
          cookieStore.delete('termsAgreed');
        }
      }
      return true;
    },
    async session({ session, user, trigger, token } : any) {

      // Set the user ID from the token
      session.user.id = token.sub;
      session.user.role = token.role;
      session.user.name = token.name;
      session.user.termsAgreed = token.termsAgreed;

      // If there is an update, set the user name
      if (trigger === 'update') {
        session.user.name = user.name;
      }

      return session;
    },

    async jwt({token, user, trigger, session}: any) {

      // Assign user fields to token
      if(user) {
        token.role = user.role;
        token.termsAgreed = user.termsAgreed ?? false;

        // If user has no name then use the email
        if(user.name === 'NO_NAME') {
          token.name = user.email!.split('@')[0];

          //update database to reflect the token name
          await prisma.user.update({
            where: {id : user.id},
            data: {name: token.name}
          })
        }
      }
      if(session?.user.name && trigger === 'update') {
        token.name = session.user.name;
      }
      if (token.termsAgreed === undefined) {
        token.termsAgreed = false;
      }
      return token;
    }
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
