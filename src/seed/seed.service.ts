import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { PokeResponse } from './interfaces/poke-response.interface';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) {}

  async executeSeed() {
    await this.pokemonModel.deleteMany({}); // Borrar todo de la coleccion

    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=500',
    );

    const pokemonToInsert: { name: string; no: number }[] = [];

    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no = +segments[segments.length - 2];
      // const pokemon = await this.pokemonModel.create({ name, no });
      pokemonToInsert.push({ name, no });
    });

    // insert into pokemons (name, no)
    await this.pokemonModel.insertMany(pokemonToInsert);

    // Example 1 no tan optimo
    // const insertPromisesArray = [];

    // data.results.forEach(({ name, url }) => {
    //   const segments = url.split('/');
    //   const no = +segments[segments.length - 2];
    //   // const pokemon = await this.pokemonModel.create({ name, no });
    //   insertPromisesArray.push(this.pokemonModel.create({ name, no }));
    // });

    // const newArray = await Promise.all(insertPromisesArray);

    return 'Seed executed :)';
  }
}
