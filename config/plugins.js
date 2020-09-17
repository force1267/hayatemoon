module.exports = ({ env }) => ({
    email: {
        provider: 'nodemailer',
        providerOptions: {
            host: env('SMTP_HOST', 'localhost'),
            port: env('SMTP_PORT', 25),
            auth: {
                user: env('SMTP_USERNAME'),
                pass: env('SMTP_PASSWORD'),
            },
            tls: {
                rejectUnauthorized: false
            }
            // ... any custom nodemailer options
        },
        settings: {
            defaultFrom: 'support@hayatemoon.com',
            defaultReplyTo: 'support@hayatemoon.com',
        }
    }
});