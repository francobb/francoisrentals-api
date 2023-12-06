import crypto from 'crypto';
import passport from 'passport';
import { NextFunction, Response, Request } from 'express';
import { verify } from 'jsonwebtoken';
import { SECRET_CLIENT_KEY, SECRET_KEY } from '@config';
import userModel from '@models/users.model';
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';
import { HttpException } from '@exceptions/HttpException';
import {logger} from "@utils/logger";

const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const Authorization = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);

    if (Authorization) {
      const secretKey: string = SECRET_KEY;
      const verificationResponse = verify(Authorization, secretKey) as DataStoredInToken;
      const userId = verificationResponse._id;
      const findUser = await userModel.findById(userId);
      if (findUser) {
        req.user = findUser;
        next();
      } else {
        next(new HttpException(401, 'Wrong authentication token'));
      }
    } else {
      next(new HttpException(404, 'Authentication token missing'));
    }
  } catch (error) {
    next(new HttpException(401, 'Wrong authentication token'));
  }
};

export const checkRole = (roles: string | string[]) => async (req, res: Response, next: NextFunction) => {
  const Authorization = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);
  if (Authorization) {
    const secretKey: string = SECRET_KEY;
    const verificationResponse = verify(Authorization, secretKey) as DataStoredInToken;
    const role = verificationResponse.role;
    !roles.includes(role) ? res.status(401).json('Sorry you do not have access to this route') : next();
  } else {
    next(new HttpException(401, 'Authentication token missing'));
  }
};

export const checkClient = (req: Request, res: Response, next: NextFunction) => {
  try {
    const allowedTimeDifference = 300000;
    const FR_TOKEN = req.header('FR-TOKEN');
    const clientTimestamp = req.header('FR-Timestamp');

    logger.info('FR_TOKEN: ' + FR_TOKEN);
    logger.info('clientTimestamp: ' + clientTimestamp);
    logger.info('SECRET_CLIENT_KEY: ' + SECRET_CLIENT_KEY);

    if (FR_TOKEN) {
      const timestamp = new Date().getTime();
      const clientTimestampUTC = new Date(clientTimestamp).getTime();
      const dataToHash = `${SECRET_CLIENT_KEY}-${clientTimestamp}`;

      logger.info('timestamp: ' + timestamp);

      if (Math.abs(timestamp - clientTimestampUTC) > allowedTimeDifference) {
        return res.status(401).json({ message: 'Invalid timestamp' });
      }

      // Recreate the token using the same logic as on the client-side
      const serverToken = crypto.createHash('sha256').update(dataToHash).digest('hex');

      logger.info('serverToken: ' + serverToken);

      if (serverToken === FR_TOKEN) {
        next();
      } else {
        next(new HttpException(401, 'Supplied token is not valid'));
      }
    } else {
      next(new HttpException(401, 'Expected client token missing'));
    }
  } catch (e) {
    next(new HttpException(401, 'Request did not come from the expected client'));
  }
};

/* passport handlers */
export const localAuth = passport.authenticate('local', { session: false });
export const requireJwtAuth = passport.authenticate('jwt', { session: false });
export const authWithGoogle = passport.authenticate('google', { scope: ['profile', 'email'] });
export const authWithGoogleCallback = passport.authenticate('google', { failureRedirect: '/', session: false });

export default authMiddleware;
