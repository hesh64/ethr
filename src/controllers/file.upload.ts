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

  @Post('/', ['req', 'res', 'files' ])
  async upload(req, res, files) {
    if (files.file) {
      const { tempFilePath, size } = files.file;
      const filename = tempFilePath.split('/').slice(-1)[0];
      this.emitter.emit('extract', filename, size);
      res.sendStatus(200);
    }

    res.send(403);
  }
}
