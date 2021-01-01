import path                                       from 'path';
import fileUpload                                 from 'express-fileupload';
import bodyParser                                 from 'body-parser';
import { Controller, Post, Get, Injectable, Use } from '../frame/app';

const relativePath = path.join(__filename, '../../../tmp/');

// middleware
/**
 * let's prep our middleware
 */
const mw = [
  // file upload middleware, i am having it write to a local temp file, but i figured it's appropriate
  // for the time being.
  fileUpload({
    safeFileNames: true,
    useTempFiles: true,
    tempFileDir: relativePath,
    createParentPath: true
  }),
  bodyParser.json(),
  bodyParser.urlencoded({ extended: true })
];

@Injectable()
@Controller({ path: '/file-upload', params: [], middleware: mw, mergeParams: true }) // neat.
export class FileUpload {
  constructor() {}

  /**
   * Rabbit is a singleton.
   * We don't instantiate a new instance of rabbit each time, instead we use a reference to it
   *
   *
   */
  @Use('Rabbit') rmq;

  //health check
  @Get('/', [ 'res' ])
  get(res) {
    res.send('ok');
  }

  //upload a file, then enqueue the file name.
  //remember how in teh cluster module we instantiated a listener for the file queue that will
  //start a processing job for a file that got saved?
  //wouldn't save the files locally for the real solution
  /**
   * ***********  Hit this endpoint with a file using postman ***********
   */
  @Post('/', [ 'req', 'res', 'files' ])
  async upload(req, res, files) {
    if (files.file) {
      const { tempFilePath } = files.file;
      // clean out the name before sending it.
      const filename = tempFilePath.split('/').slice(-1)[0];
      // keep it simple.
      await this.rmq.commonClient.sendToQueue('files', Buffer.from(filename));
      res.sendStatus(200);
    }

    res.send(403);
  }
}
