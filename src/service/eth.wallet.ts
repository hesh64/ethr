import { Injectable, Use, On } from '../frame/app';
import { CheckCacheElseCache } from '../datasource';

/**
 * Alrighty,
 *
 * so eth wallet, is a small class we use for ether account processing.
 *
 * currently it has 1 method called process only because this this challenge
 * seemed to me like it's an ETL type of problem
 *
 */
@Injectable()
export class EthWallet {
  /**
   * I didn't remove the code that I left here just because i don't want to beent the rules.
   */
  // we need rabbit mq, -> seems to be left over
  @Use('Rabbit') rabbit;
  // we need our web3 client
  @Use('Web3') web3;
  // we don't really need our lru cache my bad
  @Use('Lru') lru;

  constructor() {
  }

  @CheckCacheElseCache // checkout datasource/redis for information about this
  @On('process:account')  // this decorator will trigger this function when this even is caught
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
