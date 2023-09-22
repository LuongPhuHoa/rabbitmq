import amqplib from "amqplib/callback_api";

const newsQueue = "newsMail";
const promoQueue = "promoMail";
const statusQueue = "statusMail";

const msg1 = { 
  to: "test@localhost",
  subject: "News Hello ",
  text: "Hello from newsMail",
};

const msg2 = { 
  to: "test@localhost",
  subject: "Promo Hello ",
  text: "Hello from promoMail",
};

const msg3 = { 
  to: "test@localhost",
  subject: "Status Hello ",
  text: "Hello from statusMail",
};

amqplib.connect('amqp://localhost', (err, connection) => {
  if (err) {
      console.error(err.stack);
      return process.exit(1);
  }

  // Create channel
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

          // Create a function to send objects to the queue
          // Javascript object is converted to JSON and then into a Buffer
          let sender = (content, next) => {
              let sent = channel.sendToQueue(newsQueue, Buffer.from(JSON.stringify(content)), {
                  // Store queued elements on disk
                  persistent: true,
                  contentType: 'application/json'
              });
              if (sent) {
                  return next();
              } else {
                  channel.once('drain', () => next());
              }
          };

          // push 100 messages to queue
          let sent = 0;
          let sendNext = () => {
              if (sent >= 1) {
                  console.log('All messages sent!');
                  // Close connection to AMQP server
                  // We need to call channel.close first, otherwise pending
                  // messages are not written to the queue
                  return channel.close(() => connection.close());
              }
              sent++;
              sender(msg1, () => sendNext());
          };

          sendNext();

      });
  });
});
