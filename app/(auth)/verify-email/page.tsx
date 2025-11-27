import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { APP_NAME } from '@/lib/constants';
import { verifyEmailToken } from '@/lib/actions/user.actions';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import VerifyEmailRequestForm from './request-form';

export const metadata: Metadata = {
  title: 'Verify Email',
};

const VerifyEmailPage = async (props: {
  searchParams: Promise<{ token?: string | string[]; email?: string | string[] }>;
}) => {
  const { token, email } = await props.searchParams;
  const tokenValue = Array.isArray(token) ? token[0] : token;
  const initialEmail = Array.isArray(email) ? email[0] : email;

  const result = tokenValue
    ? await verifyEmailToken(tokenValue)
    : null;

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="space-y-4">
          <Link href="/" className="flex-center">
            <Image
              src="/images/logo.svg"
              width={100}
              height={100}
              alt={`${APP_NAME} logo`}
              priority={true}
            />
          </Link>
          <CardTitle className="text-center">Verify your email</CardTitle>
          <CardDescription className="text-center">
            Send a verification email and click the link in your inbox
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {result && (
            <div
              className={
                result.success ? 'text-center text-green-600' : 'text-center text-destructive'
              }
            >
              {result.message}
            </div>
          )}

          <VerifyEmailRequestForm initialEmail={initialEmail} />

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/sign-in" className="link">
              Go to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmailPage;
