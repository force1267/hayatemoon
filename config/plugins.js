module.exports = ({ env }) => ({
    email: {
        provider: 'nodemailer',
        providerOptions: {
            host: env('SMTP_HOST', '192.168.150.10'),
            port: env('SMTP_PORT', 25),
            auth: {
                user: env('SMTP_USERNAME'),
                pass: env('SMTP_PASSWORD'),
            },
            secure: false,
            ignoreTLS: true,
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