import mongoose from 'mongoose';
import logger from 'utilites/logger';
import { appDbUrl } from 'utilites/configs';

export default function dbStartup() {
  mongoose
    .connect(appDbUrl)
    .then(() => logger.info('Connected to db...'))
    .catch((err) => logger.error('Error in connecting to db...', err));
}
