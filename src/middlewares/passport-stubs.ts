// This file contains placeholder exports for obsolete Passport.js middleware.
// The application has been migrated to a stateless authentication strategy.
export const localAuth = (req, res, next) => next();
export const requireJwtAuth = (req, res, next) => next();
// The Google strategy is no longer needed.
// export const authWithGoogle = (req, res, next) => next();
// export const authWithGoogleCallback = (req, res, next) => next();
export const apiKeyMiddleware = (req, res, next) => next();
