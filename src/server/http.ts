import express, { IRouter } from 'express';
import { Singleton }        from '../frame/app';
import { SingletonTypes }   from '../frame/injectable';

/**
 * I kept it pretty simple, obviously plenty we can do here
 *
 * we initialized our express app, we go ahead and attach all those different
 * controllers we created to our express app using the attach router then we
 * call listen to start receiving requests
 */
@Singleton({ type: SingletonTypes.Server })
export class Http {
  public server = express();

  constructor() {
  }

  /**
   * can probably be handeled behind the scene but all this does is it takes a controller's generated router,
   * and sorts it with all the other controllers then attaches it onto the server.
   *
   * @param routers
   */
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
