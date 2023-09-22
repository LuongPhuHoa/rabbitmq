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

        // Ensure queue for messages
        channel.assertQueue(newsQueue, {
            // Ensure that the queue is not deleted when server restarts
            durable: true
        }, err => {
            if (err) {
                console.error(err.stack);
                return process.exit(1);
            }

            // Only request 1 unacked message from queue
            // This value indicates how many messages we want to process in parallel
            channel.prefetch(1);

            // Set up callback to handle messages received from the queue
            channel.consume(newsQueue, data => {
                if (data === null) {
                    return;
                }

                // Decode message contents
                let message = JSON.parse(data.content.toString());

                // attach message specific authentication options
                // this is needed if you want to send different messages from
                // different user accounts
                message.auth = {
                    user: 'testuser',
                    pass: 'testpass'
                };

                // Send the message using the previously set up Nodemailer transport
                transporter.sendMail(message, (err, info) => {
                    if (err) {
                        console.error(err.stack);
                        // put the failed message item back to queue
                        return channel.nack(data);
                    }
                    console.log('Delivered message %s', info.messageId);
                    // remove message item from the queue
                    channel.ack(data);
                });
            });
        });
    });
});
