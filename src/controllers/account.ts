import { EventEmitter }                                       from 'events';
import { Controller, Post, Get, Inject, Injectable, emitter } from '../frame/app';

@Injectable()
@Controller({ path: '/account', params: [], middleware: [], mergeParams: true })
export class EthController {
  @Inject('EthWallet') eth;

  constructor(@emitter private emitter: EventEmitter) {}

  @Get('/:id', [ 'id', 'res' ])
  async get(id, res) {
    const balance = this.eth.process(id);
    res.send({ balance: balance });
  }
}
