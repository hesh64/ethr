import rateLimit                                              from 'express-rate-limit';
import { Controller, Post, Get, Inject, Injectable, emitter } from '../frame/app';

const mw = [
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  })
];


/**
 * You gotta admit @Injectable sounds pretty cool
 *
 * Essentially an injectable is anything that can be instantiated elsewhere in the application
 *
 * Controller -- that's a 'router' in express. Pass in the base path, any parameters that you might wanna deal with on the
 * whole router level instead of the route level, middleware and router config.
 *
 */
@Injectable()
@Controller({ path: '/account', params: [], middleware: mw, mergeParams: true })
export class EthController {
   // EthWallet, another injectable, getting injected into this class.
   @Inject('EthWallet') eth;

  constructor() {}

  // a get route on an account with it's id
  // what i pass in the param array, get's selected out of the request response objects in the read route.
  @Get('/:id', [ 'params.id', 'res' ])
  async get(id, res) {
    const balance = await this.eth.process(id);
    res.send({ balance: balance });
  }
}
