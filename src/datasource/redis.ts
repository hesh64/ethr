import _Redis                                          from 'ioredis';
import { Singleton, SingletonTypes, CustomDecFactory } from '../frame/app';

// Another day another data datasource.
/**
 * this is for our redis.
 */
@Singleton({ type: SingletonTypes.DataSource })
export class Redis {
  public con;

  constructor(protected options) {}

  // we call this on connect
  async connect() {
    this.con = new _Redis();
  }

  // get the client back. nothing fancy.
  get client() {
    return this.con;
  }
}


/**
 * Ah yes.
 *
 * alrighty so we want to go ahead and wrap a method such that:
 * when that method is called, we first
 * => lookup redis for a record who's id matches the value in the first argument passed into the method
 * => if found return the record,
 *    else execute the method in the usual way and proceed to chache its result under the value in the
 *      first argument passed into the method.
 */
export const CheckCacheElseCache = CustomDecFactory((injectables, singleton, singletonStore) => {
  return (inst, p, desc) => {
    const { value } = desc;
    desc.value = async function (key: string, ...args) {
      const store = singletonStore[Redis.name];

      let result;
      try {
        result = await store.client.get(key);

        if (!result || result && result.length == 0) {
          result = await value.apply(this, [key, ...args]);
        }

        return result;
      }

      finally {
        // cache for an hour
        await store.client.set(key, result, 'ex', 60 * 60);
      }
    };
  };
});
