import * as morgan from 'morgan';
import * as fs from 'fs';
import * as path from 'path';
import { RequestHandler } from 'express';

// logs klasörünü oluştur
const logDirectory = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// log dosyasını hazırla
const accessLogStream = fs.createWriteStream(
  path.join(logDirectory, 'access.log'),
  { flags: 'a' },
);

// log formatı (IP + method + path + status + süre)
const logFormat =
  '[:date[iso]] :remote-addr :method :url :status - :response-time ms';

export function createAuditLogMiddleware(): RequestHandler {
  return morgan(logFormat, {
    stream: {
      write: (message) => {
        accessLogStream.write(message);
        if (process.env.NODE_ENV === 'test') {
          console.log('[AuditLog]', message);
        } else {
          process.stdout.write(message);
        }
      },
    },
  });
}
