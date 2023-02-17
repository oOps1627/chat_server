import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  InternalServerErrorException
} from "@nestjs/common";
import { MongoError } from 'mongodb';

interface IExceptionsDictionary {
  [code: number | string]: string;
}

@Catch()
export class MongoExceptionFilter implements ExceptionFilter {
 //constructor(exceptionsDictionary: IExceptionsDictionary = {}) {
   // const a = new BadRequestException('ss');
 // }

  catch(exception: MongoError, host: ArgumentsHost) {
    switch (exception.code) {
      case 11000:
      throw new BadRequestException('ss');
      default:
        throw new InternalServerErrorException('Internal server error');
    }
  }
}
