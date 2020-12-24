import { Injectable, Use, On } from '../frame/app';
import { CheckCacheElseCache } from '../datasource';

@Injectable()
export class EthWallet {
  @Use('Rabbit') rabbit;
  @Use('Web3') web3;
  @Use('Lru') lru;

  constructor() {
  }

  @CheckCacheElseCache
  @On('process:account')
  async process(account) {
    return this.web3.ethClient.getBalance(account, 'latest');
  }
}
