import {HttpError} from 'koa';

export const jwtErrorSuppressor = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof HttpError && 401 == err.status) {
      console.error(`401 Unauthorized: ${ctx.method} ${ctx.url}`);
      ctx.status = 401;
      ctx.body = {
        message: 'Protected resource, use Authorization header to get access',
      };
    } else {
      throw err;
    }
  }
};
