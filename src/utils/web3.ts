import { Singleton, SingletonTypes } from '../frame/app';

@Singleton({ type: SingletonTypes.DataSource })
export class Web3 {
  private web;

  constructor(private config) {}

  public async init() {
    this.web = new Web3(this.config.url);
  }

  public get client() {
    return this.web;
  }
}
