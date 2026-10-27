export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!secret) {
    if (isProduction) {
      throw new Error('FATAL: JWT_SECRET environment variable is required in production mode.');
    }
    return 'lost2found_secret_jwt_key_2025';
  }

  if (isProduction && (secret === 'secret' || secret === 'lost2found_secret_jwt_key_2025' || secret === 'your_jwt_secret_here')) {
    throw new Error('FATAL: Known development placeholder JWT_SECRET cannot be used in production mode.');
  }

  return secret;
};
