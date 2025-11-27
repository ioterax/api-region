/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CountryOutPort } from '@/application/ports/out/country.port';
import { Country } from '@/framework/repository/mongodb/schemas/country.schema';
import { ICountry } from '@ioterax/laniakea-lib-central';

/**
 * Repository implementation for managing Country documents in a MongoDB collection.
 *
 * This repository provides methods to perform CRUD operations on the Country domain,
 * leveraging Mongoose models to interact with the MongoDB database.
 *
 * @implements {CountryOutPort}
 */
@Injectable()
export class CountryMongoDbRepository implements CountryOutPort {
  /**
   * Injects the Mongoose model for the Country domain.
   * @param domainModel - The injected Mongoose model for Country, tied to a specific MongoDB collection.
   */
  constructor(
    @InjectModel(Country.name, process.env.MONGO_REGION_CN_NAME)
    private domainModel: Model<Country>,
  ) {}

  /**
   * Saves a new Country document to the MongoDB collection.
   * @param domain - The Country entity to be saved.
   * @returns A promise that resolves to the saved Country document.
   */
  async save(domain: ICountry): Promise<ICountry> {
    const domainModel = new this.domainModel(domain);
    const r = await domainModel.save();
    console.log(r);
    return r;
  }

  /**
   * Retrieves all Country documents from the MongoDB collection.
   * @param project - Optional projection of fields to include in the result.
   * @returns A promise that resolves to an array of Country documents.
   */
  async findAll(
    query: Partial<ICountry> = {},
    project: {},
    limit = 10,
  ): Promise<ICountry[]> {
    return this.domainModel
      .find(query, project)
      .select(['-__v', '-key'])
      .limit(limit)
      .lean();
  }

  /**
   * Finds a Country document by its ID.
   * @param id - The ID of the Country document to find.
   * @param project - Optional projection of fields to include in the result.
   * @returns A promise that resolves to the found Country document, or null if not found.
   */
  async findById(id: string, project?: {}): Promise<ICountry | null> {
    return this.domainModel
      .findById(id, project)
      .select(['-__v', '-key'])
      .lean();
  }

  /**
   * Updates a Country document by its ID.
   * @param id - The ID of the Country document to update.
   * @param domain - The new data to update the Country document with.
   * @returns A promise that resolves to the updated Country document, or null if not found.
   */
  async updateById(id: string, domain: ICountry): Promise<ICountry | null> {
    // const e = setTrace(domain);
    const filter = { _id: id };
    // const domainModel = new this.domainModel(e);
    const x = await this.domainModel
      .findByIdAndUpdate(filter, { ...domain }, { new: true })
      .exec();
    console.log(`FIX IMPLEMENTATION: >>> x`);
    return x;
  }

  /**
   * Deletes a Country document by its ID.
   * @param id - The ID of the Country document to delete.
   * @returns A promise that resolves when the delete operation is complete.
   */
  async deleteById(id: string): Promise<void> {
    const filter = { _id: id };
    await this.domainModel.findByIdAndDelete(filter);
  }
}
