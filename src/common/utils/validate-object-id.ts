import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import mongoose, { isValidObjectId } from 'mongoose';

@Injectable()
export class ValidateObjectIdPipe implements PipeTransform {
  transform(value: string) {
    if (!isValidObjectId(value)) {
      throw new BadRequestException(`${value} is not a valid ObjectId`);
    }
    return new mongoose.Types.ObjectId(value);
  }
}
