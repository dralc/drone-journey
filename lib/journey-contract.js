/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class JourneyContract extends Contract {

    async journeyExists(ctx, journeyId) {
        const buffer = await ctx.stub.getState(journeyId);
        return (!!buffer && buffer.length > 0);
    }

    async createJourney(ctx, journeyId, value) {
        const exists = await this.journeyExists(ctx, journeyId);
        if (exists) {
            throw new Error(`The journey ${journeyId} already exists`);
        }
        const asset = { value };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(journeyId, buffer);
    }

    async readJourney(ctx, journeyId) {
        const exists = await this.journeyExists(ctx, journeyId);
        if (!exists) {
            throw new Error(`The journey ${journeyId} does not exist`);
        }
        const buffer = await ctx.stub.getState(journeyId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async updateJourney(ctx, journeyId, newValue) {
        const exists = await this.journeyExists(ctx, journeyId);
        if (!exists) {
            throw new Error(`The journey ${journeyId} does not exist`);
        }
        const asset = { value: newValue };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(journeyId, buffer);
    }

    async deleteJourney(ctx, journeyId) {
        const exists = await this.journeyExists(ctx, journeyId);
        if (!exists) {
            throw new Error(`The journey ${journeyId} does not exist`);
        }
        await ctx.stub.deleteState(journeyId);
    }

}

module.exports = JourneyContract;
