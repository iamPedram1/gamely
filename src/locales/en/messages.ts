const messageTranslations = {
  notification: {
    follow_request: '{{username}} sended a follow request to you',
    comment_reply: '{{username}} has replied to your message in {{postTitle}}',
  },
  comment: {
    create_success:
      'Comment created successfully and will be visible after admin review',
  },
  file: {
    upload_some_failed: 'Some files upload failed ',
    upload_success_singular: 'File uploaded successfully',
    upload_failed_singular: 'File upload failed',
    upload_success_plural: 'Files uploaded successfully',
    upload_failed_plural: 'Files upload failed',
    too_large: 'File too large. Max size is {{size}} bytes',
    unexpected_file: 'Unexpected file in field',
    too_many_files: 'Too many files, Maximum allowed is {{size}} file',
    upload_failed: 'File upload failed',
    not_provided: 'File not provided',
    location_not_provided: 'File location not provided',
    location_invalid: 'File location is not valid',
  },
  batch: {
    completed: 'Batch operation completed successfuly',
    completed_with_error: 'Batch operation completed with some errors',
  },
  generics: {
    get: '{{name}} received successfully',
    post: '{{name}} created successfully',
    patch: '{{name}} updated successfully',
    put: '{{name}} updated successfully',
    delete: '{{name}} deleted successfully',
    else: 'Request processed successfully',
  },
  auth: {
    password_recovery_emailSubject: 'Gamely - Password Recovery',
    recover_password: 'A confirmation email will be sent if the account exists',
    password_changed: 'Password changed successfully',
    email_or_recoveryKey_invalid: 'Email or recovery key is invalid',
    email_exists: 'A user with given email address already exists',
    token_refresh_success: 'Token refreshed successfully',
    login_success: 'Successfully logged in to account',
    logout_success: 'Successfully logged out',
    register_success: 'Account created successfully',
  },
  user: {
    profile_updated: 'Profile updated successfully',
  },
  userFollow: {
    follow: 'Follow',
    unfollow: 'Unfollow',
    followers: 'Followers',
    followings: 'Followings',
  },
} as const;

export default messageTranslations;
