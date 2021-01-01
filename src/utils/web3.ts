import _Web3 from 'web3';

import { Singleton, SingletonTypes } from '../frame/app';

/**
 * Alrighty
 *
 * Web3
 *
 * Just a quick interface into the accounting system
 *
 * We make use of two main packages -- utils, and eth
 *
 * so I just made them available in a nice way.
 */
@Singleton({ type: SingletonTypes.DataSource })
export class Web3 {
  private web;

  constructor(private config) {}

  public async init() {
    this.web = new _Web3(this.config.url);
  }

  public get client() {
    return this.web;
  }

  public get utils() {
    return this.client.utils;
  }

  public get ethClient() {
    return this.client.eth;
  }
}
