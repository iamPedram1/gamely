const errosTranslations = {
  token_generic_error: 'خطا دسترسی، شناسه منقضی یا نامعتبر است',
  refresh_token_invalid: 'شناسه تازه سازی نامعتبر است',
  refresh_token_expired: 'شناسه تازه سازی منقضی شده است',
  refresh_token_missing: 'شناسه تازه سازی ارسال نشده است',
  recovery_token_invalid: 'شناسه بازیابی نامعتبر است',
  recovery_token_expired: 'شناسه بازیابی منقضی شده',
  validation_failed: 'اعتبار سنجی با خطا مواجه شد',
  id_required: 'وارد کردن شناسه اجباریست',
  id_invalid: 'شناسه نامعتبر است',
  uniqueness_error:
    "{{field}} '{{value}}' توسط {{name}} دیگری قبلاً استفاده شده است",
  create_failed: 'خطایی در ساخت {{name}} رخ داد',
  update_failed: 'خطایی در بروزرسانی {{name}} رخ داد',
  delete_failed: 'خطایی در حذف {{name}} رخ داد',
  bad_request: 'درخواست نامعتبر است',
  forbidden_error: 'خطا دسترسی',
  unauthorized_error: 'خطا احراز هویت',
  too_many_request:
    'تعداد تلاش‌ها بیش از حد مجاز است، لطفاً بعداً دوباره تلاش کنید',
  invalid_route: "مسیر مورد نظر '{{url}}' وجود ندارد.",
  invalid_credentials: 'ایمیل یا کلمه عبور معتبر نیست',
  not_found_by_id: '{{model}} با شناسه ({{id}}) پیدا نشد',
  not_found_by_key: '{{model}} با {{key}} پیدا نشد',
  found_but_update_failed: '{{model}} پیدا شد اما بروزرسانی آن انجام نشد',
  no_documents_with_references: 'هیچ سندی از {{model}} با مراجع منطبق پیدا نشد',
  not_found_by_key_value: 'هیچ {{model}} با {{key}}={{value}} پیدا نشد',
  ids_array_empty: 'آرایه شناسه‌ها نمی‌تواند خالی باشد',
  batch_delete_failed: 'حذف گروهی برای {{model}} با خطا مواجه شد',
  category_self_parent: 'دسته‌بندی نمیتواند والد خودش باشد',
  category_circular_relationship: 'رابطه چرخشی‌ (دایره‌ای) شناسایی شد',
  jwt_verify_expired: '{{name}} منقضی شده است',
  jwt_verify_invalid: '{{name}} نامعتبر است',
  jwt_verify_missing: '{{name}} وجود ندارد',
  made_byself_error:
    'شما سازنده این {{model}} نیستید و دسترسی به عملیات مربوطه را ندارید',
  own_every_children_error:
    '{{model}} دارای {{model}} فرزند است و شما سازنده تمامی آنها نیستید',
} as const;

export default errosTranslations;
