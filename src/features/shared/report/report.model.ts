import { model, Schema, Model } from 'mongoose';

// Constants
import {
  reportReason,
  reportStatus,
  returnType,
} from 'features/shared/report/report.constant';

// Types
import type { IReportEntity } from 'features/shared/report/report.types';

const reportSchema = new Schema<IReportEntity, Model<IReportEntity>>(
  {
    description: {
      type: String,
      trim: true,
      minlength: 10,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: returnType,
      required: true,
      lowercase: true,
      trim: true,
    },
    reason: {
      type: String,
      enum: reportReason,
      required: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: reportStatus,
      default: 'pending',
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      immutable: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true, immutable: true },
  },
  { timestamps: true }
);

export const Report = model<IReportEntity>('Report', reportSchema);

export default Report;
