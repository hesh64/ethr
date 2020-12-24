import express, { IRouter } from 'express';
import { Singleton }        from '../frame/app';
import { SingletonTypes }   from '../frame/injectable';

@Singleton({ type: SingletonTypes.Server })
export class Http {
  public server = express();

  constructor() {
  }

  public attachRouters(routers: { [key: string]: IRouter }) {
    const router = express.Router({ mergeParams: true });
    // gotta sort them routes
    const keys = Object.keys(routers).sort((k1, k2) => k1 < k2 ? -1 : 1);
    keys.forEach(key => router.use(key, routers[key]));
    this.server.use(router);
  }

  public listen(config) {
    return new Promise<void>((resolve, reject) => {
      //@ts-ignore
      this.server.listen(config.port, (error) => {
        if (error) {
          return reject(error);
        }
        return resolve();
      });
    });
  }
}
