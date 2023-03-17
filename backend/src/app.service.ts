import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello Prolouge_test_first_commit2!';
  }
}
