'use strict';

/**
 * `own` policy.
 */

module.exports = async (ctx, next) => {
  console.log('In own policy.');
  console.log(ctx.request)
  // Add your own logic here.

  await next();
};
