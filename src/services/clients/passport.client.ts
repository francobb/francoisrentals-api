import passport from 'passport';
import passportJwt from 'passport-jwt';
import LocalStrategy from 'passport-local';
import GoogleStrategy from 'passport-google-oauth20';
import { APP_ID, APP_SECRET, REDIRECT_URI, SECRET_KEY } from '@config';
import AuthService from '@services/auth.service';
import UserService from '@services/users.service';

const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

passport.use(
  new LocalStrategy.Strategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, cb) => {
      try {
        const value = await new AuthService().login({ email, password });
        return cb(null, { ...value });
      } catch (e) {
        return cb(e);
      }
    },
  ),
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: SECRET_KEY,
    },
    async function (jwtToken, done) {
      try {
        const value = await new UserService().findUserById(jwtToken._id);
        return done(undefined, value, jwtToken);
      } catch (e) {
        return done(e, false);
      }
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
      return cb(null, { ...profile, accessToken, refreshToken });
    },
  ),
);
