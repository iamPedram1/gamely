import { Model, Schema, model } from 'mongoose';

// Utils
import crypto from 'core/utilities/crypto';

// Types
import type { ISessionEntity } from 'features/shared/auth/session/session.types';

const sessionSchema = new Schema<ISessionEntity, Model<ISessionEntity>>({
  refreshToken: {
    type: String,
    trim: true,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
    immutable: true,
  },
  generatedAt: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  refreshedAt: {
    type: Date,
    default: null,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  ip: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  lastActivity: {
    type: Date,
    required: true,
    default: Date.now(),
  },
});

const hashableFields = ['refreshToken'] as const;
const methods = ['findOneAndUpdate', 'updateOne'] as const;

sessionSchema.pre('save', async function (next) {
  try {
    for (const field of hashableFields) {
      if (this.isModified(field) && this[field]) {
        this[field] = await crypto.hash(this[field]);
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

methods.forEach((method) => {
  sessionSchema.pre(method, async function (next) {
    try {
      const update = this.getUpdate();

      if (!update) return next();

      if (!Array.isArray(update) && typeof update === 'object') {
        const $set = update.$set || {};

        for (const field of hashableFields) {
          if (update[field]) update[field] = await crypto.hash(update[field]);
          if ($set[field]) $set[field] = await crypto.hash($set[field]);
        }

        if (Object.keys($set).length) update.$set = $set;
      }

      next();
    } catch (err) {
      next(err);
    }
  });
});

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = model('Session', sessionSchema);

export default Session;
