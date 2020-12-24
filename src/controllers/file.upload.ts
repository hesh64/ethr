import path                                           from 'path';
import { EventEmitter }                               from 'events';
import fileUpload                                     from 'express-fileupload';
import bodyParser                                     from 'body-parser';
import { Controller, Post, Get, Injectable, emitter } from '../frame/app';

const relativePath = path.join(__filename, '../../../tmp/');

// middleware
const mw = [
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
@Controller({ path: '/file-upload', params: [], middleware: mw, mergeParams: true })
export class FileUpload {
  constructor(@emitter private emitter: EventEmitter) {}

  @Get('/', [ 'res' ])
  get(res) {
    res.send('ok');
  }

  @Post('/', [ 'res', 'files' ])
  async upload(res, files) {
    if (files.file) {
      this.emitter.emit('process', files.file);
      res.sendStatus(200);
    }

    res.send(403);
  }
}
