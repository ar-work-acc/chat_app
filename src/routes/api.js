/**
 * Routes under /api/v1.
 */
import Router from '@koa/router';
import jwtMiddleware from 'koa-jwt';
import {JWT_SECRET} from '../config/index';
import {getUserInfo, oauthSignIn, login, logout} from '../controllers/login';
import {
  acceptFriendRequest,
  addFriendRequest,
  getFriendData,
  getFriendRequests,
  getFriends,
  getMessages,
  getNonFriendUsers,
  getUserFriendRequest,
} from '../controllers/friend';

export const apiRouter = new Router();

// these endpoints can be accessed by anyone
apiRouter.get('/', (ctx) => {
  ctx.body = {message: 'base API route'};
});
apiRouter.post('/login', login);
apiRouter.post('/oauth-sign-in', oauthSignIn);

/**
 * Middleware: below this line is only reached if JWT token is valid.
 * */
apiRouter.use(jwtMiddleware({secret: JWT_SECRET, cookie: 'jwt'}));

// logout: set jwt cookie to undefined
apiRouter.post('/logout', logout);

// get current logged in user info
apiRouter.get('/user', getUserInfo);

/**
 * Friends and messages.
 */

// get friends
apiRouter.get('/friends', getFriends);

apiRouter.get('/friends/:friendId', getFriendData);

// get messages
apiRouter.get('/messages/:friendId', getMessages);

// get users that are not friends
apiRouter.get('/non-friends', getNonFriendUsers);

// send a friend request
apiRouter.post('/add-friend-request', addFriendRequest);

// get friend requests
apiRouter.get('/friend-requests', getFriendRequests);

// get user sent friend requests
apiRouter.get('/user-friend-requests', getUserFriendRequest);

// accept friend request
apiRouter.post('/accept-friend-request', acceptFriendRequest);
