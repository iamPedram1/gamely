const messageTranslations = {
  auth: {
    email_exists: 'این ایمیل توسط کاربر دیگری استفاده شده است',
    token_refresh_success: 'توکن با موفقیت تازه‌سازی شد',
    login_success: 'با موفقیت وارد حساب خود شدید',
    logout_success: 'با موفقیت از حساب خارج شدید',
    register_success: 'ثبت نام با موفقیت انجام شد',
  },
  user: {
    profile_updated: 'پروفایل با موفقیت بروزرسانی شد',
  },
  file: {
    upload_some_failed: 'بارگذاری برخی فایل‌ها ناموفق بود',
    upload_success_singular: 'فایل با موفقیت بارگذاری شد',
    upload_failed_singular: 'بارگذاری فایل ناموفق بود',
    upload_success_plural: 'فایل‌ها با موفقیت بارگذاری شدند',
    upload_failed_plural: 'بارگذاری فایل‌ها ناموفق بود',
    too_large:
      'حجم فایل بیش از حد مجاز است، حداکثر حد مجاز‌‌ {{size}} بایت است',
    unexpected_file: 'فایل غیرمنتظره‌ای ارسال شده است',
    too_many_files:
      'تعداد فایل‌ها بیش از حد مجاز است، حداکثر حد مجاز {{size}} است',
    upload_failed: 'آپلود فایل ناموفق بود',
    not_provided: 'فایلی برای آپلود ارسال نشده',
    location_not_provided: 'مکان آپلود ارسال نشده',
    location_invalid: 'مکان آپلود ارسال شده نامعتبر است',
  },
  batch: {
    completed: 'عملیات گروهی با موفقیت انجام شد',
    completed_with_error: 'عملیات گروهی با برخی خطاها انجام شد',
  },
  generics: {
    get: '{{name}} با موفقیت دریافت شد',
    post: '{{name}} با موفقیت ایجاد شد',
    patch: '{{name}} با موفقیت بروزرسانی شد',
    put: '{{name}} با موفقیت بروزرسانی شد',
    delete: '{{name}} با موفقیت حذف شد',
    else: 'درخواست با موفقیت انجام شد',
  },
} as const;

export default messageTranslations;
