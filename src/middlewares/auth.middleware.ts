import { NextFunction, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { HttpException } from '@exceptions/HttpException';
import { APP_ID, ADMIN_EMAIL } from '@config';
import { logger } from '@utils/logger';

const googleClient = new OAuth2Client(APP_ID);

/**
 * A stateless authentication middleware that verifies a Google ID token and
 * ensures the user is the designated admin.
 */
export const statelessAuth = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpException(401, 'Authentication token missing or malformed');
    }

    const idToken = authHeader.split('Bearer ')[1];
    if (!idToken) {
      throw new HttpException(401, 'Authentication token missing');
    }

    // Verify the token with Google's servers
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: APP_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email_verified) {
      throw new HttpException(401, 'Invalid token or email not verified');
    }

    // DEFINITIVE FIX: Check if the verified email matches the designated admin email.
    if (payload.email !== ADMIN_EMAIL) {
      logger.warn(`[AuthMiddleware] Forbidden: Request from non-admin user ${payload.email}`);
      throw new HttpException(403, 'Forbidden: You do not have access to this resource.');
    }

    // The user is the admin. Create a user object on the fly for logging and potential future use.
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: 'ADMIN', // The role is now guaranteed to be ADMIN.
    };

    // No database call is needed. The user is authenticated.
    next();
  } catch (error) {
    if (error instanceof HttpException) {
      next(error);
    } else {
      logger.error('[AuthMiddleware] Error verifying token:', error);
      next(new HttpException(401, 'Wrong or expired authentication token'));
    }
  }
};

/**
 * A placeholder for role-checking. With the new model, this is less critical
 * as the `statelessAuth` middleware already confirms the user is an ADMIN.
 */
export const checkRole = (roles: string[]) => (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new HttpException(403, 'Forbidden: You do not have access to this resource.'));
  }
  next();
};

// The apiKeyMiddleware and other passport-related exports can remain for now
// as they might be used for other purposes (e.g., server-to-server communication).
export { localAuth, requireJwtAuth, apiKeyMiddleware } from './passport-stubs';
