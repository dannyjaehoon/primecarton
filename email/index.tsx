import {Resend } from 'resend';
import { SENDER_EMAIL, APP_NAME, SERVER_URL} from '@/lib/constants';
import { Order } from '@/types';
import PurchaseReceiptEmail from './purchase-receipt';
import VerificationEmail from './verification-email';

require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY as string);

export const sendPurchasedReceipt = async ({order} : {order:Order}) => {
    await resend.emails.send({
        from: `${APP_NAME} <${SENDER_EMAIL}>`,
        to: order.user.email,
        subject: `Order Confirmation ${order.id}`,
        react: <PurchaseReceiptEmail order={order}/>
    })
}

export const sendVerificationEmail = async ({
  email,
  token,
}: {
  email: string;
  token: string;
}) => {
  const verificationUrl = new URL('/api/verify-email', SERVER_URL);
  verificationUrl.searchParams.set('token', token);

  await resend.emails.send({
    from: `${APP_NAME} <${SENDER_EMAIL}>`,
    to: email,
    subject: `Verify your email for ${APP_NAME}`,
    react: <VerificationEmail verificationUrl={verificationUrl.toString()} />,
  });
};
