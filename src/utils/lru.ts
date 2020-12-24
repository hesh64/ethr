import Lru                           from 'lru-cache';
import { Singleton, SingletonTypes } from '../frame/app';


@Singleton({type: SingletonTypes.DataSource})
export class Lru {
  private lru;
  constructor(private config) {}

  init() {
    // this.lru = Lru({
    //
    // })
  }
}
