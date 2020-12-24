import { Injectable, Use, On } from '../frame/app';


@Injectable()
export class EthWallet {
  @Use('Rabbit') rabbit;
  @Use('Web3') web3;
  @Use('Lru') lru;
  constructor() {
  }

  @On('process:account')
  async process(account) {
    console.log(account)
    // console.log(await this.web3.eth.getBalance(account, 'latest'));
  }
}
