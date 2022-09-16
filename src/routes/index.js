import Router from '@koa/router';
import {apiRouter} from './api';

export const router = new Router();

router.get('/', (ctx) => {
  ctx.body = {message: 'base route'};
});

// all API routes should be versioned:
router.use('/api/v1', apiRouter.routes(), apiRouter.allowedMethods());
