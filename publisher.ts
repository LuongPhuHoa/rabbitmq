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


const send = async (queue: string, msg: any) => {
  await amqplib.connect("amqp://localhost", (err, connection) => {
    if (err) {
      console.error(err.stack);
      throw err;
    }

    connection.createChannel((err, channel) => {
      if (err) {
        console.error(err.stack);
        return process.exit(1);
      }

      channel.assertQueue(queue);

      channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)), {
        persistent: true,
        contentType: 'application/json'
      });
    });

    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  }); 
};

send(newsQueue, msg1);
send(promoQueue, msg2);
send(statusQueue, msg3);
