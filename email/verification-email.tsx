import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import { APP_NAME } from '@/lib/constants';

type VerificationEmailProps = {
  verificationUrl: string;
};

export default function VerificationEmail({
  verificationUrl,
}: VerificationEmailProps) {
  return (
    <Html>
      <Preview>Confirm your email to finish setting up {APP_NAME}</Preview>
      <Tailwind>
        <Head />
        <Body className='bg-white font-sans'>
          <Container className='max-w-xl px-6 py-8'>
            <Heading className='text-xl font-semibold'>
              Verify your email
            </Heading>
            <Text className='text-gray-700'>
              Thanks for creating an account with {APP_NAME}. Please confirm
              your email address to activate your account.
            </Text>
            <Section className='my-6 text-center'>
              <Button
                href={verificationUrl}
                className='bg-black text-white py-3 px-6 rounded-md font-semibold'
              >
                Confirm email
              </Button>
            </Section>
            <Text className='text-gray-700'>
              If the button does not work, copy and paste this link into your
              browser:
            </Text>
            <Text className='break-all text-sm text-gray-700'>
              {verificationUrl}
            </Text>
            <Hr className='my-8 border-gray-200' />
            <Text className='text-gray-500 text-sm'>
              If you did not create an account, you can safely ignore this
              email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
