import {
  CacheInterceptor,
  Controller,
  Get,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { PokemonService } from './pokemon.service';

@Controller('pokemon')
export class PokemonController {
  constructor(private readonly service: PokemonService) {}

  @UseInterceptors(CacheInterceptor)
  @Get(':id')
  async getPokemon(@Param('id') id: number): Promise<string> {
    console.log(`Fetch`);
    return await this.service.getPokemon(id);
  }
}
