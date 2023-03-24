import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class PokemonService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
  ) {}

  async getPokemon(id: number): Promise<string> {
    // check if data is in cache:
    console.log(id);
    const cachedData = await this.cacheService.get(
      id.toString(),
    );
    if (cachedData) {
      console.log(`Fetch from cache`);
      return `${cachedData}`;
    }

    // if not, call API and set the cache:
    console.log(`Fetch from API`);
    const { data } = await this.httpService.axiosRef.get(
      `https://pokeapi.co/api/v2/pokemon/${id}`,
    );
    await this.cacheService.set(id.toString(), data.name);
    await this.cacheService.set("123", "teststring");
    return await `${data.name}`;
  }
}
