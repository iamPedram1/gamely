import SibApiV3Sdk from '@sendinblue/client';
import { injectable } from 'tsyringe';

// Utilities
import logger from 'core/utilities/logger';
import { i18nInstance, t } from 'core/utilities/request-context';
import { emailApiKey, fromEmail } from 'features/shared/mail/mail.constant';
import {
  recoveryEnglishHtml,
  recoveryPersianHtml,
  verificationEnglishHtml,
  verificationPersianHtml,
} from 'features/shared/mail/mail.html';

// Types
import type { SendEmailProps } from 'features/shared/mail/mail.type';

const client = new SibApiV3Sdk.TransactionalEmailsApi();
client.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, emailApiKey);

@injectable()
export default class MailService {
  constructor() {}

  private async sendEmail(
    data: SendEmailProps
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { html, subject, to, senderEmail, senderName } = data;
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

  public async sendPasswordRecovery(email: string, name: string, key: string) {
    const res = await this.sendEmail({
      to: email,
      subject: t('messages.auth.password_recovery_emailSubject'),
      html:
        i18nInstance().resolvedLanguage === 'fa'
          ? recoveryPersianHtml(name, key)
          : recoveryEnglishHtml(name, key),
    });

    if (!res.success)
      logger.error('An error occured while sending password recovery email.');
  }

  public async sendVerificationEmail(
    email: string,
    name: string,
    code: string
  ) {
    const res = await this.sendEmail({
      to: email,
      subject: t('messages.auth.verify_account_emailSubject'),
      html:
        i18nInstance().resolvedLanguage === 'fa'
          ? verificationPersianHtml(name, code)
          : verificationEnglishHtml(name, code),
    });
    console.log(res);

    if (!res.success)
      logger.error('An error occured while sending verification email.');
  }
}
