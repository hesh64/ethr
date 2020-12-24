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
    try {
      const cs = this.web3.utils.toChecksumAddress(account);
      const t = await this.web3.ethClient.getBalance(cs, 'latest');
      return t;
    }
    catch (e) {
      console.log('err', e);
    }
  }
}
