import amqplib from "amqplib/callback_api";
import nodemailer from 'nodemailer';

const newsQueue = "newsMail";
const promoQueue = "promoMail";
const statusQueue = "statusMail";

const transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 12345,
    disableFileAccess: true,
    disableUrlAccess: true,
    secure: false,
    // logger: true,
    // debug: true,
    secureConnection: false,
    auth: {
        user: 'test',
        pass: 'test',
    },
}, {
    from: 'no-reply@localhost',
});

amqplib.connect('amqp://localhost', (err, connection) => {
    if (err) {
        console.error(err.stack);
        throw err;
    }

    connection.createChannel((err, channel) => {
        if (err) {
            console.error(err.stack);
            return process.exit(1);
        }

        channel.assertQueue(newsQueue, {
            durable: true
            });
        channel.assertQueue(promoQueue);
        channel.assertQueue(statusQueue);

        channel.consume(newsQueue, (msg) => {
            if (msg) {
                const message = JSON.parse(msg.content.toString());

                transporter.sendMail(message, (err, info) => {
                    if (err) {
                        console.error(err.stack);
                        return process.exit(1);
                    }

                    console.log('Message sent successfully');
                });
            }
        }, {
            noAck: true
            });

        channel.consume(promoQueue, (msg) => {
            if (msg) {
                const message = JSON.parse(msg.content.toString());

                transporter.sendMail(message, (err, info) => {
                    if (err) {
                        console.error(err.stack);
                        return process.exit(1);
                    }

                    console.log('Message sent successfully');
                });
            }
        }, {
            noAck: true
            });

        channel.consume(statusQueue, (msg) => {
            if (msg) {
                const message = JSON.parse(msg.content.toString());

                transporter.sendMail(message, (err, info) => {
                    if (err) {
                        console.error(err.stack);
                        return process.exit(1);
                    }

                    console.log('Message sent successfully');
                });
            }
        }, {
            noAck: true
            });
        console.log('Worker is waiting for messages');
    });
});
