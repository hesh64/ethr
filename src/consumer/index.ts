import config                                             from 'config';
import { Singleton, MakePipeline, App, Routers, emitter } from '../frame/app';
import '../controllers';
import '../service';
import '../server';
import '../datasource';
import '../utils';

class Application extends App {
  constructor() {
    super(
      MakePipeline([
        {
          key: 'Web3',
          config: config.get('Web3'),
          init: async (config, Web3) => {
            const web3 = new Web3(config);
            await web3.init();
            return web3;
          }
        },
        {
          key: 'Rabbit',
          config: config.get('Rabbit'),
          init: async (config, Rabbit) => {
            const rabbit = new Rabbit(config);
            await rabbit.connect();
            const consumer = await rabbit.getConsumer();
            await consumer(config.queue, async (channel, [ message ]) => {
              try {
                if (message && message.content) {
                  await this.digest<any>({
                    // todo this is not needed I need to adjust the type
                    //  definition
                    replyTo: true,
                    execRef: {
                      ctor: 'EthWallet',
                      ctorArgs: [],
                      fn: 'process',
                      fnArgs: [message.content.toString()]
                    },
                    callerContext: {}
                  });
                  await channel.ack(message)
                }
              }
              catch (error) {
                console.log(error);
              }
            });
            return rabbit;
          }
        },
      ])
    );
  }

}

export const app = new Application();

async function main() {
  console.log('Lit!');
  await app.init();
}

main().catch(console.log);
