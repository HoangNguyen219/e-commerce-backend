enum Role {
  Admin = 'admin',
  User = 'user',
}

enum Message {
  INVALID_CREDENTIALS = 'Invalid Credentials',
  PASSWORD_DO_NOT_MATCH = 'Passwords do not match',
  PLEASE_PROVIDE_ALL_VALUES = 'Please provide all values',
  AUTHENTICATION_INVALID = 'Authentication Invalid',
  UNAUTHORIZED = 'Unauthorized to access this route',
}

export { Role, Message };
