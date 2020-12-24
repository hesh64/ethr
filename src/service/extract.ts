/**
 * gotta start somewhere,
 */
import config                  from 'config';
import { once }                from 'events';
import path                    from 'path';
import fs                      from 'fs';
import { Injectable, On, Use } from '../frame/app';

@Injectable()
export class Extract {
  @Use('Rabbit') rabbit;

  constructor(private queue = config.get('Rabbit').queue) {
  }

  @On('process')
  async process({ size, tempFilePath }) {
    try {
      let total = 0;
      const streams: any = [];
      const chunk = size / (1e1);
      // todo obvi don't do this make sure to send the right name.
      const filename = tempFilePath.split('/').slice(-1)[0];
      const _path = path.join(__filename, '../../../tmp/', filename);
      const ch = await this.rabbit.channel();

      while ((chunk + total) <= size) {
        streams.push(
          fs.createReadStream(_path, {
            start: total,
            end: total + chunk - 1,
            emitClose: true,
            // encoding: 'utf8',
            highWaterMark: 43
          }));
        total += chunk;
      }
      if (total < size) {
        streams.push(
          fs.createReadStream(_path, {
            start: total,
            end: size,
            emitClose: true,
            encoding: 'utf8',
            highWaterMark: 43
          }));
      }
      const close = streams.map(stream => once(stream, 'close'));
      setImmediate(() => {
        streams.map(stream => {
          stream.on('data', async (data) => {
            await ch.sendToQueue(this.queue, data);
          });
        });
      });

      await Promise.all(close);

    }
    catch (error) {
      console.log(error);
    }
  }
}
