/**
 * gotta start somewhere,
 */
import config                  from 'config';
import path                    from 'path';
import fs                      from 'fs';
import { Readable }            from 'stream';
import { Injectable, On, Use } from '../frame/app';

/**
 * the extract call.
 *
 * Named for the fact that all it does is read an account out of a file, then enqueues it for processing
 *
 */
@Injectable()
export class Extract {
  @Use('Rabbit') rabbit;

  // nice this about the config module is it throws when it doesn't find the value passed.
  constructor(private queue = config.get('Rabbit').queue) {
  }

  // return the full path to a file.
  getPath(filename) {
    // could have put this in the config. Sorry about that.
    return path.join(__filename, '../../../tmp/', filename);
  }

  // create a read stream from a file.
  generateStream(filename,): Readable {
    const path = this.getPath(filename);

    return fs.createReadStream(path, {
      start: 0,
      emitClose: true,
      highWaterMark: 43
    });
  }

  // on the event extract, go ahead and trigger this function
  @On('extract')
  async extract(filename) {
    try {
      // got the stream
      const stream: Readable = this.generateStream(filename);
      // get me a dedicated channel
      const ch = await this.rabbit.channel();
      // when rabbit mq let's me know that it's ok to start enqueueing again then resume the stream
      ch.on('drain', () => {
        stream.resume();
      });
      stream.on('data', async (data) => {
        // ENQUEUE EVERYTHING!!!
        const r = await ch.sendToQueue(this.queue, data);
        // oh wait sendToQueue returned false? Must be overwhelmed it's ok
        // let's take a break, will resume once it drains.
        if (!r) {
          stream.pause();
        }
      });
      // await this method, and it will either throw on error, or return <void> --> looking back at it i
      // could have returned more than just void smh.
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
