import rateLimit                                              from 'express-rate-limit';
import { Controller, Post, Get, Inject, Injectable, emitter } from '../frame/app';

const mw = [
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  })
];

@Injectable()
@Controller({ path: '/account', params: [], middleware: mw, mergeParams: true })
export class EthController {
  @Inject('EthWallet') eth;

  constructor() {}

  @Get('/:id', [ 'params.id', 'res' ])
  async get(id, res) {
    const balance = await this.eth.process(id);
    res.send({ balance: balance });
  }
}
