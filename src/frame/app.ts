import {
  SingletonFactory,
  InjectableFactory,
  ControllerFactory,
  SingletonTypes,
  Emitter as _Emitter,
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
