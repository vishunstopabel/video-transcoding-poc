const amqp = require("amqplib");

let client = null;
let channel = null;

module.exports.connectToRabbitMq = async () => {
  try {
    if (client && channel) {
      return { client, channel };
    }

    client = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await client.createChannel();

    console.log(" Connected to RabbitMQ");

    return { client, channel };
  } catch (error) {
    console.error(" Error connecting to RabbitMQ:", error.message);
    process.exit(1);
  }
};

module.exports.getRabbitMqClient = () => {
  return { client, channel };
};
