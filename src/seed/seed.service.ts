import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import axios, { AxiosInstance } from 'axios';

import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { PokeResponse } from './interfaces/poke-response.interface';

@Injectable()
export class SeedService {
  private readonly axios: AxiosInstance = axios;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async executeSeed() {
    await this.pokemonModel.deleteMany({}); // Borrar todo de la coleccion

    const { data } = await this.axios.get<PokeResponse>(
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
