import config                         from 'config';
import { MakePipeline, App, Routers } from '../frame/app';
import '../controllers';
import '../service';
import '../server';
import '../datasource';

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
  console.log('Lit!');
  await app.init();
}

main().catch(console.log);
