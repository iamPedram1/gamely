import mongoose from 'mongoose';
import logger from 'core/utilites/logger';
import { appDbUrl } from 'core/utilites/configs';

export default function dbStartup() {
  mongoose
    .connect(appDbUrl)
    .then(() => logger.info('Connected to db...'))
    .catch((err) => logger.error('Error in connecting to db...', err));
}
