import mongoose from 'mongoose';
import logger from 'core/utilities/logger';
import { appDbUrl } from 'core/utilities/configs';

export default async function dbStartup() {
  try {
    await mongoose
      .connect(appDbUrl)
      .then((v) => logger.info('Connected to db'));
  } catch (err) {
    logger.error('🔴 Error in connecting to db...', err);
  }
}
