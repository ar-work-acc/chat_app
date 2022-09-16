import {User} from '../database/models';
import {logging} from '../utils/logger';
import {compare} from 'bcrypt';
import {JWT_SECRET} from '../config/index';
import jwt from 'jsonwebtoken';

const logger = logging(new URL('', import.meta.url).pathname);

/**
 * Set JWT cookie. Expires in 7 days.
 * @param {*} ctx Koa.js context
 * @param {*} user user object
 */
const setJWTCookie = (ctx, user) => {
  const token = jwt.sign(
      // send only non-sensitive info (maybe +role later for authorization)
      {_id: user._id, username: user.username},
      JWT_SECRET,
      {
        expiresIn: '7d',
      },
  );

  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies
  ctx.cookies.set('jwt', token, {
    maxAge: 1000 * 60 * 60 * 24 * 7, // expire in 7 days
    secure: true, // HTTPS only
    httpOnly: true, // so client JavaScript cannot touch the cookie
    signed: true,
    // all cookies set during the same request with the same name
    // (regardless of path or domain)
    // are filtered out of the Set-Cookie header when setting this cookie
    overwrite: true,
  });

  // since you cannot read the "jwt" cookie,
  // add another to indicate its existance:
  ctx.cookies.set('jwt-exists', 1, {
    maxAge: 1000 * 60 * 60 * 24 * 7, // expire in 7 days
    secure: true, // HTTPS only
    httpOnly: false, // need to keep track of jwt token
    signed: false,
    overwrite: true,
  });
};

/**
 * Log in controller.
 *
 * @param {Context} ctx
 */
export const login = async (ctx) => {
  const {username, password} = ctx.request.body;
  logger.debug(`User name: ${username}, password: ${password}`);

  const foundUser = await User.findOne({username}).exec();
  if (foundUser) {
    logger.debug(`Found user password: ${foundUser.password}`);
    const passwordMatches = await compare(`${password}`, foundUser.password);
    if (passwordMatches) {
      logger.debug(`User ${username} authenticated successfully!`);

      setJWTCookie(ctx, foundUser);

      ctx.body = {
        message: 'User authenticated.',
      };

      return;
    }
  }

  // if you're still here, log in failed, return 401:
  logger.debug(`Authentication failed!`);
  ctx.status = 401;
  ctx.body = {
    token: null,
    message: 'User authentication failed!',
  };
};

/**
 * Log out. Just delete the JWT token cookie.
 * @param {*} ctx
 */
export const logout = async (ctx) => {
  logger.debug(`${ctx.state.user.username} logging out, deleting JWT cookies.`);
  ctx.cookies.set('jwt');
  ctx.cookies.set('jwt.sig');
  ctx.cookies.set('jwt-exists');

  ctx.status = 200;
  ctx.body = {
    message: `User ${ctx.state.user.username} successfully logged out.`,
  };
};

/**
 * Get current user information.
 * User information might be changed so query the DB and get it.
 *
 * @param {*} ctx
 */
export const getUserInfo = async (ctx) => {
  // get updated user, exclude password field
  const user = await User.findById(ctx.state.user._id).select('-password');
  if (user === null) {
    ctx.throw(401, 'Access denied! Cannot find user.');
  }
  ctx.body = user;
};

/**
 * OAuth sign in with Google (1) or Facebook (2)
 * @param {*} ctx
 */
export const oauthSignIn = async (ctx) => {
  const {
    email,
    firstName,
    lastName,
    avatar,
    accountType = 1,
  } = ctx.request.body;

  let user = await User.findOne({username: email}).exec();

  if (user === null) {
    // user is not created yet
    logger.debug(
        `Creating new account from Oauth: ${email}, type = ${accountType}`,
    );
    user = await new User({
      username: email,
      firstName,
      lastName,
      avatar,
      googleAccountConnected: accountType == 1,
      facebookAccountConnected: accountType === 2,
    }).save();
  } else {
    // the user already exists:

    // connect Google Account
    if (user.googleAccountConnected == false && accountType == 1) {
      user.googleAccountConnected = true;
      await user.save();
    }

    // connect FB account
    if (user.facebookAccountConnected === false && accountType == 2) {
      user.facebookAccountConnected = true;
      await user.save();
    }
  }

  setJWTCookie(ctx, user);

  ctx.body = {
    message: `User authenticated with OAuth, type = ${accountType}`,
  };
};
