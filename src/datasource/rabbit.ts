import { connect }                   from 'amqplib';
import { Singleton, SingletonTypes } from '../frame/app';

@Singleton({ type: SingletonTypes.DataSource })
export class Rabbit {
  public con;

  private common;

  constructor(protected options) {}

  async connect() {
    this.con = await connect(this.options.url);
    this.common = await this.channel();
  }

  get commonClient() {
    return this.common;
  }

  channel(): Promise<any> {
    return this.con.createChannel();

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
