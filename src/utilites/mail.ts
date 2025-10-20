import SibApiV3Sdk from '@sendinblue/client';
import { emailApiKey, fromEmail } from 'utilites/configs';

interface SendEmailProps {
  to: string;
  subject: string;
  html: string;
  senderName?: string;
  senderEmail?: string;
}

const client = new SibApiV3Sdk.TransactionalEmailsApi();
client.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, emailApiKey);

export async function sendEmail({
  to,
  subject,
  html,
  senderName,
  senderEmail,
}: SendEmailProps): Promise<{ success: boolean; message: string }> {
  try {
    await client.sendTransacEmail({
      sender: {
        name: senderName || 'GameLy',
        email: senderEmail || fromEmail!,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });

    return { success: true, message: 'Email sent successfully' };
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.body?.message || err.message,
    };
  }
}
