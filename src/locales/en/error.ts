const errosTranslations = {
  bad_request: 'Bad request',
  refresh_token: {
    invalid: 'Refresh token is invalid',
    expired: 'Refresh token is expired',
    missing: 'Refresh token is not provided',
  },
  recovery_token: {
    invalid: 'Recovery key is invalid',
    expired: 'Recovery key is expired',
  },
  user: {
    self_block: 'You cannot block yourself',
    forbidden_block: "You don't have access to block this user",
    is_blocked: 'Your account has been suspended by admin',
    update_role: "You don't have access to change user roles",
  },
  validation_failed: 'Validation failed',
  id_required: 'The id paramater is required',
  id_invalid: 'The id paramater is invalid',
  token_generic_error: 'Access denied, token is invalid or expired',
  uniqueness_error:
    "{{field}} '{{value}}' is already taken by another {{name}}`",
  forbidden_error: 'Access Denied',
  unauthorized_error: 'Unauthorized',
  too_many_request: 'Too many attempts, Please try again later',
  update_failed: 'An error occured in updating {{name}}',
  create_failed: 'An error occured in creating {{name}}',
  delete_failed: 'An error occured in deleting {{name}}',
  invalid_route: "The requested path '{{url}}' could not be found",
  invalid_credentials: 'Invalid email or password',
  not_found_by_id: '{{model}} with id ({{id}}) was not found',
  not_found_by_key: '{{model}} with {{key}} was not found',
  not_exists_by_key: '{{model}} with {{key}} does not exist',
  not_exists_by_id: '{{model}} with id {{id}} does not exist',
  not_found_docs: 'No {{model}} found',
  found_but_update_failed: '{{model}} was matched but could not be updated',
  no_documents_with_references:
    'No {{model}} documents found with matching references',
  not_found_by_key_value: 'No {{model}} with {{key}}={{value}} was found',
  ids_array_empty: 'Ids array cannot be empty',
  batch_delete_failed: 'Batch delete failed for {{model}}',
  category: {
    self_parent: 'parentId: A category cannot be its own parent',
    circular_relationship: 'parentId: Circular relationship detected',
  },
  jwt: {
    verify_expired: '{{name}} is expired',
    verify_invalid: '{{name}} is invalid',
    verify_missing: '{{name}} is missing',
  },
  made_byself_error: "You didn't create this {{model}}",
  own_every_children_error:
    "This {{model}} has children, you didn't create every children in this {{model}}",
  param: {
    required: '{{param}} is required',
    invalid: '{{param}} is invalid',
    not_found: 'No {{model}} found with {{param}} = {{value}}',
  },
} as const;

export default errosTranslations;
