import 'reflect-metadata';
import { randomBytes }              from 'crypto';
import { EventEmitter }             from 'events';
import express, { IRouter, Router } from 'express';
import _                            from 'lodash';


/// we are gonna cache everything under here.
export const key = Symbol('Ether');
// injectable constructors
export const injectables: { [k: string]: { new(...args: any[]): any } } = {};
// singleton constructors
export const singletons = {};
// cached singleton instances
export const singletonStore = {};

export const getMetaElseInit = (key, ctor, p?) => {
  if (!(p ? Reflect.hasMetadata(key, ctor, p) : Reflect.hasMetadata(key, ctor))) {
    p ? Reflect.defineMetadata(key, {}, ctor, p) :
      Reflect.defineMetadata(key, {}, ctor);
  }
  return p ? Reflect.getMetadata(key, ctor, p) : Reflect.getMetadata(key, ctor);
};

export const proxyConstructor = (ctor) => {
  return new Proxy(ctor, {
    construct(target: any, argArray: any, newTarget?: any): object {
      const meta = getMetaElseInit(key, target.prototype);
      meta.argList ??= [];
      meta.argList.forEach((k, i) => {
        if (k) {
          argArray[i] = k;
        }
      });
      const t = Reflect.construct(target, argArray);
      // attach injectables
      meta.injectables && meta.injectables.forEach(({ p, name }) => {
        t[p] = Reflect.construct(injectables[name], []);
      });

      //attach singletons
      meta.singletons && meta.singletons.forEach(({ p, name }) => {
        t[p] = singletonStore[name];
      });

      return t;
    }
  });
};

export type ExecutionContext = {
  ctor: string;
  ctorArgs: any[];
  fn: string;
  fnArgs: any[];
}

export type EventedContext = {}

export type CallerContext<T> = {
  replyTo: boolean | string;
  execRef: ExecutionContext;
  callerContext: T
}

// extend the event emitter just for now.
// maybe I'll remove it later
export class Emitter extends EventEmitter {
  async digest<T>(context: CallerContext<T>) {
    if (typeof context.replyTo == 'boolean' && context.replyTo) {
      context.replyTo = randomBytes(16).toString();
    }
    const { execRef } = context;
    const inst = Reflect.construct(
      injectables[execRef.ctor],
      execRef.ctorArgs
    );

    try {
      return await Promise.resolve(inst[execRef.fn](...execRef.fnArgs));
    }
    catch (error) {
      return error;
    }
  }

  OnDecFactory() {
    return (event: string) => (inst, p, desc) => {
      this.on(event, async (...args: any[]) => {
        try {
          const context: CallerContext<EventedContext> = {
            replyTo: false,
            execRef: {
              ctor: inst.constructor.name,
              ctorArgs: [],
              fn: p,
              fnArgs: args
            },
            callerContext: {}
          };
          await this.digest(context);
        }
        catch (e) {
          console.log('error @OnDecorator', e);
        }
      });
    };
  }

  EmitterParamDecFactory() {
    return (inst, p, idx) => {
      const meta = getMetaElseInit(key, inst.prototype, p);
      meta.argList ??= [];
      meta.argList[idx] = this;
    };
  }
}


/**
 *
 * Just to make it a little easier to deal with starting up the app
 *
 */
export function InjectableFactory() {
  return {
    Injectable: () => (ctor) => {
      injectables[ctor.name] = proxyConstructor(ctor);
      const name = ctor.name;
      Reflect.defineProperty(injectables[ctor.name], 'name', {
        get() {
          return name;
        }
      });
      return injectables[ctor.name];
    },
    Inject: (name: string) => {
      return (inst, p) => {
        const meta = getMetaElseInit(key, inst);
        meta.injectables ??= [];
        meta.injectables.push({ p, name });
      };
    },
  };
}

export enum SingletonTypes {
  DataSource = 'dataSource',
  Server = 'server'
}

export type SingletonConfig = {
  type: SingletonTypes
};

