import { connect }                   from 'amqplib';
import { Singleton, SingletonTypes } from '../frame/app';

@Singleton({ type: SingletonTypes.DataSource })
export class Rabbit {
  public con;

  constructor(protected options) {}

  async connect() {
    try {
      this.con = await connect(this.options.url);
      // console.log(await this.con.createChannel());
    }
    catch (e) {
      console.log(e);
    }
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

// async function consume() {
//   const con = await connect(url);
//   const ch = con.createChannel();
//   await ch.assertQueue(queue);
//   return ch.consume(queue, function (msg) {
//     ch.ack(msg);
//   });
// }
//
// async function main() {
//   // start the consumer
//   return consume();
// }
//
// main().catch(console.log);
