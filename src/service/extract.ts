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

  getPath(filename) {
    return path.join(__filename, '../../../tmp/', filename);
  }

  generateChunkedStreams(filename, size, chunk) {
    const path = this.getPath(filename);
    const streams: any = [];
    let total = 0;

    while ((chunk + total) <= size) {
      streams.push(
        fs.createReadStream(path, {
          start: total,
          end: total + chunk - 1,
          emitClose: true,
          highWaterMark: 43
        }));
      total += chunk;
    }
    if (total < size) {
      streams.push(
        fs.createReadStream(path, {
          start: total,
          end: size,
          emitClose: true,
          highWaterMark: 43
        }));
    }

    return streams;
  }

  @On('extract')
  async extract(filename, size) {
    try {
      const chunk = size / (1e1);
      const streams = this.generateChunkedStreams(filename, size, chunk);
      const ch = await this.rabbit.channel();
      streams.map(stream => stream.on('error', error => console.log('error', error)));
      const close = streams.map(stream => once(stream, 'close'));

      setImmediate(() => {
        streams.map(stream => {
          stream.on('data', async (data) => {
            try {
              await ch.sendToQueue(this.queue, data);
            }
            catch (e) {
              console.log(e);
            }
          });
        });
      });

      await Promise.all(close);
      console.log('done');
    }
    catch (error) {
      // retry logic
      // report the error
      console.log(error);
    }
  }
}
