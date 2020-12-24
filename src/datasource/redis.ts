import _Redis                                          from 'ioredis';
import { Singleton, SingletonTypes, CustomDecFactory } from '../frame/app';

@Singleton({ type: SingletonTypes.DataSource })
export class Redis {
  public con;

  constructor(protected options) {}

  async connect() {
    this.con = new _Redis();
  }

  get client() {
    return this.con;
  }
}


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
