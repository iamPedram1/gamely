import mongoose from 'mongoose';
import logger from 'core/utilities/logger';
import { appDbUrl } from 'core/utilities/configs';

export default function dbStartup() {
  mongoose
    .connect(appDbUrl)
    .then(() => logger.info('Connected to db...'))
    .catch((err) => logger.error('Error in connecting to db...', err));
}
