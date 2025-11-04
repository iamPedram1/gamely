import mongoose from 'mongoose';
import logger from 'core/utilities/logger';
import { appDbUrl } from 'core/utilities/configs';

export default async function dbStartup() {
  try {
    return await mongoose.connect(appDbUrl);
  } catch (err) {
    logger.error('🔴 Error in connecting to db...', err);
  }
}
