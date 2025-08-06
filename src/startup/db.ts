import mongoose from 'mongoose';
import { appDbUrl } from 'utilites/configs';

export default function dbStartup() {
  mongoose.connect(appDbUrl);
}
