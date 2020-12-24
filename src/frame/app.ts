import express, { IRouter } from 'express';
import {
  SingletonFactory,
  InjectableFactory,
  ControllerFactory,
  SingletonTypes,
  Emitter as _Emitter,
  singletonStore,
}                           from './injectable';
import type { // I aint got no type
  Pipeline,
  CallerContext
}                           from './injectable';


// PAP POOP PEEP
const _emitter = new _Emitter();

export {
  SingletonTypes
};

/**
 * Cool stuff
 *
 */
export const { Inject, Injectable } = InjectableFactory();
export const { Singleton, MakePipeline, Use } = SingletonFactory();
export const { Routers, Route, Controller } = ControllerFactory(_emitter);
export const Get = (path = '/', params: string[] = [], middleware = []) => {
  return Route({
    action: 'get', path, params, middleware
  });
};
export const Post = (path = '/', params: string[] = [], middleware = []) => {
  return Route({
    action: 'post', path, params, middleware
  });
};
export const On = _emitter.OnDecFactory();
export const emitter = _emitter.EmitterParamDecFactory();

/**
 * Base App
 */
export class App {
  private emitter = _emitter;

  constructor(private pipeline: Pipeline) {}

  async init() {
    try {
      await this.pipeline();
    }
    catch (error) {
      console.log(error);
      process.exit(-1);
    }
  }

  // todo add a shutfown method

  digest<T>(context: CallerContext<T>) {
    return this.emitter.digest(context);
  }
}

// @Injectable()
// class Temp {
//   fun1() {
//
//   }
// }
//
// @Controller({ path: '/file-upload', params: [], middleware: [], mergeParams: true })
// class FileUpdate {
//   @Inject('Temp') temp;
//
//   @Get()
//   findById() {
//     return 1;
//   }
// }
//
// @Injectable()
// @Controller({ path: '/app', params: [], middleware: [], mergeParams: true })
// class table {
//   @Inject('Temp') temp;
//
//   @Get('/:id', [ 'res', 'params.id' ])
//   findById(res, id) {
//     res.send('Heyyy')
//   }
// }
//
// @Singleton({ type: SingletonTypes.Server })
// class Http {
//   public server = express();
//   constructor() {
//   }
//
//   public attachRouters(routers: { [key: string]: IRouter }) {
//     // gotta sort them routes
//     const keys = Object.keys(routers).sort((k1, k2) => k1 < k2 ? -1 : 1);
//     console.log(keys);
//     keys.forEach(key => {
//       this.server.use(key, routers[key]);
//     });
//   }
//
//   public listen(config) {
//     return new Promise<void>((resolve, reject) => {
//       //@ts-ignore
//       this.server.listen(config.port, (error) => {
//         if (error) {
//           return reject(error);
//         }
//         console.log('listening on', config.port);
//         return resolve();
//       });
//     });
//   }
// }
//
// const pipeline = MakePipeline([
//   {
//     key: 'Http',
//     config: { port: 9991 },
//     init: async (config, Http) => {
//       const http = new Http();
//       await http.listen(config);
//       await http.attachRouters(Routers);
//       return http;
//     }
//   }
// ]);
//
// pipeline().then(() => console.log()).catch(console.log);
// //
