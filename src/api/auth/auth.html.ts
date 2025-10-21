import { userAppUrl } from 'core/utilites/configs';

export const recoveryEnglishHtml = (name: string, key: string) => {
  const recoveryUrl = `${userAppUrl}/recovery/${key}`;
  return `
        <html>
        <body style="font-family: Arial, sans-serif; background-color:#f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">Hello ${name},</h2>
        <p>You requested to reset your password for your Gamely account.</p>
        <p>Please click the button below to set a new password. This link is valid for a limited time.</p>
        <p style="text-align:center; margin: 30px 0;">
        <a href="${recoveryUrl}" style="background-color: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </p>
        <p>If you didn't request this change, you can safely ignore this email.</p>
        <p>Thanks,<br/>The Gamely Team</p>
        </div>
        </body>
        </html>
        `;
};

export const recoveryPersianHtml = (name: string, key: string) => {
  const recoveryUrl = `${userAppUrl}/recovery/${key}`;
  return `
  <html dir="rtl">
    <body style="font-family: Tahoma, sans-serif; background-color:#f5f5f5; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); text-align: right;">
        <h2 style="direction: rtl; color: #333;">سلام ${name} عزیز،</h2>
        <p  style="direction: rtl;">شما درخواست تغییر رمز عبور برای حساب Gamely خود را داده‌اید.</p>
        <p  style="direction: rtl;">لطفاً برای تعیین رمز عبور جدید، روی دکمه زیر کلیک کنید. این لینک تنها به مدت 10 دقیقه معتبر است.</p>
        <p style="text-align:center; margin: 30px 0;">
          <a href="${recoveryUrl}" style="background-color: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">تغییر رمز عبور</a>
        </p>
        <p>اگر شما این درخواست را نداده‌اید، این ایمیل را نادیده بگیرید.</p>
        <p style="direction: rtl;">با تشکر،<br/>تیم Gamely</p>
      </div>
    </body>
  </html>
  `;
};
