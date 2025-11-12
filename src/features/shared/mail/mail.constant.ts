import dotenv from 'dotenv';
dotenv.config({ quiet: true });

const env = process.env;
export const fromEmail = env.FROM_Email as string;
export const emailApiKey = env.EMAIL_Api_Key as string;
