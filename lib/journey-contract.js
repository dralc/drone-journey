/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class JourneyContract extends Contract {

    constructor() {
        // Sets the unique contract name
        super(JourneyContract.getName());
    }

    static getName() {
        return 'org.dronemoncon.journeycontract';
    }

    isObject(type) {
        return (Object.prototype.toString.call(type) === '[object Object]');
    }
    /**
     *
     * @param {*} ctx
     * @param { string|{droneId,startTime} } key The key via `createKey()` or an object for producing the key
     *
     * @return { Promise<{exists:Boolean, journey:Journey}> }
     */
    async getJourney(ctx, key) {
        const journeyId = this.isObject(key)
            ? this.createKey(ctx, key)
            : key;
        const buffer = await ctx.stub.getState(journeyId);
        const exists = (!!buffer && buffer.length > 0);

        return {
            buffer,
            exists,
        };
    }

    /**
     * Create the unique key for a state on the ledger.
     * @param {Context} ctx
     * @param {Object} journey
     *
     * @return {string}
     */
    createKey(ctx, journey) {
        const keyAttrs = [journey.droneId, journey.startTime];
        const id = ctx.stub.createCompositeKey('Journey', keyAttrs);
        return id;
    }

    /**
     * @param {string} state JSON
     *
     * @return {Promise<Buffer>}
     */
    async createJourney(ctx, state) {
        const journeyId = this.createKey(ctx, JSON.parse(state));
        const query = await this.getJourney(ctx, journeyId);

        if (query.exists) {
            throw new Error(`Can't create a journey(${journeyId}) that already exists.`);
        }

        return await this._saveJourney(ctx, journeyId, state);
    }

    /**
     * @param {string} state JSON The last full Journey state
     * @param {string} newState JSON A partial Journey
     *
     * @return {Promise<Buffer>}
     */
    async updateJourney(ctx, state, newState) {
        const journeyId = this.createKey(ctx, JSON.parse(state));
        const query = await this.getJourney(ctx, journeyId);

        if (!query.exists) {
            throw new Error(`Can't update a journey(${journeyId}) that doesn't exist`);
        }

        return await this._saveJourney(ctx, journeyId, state);
    }

    /**
     * The key is derived from the state
     *
     * @param {Context} ctx
     * @param {string} state JSON string of a Journey
     *
     * @return {Promise<Buffer>}
     */
    async _saveJourney(ctx, journeyId, state) {
        const buffer = Buffer.from(state);
        await ctx.stub.putState(journeyId, buffer);

        return buffer;
    }

    async deleteJourney(ctx, journeyId) {
        const query = await this.getJourney(ctx, journeyId);
        if (!query.exists) {
            throw new Error(`The journey ${journeyId} does not exist`);
        }
        await ctx.stub.deleteState(journeyId);
    }

}

module.exports = JourneyContract;
