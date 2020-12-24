import config                         from 'config';
import { MakePipeline, App, Routers } from '../frame/app';
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
          key: 'Rabbit',
          config: config.get('Rabbit'),
          init: async (config, Rabbit) => {
            const rabbit = new Rabbit(config);
            await rabbit.connect();
            return rabbit;
          }
        },
        {
          key: 'Redis',
          config: config.get('Redis'),
          init: async (config, Redis) => {
            const redis = new Redis(config.port);
            await redis.connect();
            await redis.client.set('test', 'value');

            return redis;
          }
        },
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
          key: 'Http',
          config: config.get('Http'),
          init: async (config, Http) => {
            const http = new Http();
            await http.attachRouters(Routers);
            await http.listen(config);
            return http;
          }
        }
      ])
    );
  }
}

export const app = new Application();

async function main() {
  await app.init();
  console.log('Lit!');
}

main().catch(console.log);
