/**
 * gotta start somewhere,
 */
import config                  from 'config';
import path                    from 'path';
import fs                      from 'fs';
import { Readable }            from 'stream';
import { Injectable, On, Use } from '../frame/app';

@Injectable()
export class Extract {
  @Use('Rabbit') rabbit;

  constructor(private queue = config.get('Rabbit').queue) {
  }

  getPath(filename) {
    return path.join(__filename, '../../../tmp/', filename);
  }

  generateStream(filename,): Readable {
    const path = this.getPath(filename);

    return fs.createReadStream(path, {
      start: 0,
      emitClose: true,
      highWaterMark: 43
    });
  }

  @On('extract')
  async extract(filename) {
    try {
      const stream: Readable = this.generateStream(filename);
      const ch = await this.rabbit.channel();
      ch.on('drain', () => {
        stream.resume();
      });
      stream.on('data', async (data) => {
        const r = await ch.sendToQueue(this.queue, data);
        if (!r) {
          stream.pause();
        }
      });
      return new Promise<void>(async (resolve, reject) => {
        stream.on('error', (error) => {
          reject(error);
        });
        stream.on('end', () => {
          resolve();
        });
      });
    }
    catch (error) {
      console.log(error);
    }
  }
}
