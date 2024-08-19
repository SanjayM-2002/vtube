const { Kafka } = require('kafkajs');

class KafkaConfig {
  constructor() {
    this.kafka = new Kafka({
      clientId: 'youtube-uploader',
      brokers: ['localhost:9092'],
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: 'youtube-uploader' });
  }

  async produce(topic, messages) {
    try {
      const result = await this.producer.connect();
      console.log('Kafka connected... : ', result);
      await this.producer.send({
        topic: topic,
        messages: messages,
      });
    } catch (error) {
      console.log(error);
    } finally {
      await this.producer.disconnect();
    }
  }

  async consume(topic, callback) {
    try {
      await this.consumer.connect();
      await this.consumer.subscribe({ topic: topic, fromBeginning: true });
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          // console.log(`Received message: ${message.value.toString()}`);
          const value = message.value.toString();
          callback(value);
        },
      });
    } catch (error) {
      console.log(error);
    }
  }
}
module.exports = { KafkaConfig };
