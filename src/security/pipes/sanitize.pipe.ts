import { PipeTransform, Injectable } from '@nestjs/common';
import { sanitizeInput } from '../utils/sanitize-input';

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any): any {
    return sanitizeInput(value);
  }
}
