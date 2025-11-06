import type { Request, Response, NextFunction } from 'express';

// Model
import Session from 'features/shared/auth/session/session.model';

// Utilities
import logger from 'core/utilities/logger';
import tokenUtils from 'core/services/token.service';
import { t } from 'core/utilities/request-context';
import {
  jwtAccessTokenKey,
  jwtAccessTokenName,
} from 'features/shared/auth/session/session.constant';

// Types
import type { IAccessToken } from 'features/shared/auth/session/session.types';
import { request } from 'core/utilities/vitest.setup';

export async function updateSessionActivity(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.header(jwtAccessTokenName);
    if (!token) return;

    const { sessionId } = tokenUtils.verify<IAccessToken>(
      token,
      jwtAccessTokenKey,
      t('common.token')
    );

    // Fetch lastActivity
    const session = await Session.findById(sessionId).select('lastActivity');
    if (!session) return;

    const now = new Date();
    const THROTTLE_MS = 60 * 1000;
    const lastActivity = session.lastActivity?.getTime() ?? 0;

    if (now.getTime() - lastActivity > THROTTLE_MS) {
      // Fire-and-forget update
      Session.findByIdAndUpdate(sessionId, { lastActivity: now }).catch(
        logger.error
      );
    }
  } catch (err) {
    logger.error('updateSessionActivity failed', err);
  } finally {
    return next();
  }
}
