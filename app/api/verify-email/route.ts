import { NextResponse } from 'next/server';
import { hashVerificationToken } from '@/lib/auth/email-verification';
import { prisma } from '@/db/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/verify-email?error=missing', request.url));
  }

  const hashedToken = hashVerificationToken(token);

  const verificationRecord = await prisma.verificationToken.findFirst({
    where: { token: hashedToken },
  });

  if (!verificationRecord) {
    return NextResponse.redirect(new URL('/verify-email?error=invalid', request.url));
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

    return NextResponse.redirect(new URL('/verify-email?error=expired', request.url));
  }

  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: verificationRecord.identifier,
        token: hashedToken,
      },
    },
  });

  const response = NextResponse.redirect(new URL(`/sign-up?email=${encodeURIComponent(verificationRecord.identifier)}&verified=1`, request.url));
  response.cookies.set({
    name: 'verifiedEmail',
    value: verificationRecord.identifier,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  });

  return response;
}
