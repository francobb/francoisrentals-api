import passport from 'passport';
import passportJwt from 'passport-jwt';
import GoogleStrategy from 'passport-google-oauth20';
import { APP_ID, APP_SECRET, REDIRECT_URI, SECRET_KEY } from '@config';

const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

// This strategy validates the JWT from incoming requests.
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: SECRET_KEY,
    },
    // The user is no longer fetched from the database.
    // The content of the JWT is trusted as the source of truth.
    function (jwtToken, done) {
      // The `jwtToken` is the decrypted payload we stored in `createToken`.
      // It already contains the user's ID, role, email, and tenant info.
      return done(null, jwtToken);
    },
  ),
);

passport.use(
  new GoogleStrategy.Strategy(
    {
      clientID: APP_ID,
      clientSecret: APP_SECRET,
      callbackURL: REDIRECT_URI,
    },
    function (accessToken, refreshToken, profile: GoogleStrategy.Profile, cb) {
      // The user profile from Google is passed directly to the callback.
      return cb(null, { ...profile, accessToken, refreshToken });
    },
  ),
);
