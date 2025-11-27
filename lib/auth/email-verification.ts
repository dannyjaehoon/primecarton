import crypto from 'crypto';
import { prisma } from '@/db/prisma';
import { EMAIL_VERIFICATION_TOKEN_EXPIRES_IN_HOURS } from '@/lib/constants';

const tokenExpiryInMs = EMAIL_VERIFICATION_TOKEN_EXPIRES_IN_HOURS * 60 * 60 * 1000;

export const hashVerificationToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

export async function createEmailVerificationToken(email: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = hashVerificationToken(token);

  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: hashedToken,
      expires: new Date(Date.now() + tokenExpiryInMs),
    },
  });

  return token;
}
