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
} from 'features/shared/auth/session/session.constants';

// Types
import type { IToken } from 'features/shared/auth/session/session.types';

export async function updateSessionActivity(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.header(jwtAccessTokenName);
  if (!token) return next();

  try {
    const { sessionId } = tokenUtils.verify<IToken>(
      token,
      jwtAccessTokenKey,
      t('common.token')
    );

    // Fetch lastActivity
    const session = await Session.findById(sessionId).select('lastActivity');
    if (!session) return next();

    const now = new Date();
    const THROTTLE_MS = 60 * 1000;

    if (now.getTime() - session.lastActivity.getTime() > THROTTLE_MS) {
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
