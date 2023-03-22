import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map } from 'rxjs/operators';

@Injectable()
export class AppService {
  constructor(private httpService: HttpService) {}

  getHello(): string {
    return 'Hello Prolouge_test_first_commit3!';
  }

  async getExternalApiData() {
    const response = await this.httpService.get('https://0n3xhq7vnd.execute-api.us-east-1.amazonaws.com/default/python_ip').toPromise();
    return response.data;
  }
}