export type Pipeline = () => Promise<any>

export function SingletonFactory() {
  return {
    Singleton: (config: SingletonConfig) => {
      return (ctor) => {
        const name = ctor.name;
        singletons[name] = new Proxy(ctor, {
          construct(target: any, argArray: any, newTarget?: any): object {
            // if (singletonStore[ctor.name]) {
            //   return singletonStore[ctor.name];
            // }
            singletonStore[ctor.name] = Reflect.construct(target, argArray);
            return singletonStore[ctor.name];
          }
        });
        Reflect.defineProperty(singletons[ctor.name], 'name', {
          get() {
            return name;
          }
        });
      };
    },
    Use: (name: string) => {
      return (inst, p) => {
        const meta = getMetaElseInit(key, inst);
        meta.singletons ??= [];
        meta.singletons.push({ p: p, name });
      };
    },

    MakePipeline: (resources: ({ key: string, config, init: (config, ctor) => Promise<any> })[]) => {
      // make it, then call it later.
      return (async () => {
        for await (const { key, config, init } of resources) {
          const ctor = singletons[key];
          const inst = await init(config, ctor);
          singletonStore[ctor.name] = inst;
        }
      }) as Pipeline;
    }
  };
}

export type ControllerConfig = {
  path: string;
  middleware: ((...args) => void)[];
  mergeParams: boolean;
  params: string[];
};

export type RouteConfig = {
  path: string;
  action: string | 'get' | 'post';
  params: string[]
  middleware: ((...args) => void)[];
}

export type RestCallerContext = {}

export function ControllerFactory(emitter: Emitter) {
  const key = Symbol('controller');
  const Routers = {};
  const getParams = (params, requestContext) => {
    // let not worry about binding functions
    // just assume you either ask to get back the whole req/res/next
    // or you just want to get a property off of the req.
    return params.map(param => {
      if (~[ 'req', 'res', 'next' ].indexOf(param)) {
        return requestContext[param];
      }
      return _.get(requestContext.req, param);
    });
  };

  return {
    Routers,
    Controller: (controllerConfig: ControllerConfig) => {
      return (ctor) => {
        const router = express.Router({ mergeParams: controllerConfig.mergeParams });
        controllerConfig.middleware.forEach(md => router.use(md));
        Routers[controllerConfig.path] = Reflect
          .ownKeys(ctor.prototype)
          .map(propKey => ({
            routeConfig: getMetaElseInit(key, ctor.prototype, propKey).routeConfig as RouteConfig,
            method: propKey
          }))
          .filter(t => Boolean(t.routeConfig))
          .reduce((router: IRouter, config) => {
            const { method, routeConfig } = config;
            router[routeConfig.action](routeConfig.path, routeConfig.middleware, async (req, res, next) => {
              const ctorArgs = getParams(controllerConfig.params, { req, res, next });
              const fnArgs = getParams(routeConfig.params, { req, res, next });
              const context: CallerContext<RestCallerContext> = {
                replyTo: true,
                execRef: {
                  ctor: ctor.name,
                  ctorArgs: ctorArgs,
                  fn: method as string,
                  fnArgs: fnArgs
                },
                callerContext: {
                  // idk maybe session ?
                }
              };

              // for the time being
              const r = await emitter.digest(context);
              if (req.writableEnded) {
                res.send(r);
              }
            });
            return router;
          }, router);
      };
    },

    //get post del put
    Route: (config: Partial<RouteConfig>) => {
      return (inst, p, desc) => {
        if (!config.path) {
          config.path = '/';
        }
        config.params ??= [];
        config.middleware ??= [];
        const meta = getMetaElseInit(key, inst, p);
        meta.routeConfig = config;
      };
    }
  };
}


/**
 * for now we will only support making custom method decorators.
 * @param fn
 * @returns {any}
 * @constructor
 */
export function CustomDecFactory(fn) {
  return fn(injectables, singletons, singletonStore);
}
