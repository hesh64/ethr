import { connect }                   from 'amqplib';
import { Singleton, SingletonTypes } from '../frame/app';

/**
 * Here is our rabbit mq class, wrapped up
 * with a few helper methods.
 */
@Singleton({ type: SingletonTypes.DataSource })
export class Rabbit {
  // actaul rabbit consumer
  public con;

  // a common channel for general operations.
  private common;

  //always good to ahve options
  constructor(protected options) {}

  // our mini toolkit helpers will inject this class into the function we defined in the pipline
  // and then we call it. Reference cluster index.
  async connect() {
    this.con = await connect(this.options.url);
    this.common = await this.channel();
  }

  //return the common channel
  get commonClient() {
    return this.common;
  }

  // create a channel, it's why but this is cleaner than calling createChannel.
  channel(): Promise<any> {
    return this.con.createChannel();
  }

  /**
   * create a function taht will execute over events for some queue
   * with it's own dedicated channel.
   *
   * channels are streams, and they can get overloaded so it's important to use
   * this method if we are going to do a lengthy / intensive operation.
   *
   * @returns {Promise<(queue, callback) => Promise<void>>}
   */
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
