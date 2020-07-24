module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', '1f1ef58e4c3b9d2f4a0cbbf0ff8ec875'),
    },
  },
});
