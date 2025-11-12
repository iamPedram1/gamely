export interface SendEmailProps {
  to: string;
  subject: string;
  html: string;
  senderName?: string;
  senderEmail?: string;
}
