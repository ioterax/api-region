import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { CountryOutPort } from "@/application/ports/out/country.out.port";
import { Country } from "@/framework/repository/mongodb/schemas/country.schema";
import { setTrace } from '@/common/common';

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
        private domainModel: Model<Country>
    ) {}

    /**
     * Saves a new Country document to the MongoDB collection.
     * @param domain - The Country entity to be saved.
     * @returns A promise that resolves to the saved Country document.
     */
    async save(domain: Country): Promise<Country> {
        const e = setTrace(domain, true);
        console.log(e);
    
        const domainModel = new this.domainModel(e);
        const r = await domainModel.save();
        console.log(r);
        return r;    
    }

    /**
     * Retrieves all Country documents from the MongoDB collection.
     * @param project - Optional projection of fields to include in the result.
     * @returns A promise that resolves to an array of Country documents.
     */
    findAll(project: Country | {}): Promise<Country[]> {
        return this.domainModel.find({}, project).exec();
    }

    /**
     * Finds a Country document by its ID.
     * @param id - The ID of the Country document to find.
     * @param project - Optional projection of fields to include in the result.
     * @returns A promise that resolves to the found Country document, or null if not found.
     */
    findById(id: string, project: Country | {}): Promise<Country | null> {
        return this.domainModel.findById(id, project).exec();
    }

    /**
     * Updates a Country document by its ID.
     * @param id - The ID of the Country document to update.
     * @param domain - The new data to update the Country document with.
     * @returns A promise that resolves to the updated Country document, or null if not found.
     */
    async updateById(id: string, domain: Country): Promise<Country | null> {
        const e = setTrace(domain);
        const filter  = { _id: id };
        const domainModel = new this.domainModel(e);
        const x = await this.domainModel.findByIdAndUpdate(filter, {...domain}, {new: true}).exec();
        console.log(x);
        return x;
    }

    /**
     * Deletes a Country document by its ID.
     * @param id - The ID of the Country document to delete.
     * @returns A promise that resolves when the delete operation is complete.
     */
    async deleteById(id: string): Promise<void> {
        const filter  = { _id: id };
        await this.domainModel.findByIdAndDelete(filter);
    }
}

