import { connect }                   from 'amqplib';
import { Singleton, SingletonTypes } from '../frame/app';

@Singleton({ type: SingletonTypes.DataSource })
export class Rabbit {
  public con;

  constructor(protected options) {}

  async connect() {
    this.con = await connect(this.options.url);
  }

  channel(): Promise<any> {
    return this.con.createChannel();
    // return new Promise((resolve, reject) => {
    //   this.con.createChannel((err, ch) => {
    //     reject(err);
    //     resolve(ch);
    //   });
    // });
  }

  async getConsumer() {
    const channel = await this.channel();
    channel.assertQueue(this.options.queue);
    // call it and you should get events
    return async (queue, callback) => {
      channel.consume(queue, (...args) => {
        try {
          callback(channel, args);
        }
        catch (error) {
          // todo add some real logging,
          console.log(error);
        }
      });
    };
  }
}
