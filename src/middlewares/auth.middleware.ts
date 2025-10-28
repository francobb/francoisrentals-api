import crypto from 'crypto';
import passport from 'passport';
import { NextFunction, Response,} from 'express';
import { verify } from 'jsonwebtoken';
import { SECRET_CLIENT_KEY, SECRET_KEY } from '@config';
import { DataStoredInToken } from '@interfaces/auth.interface';
import { HttpException } from '@exceptions/HttpException';
import { logger } from '@utils/logger';

// const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
//   try {
//     const Authorization = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);
//
//     if (Authorization) {
//       const secretKey: string = SECRET_KEY;
//       const verificationResponse = verify(Authorization, secretKey) as DataStoredInToken;
//       const userId = verificationResponse._id;
//       const findUser = await userModel.findById(userId);
//       if (findUser) {
//         req.user = findUser;
//         next();
//       } else {
//         next(new HttpException(401, 'Wrong authentication token'));
//       }
//     } else {
//       next(new HttpException(404, 'Authentication token missing'));
//     }
//   } catch (error) {
//     next(new HttpException(401, 'Wrong authentication token ' + error));
//   }
// };

export const checkRole = (roles: string | string[]) => async (req, res: Response, next: NextFunction) => {
  const Authorization = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);
  if (Authorization) {
    const secretKey: string = SECRET_KEY;
    const verificationResponse = verify(Authorization, secretKey) as DataStoredInToken;
    const role = verificationResponse.role;
    if (!roles.includes(role)) {
      res.status(401).json('Sorry you do not have access to this route');
    } else {
      next();
    }
  } else {
    next(new HttpException(401, 'Authentication token missing'));
  }
};

export const checkClient = (req, res, next) => {
  try {
    const allowedTimeDifference = 300000;
    const FR_TOKEN = req.header('FR-TOKEN');
    const clientTimestamp = req.header('FR-Timestamp');

    if (FR_TOKEN) {
      const timestamp = new Date().getTime();
      const clientTimestampUTC = new Date(clientTimestamp).getTime();
      const dataToHash = `${SECRET_CLIENT_KEY}-${clientTimestamp}`;

      if (Math.abs(timestamp - clientTimestampUTC) > allowedTimeDifference) {
        return res.status(401).json({ message: 'Invalid timestamp' });
      }

      const serverToken = crypto.createHash('sha256').update(dataToHash).digest('hex');

      if (serverToken === FR_TOKEN) {
        next();
      } else {
        next(new HttpException(401, 'Supplied token is not valid'));
      }
    } else {
      next(new HttpException(401, 'Expected client token missing'));
    }
  } catch (e) {
    next(new HttpException(401, 'Request did not come from the expected client ' + e));
  }
};

/* passport handlers */
export const localAuth = passport.authenticate('local', { session: false });
export const requireJwtAuth = passport.authenticate('jwt', { session: false });
export const authWithGoogle = passport.authenticate('google',    {
  scope: [
    'profile',
    'email',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly',
  ],
});
export const authWithGoogleCallback = passport.authenticate('google', { scope: ['profile', 'email'], failureRedirect: '/', session: false });

export const apiKeyMiddleware = (req, res, next) => {
  // If no API key is configured on the server, we can assume the check is not needed.
  // This allows you to run your server locally without ngrok and without needing the key.
  if (!SECRET_CLIENT_KEY) {
    return next();
  }

  // Get the API key from the request header. 'x-api-key' is a common standard.
  const providedApiKey = req.header('fr-token');

  if (!providedApiKey) {
    logger.warn(`[API Key Auth] Denied: API Key missing from request to ${req.path}`);
    return res.status(401).json({ message: 'Unauthorized: An API Key is required.' });
  }

  if (providedApiKey !== SECRET_CLIENT_KEY) {
    logger.warn(`[API Key Auth] Denied: Invalid API Key provided for request to ${req.path}`);
    return res.status(403).json({ message: 'Forbidden: The provided API Key is invalid.' });
  }

  // If the keys match, allow the request to proceed.
  next();
};
