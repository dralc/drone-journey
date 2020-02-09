/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const Utils = require('../Utils');

/**
 * @typedef {Object} JourneyKey
 * @property {string} droneId
 * @property {string} owner
 * @property {string} type
 * @property {string} status
 */

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
     * @param { string } key The key via `createKey()` OR a JSON string with the key attributes
     *
     * @return { Promise<{Buffer}> }
     */
    async getJourney(ctx, key) {
        let journeyId = key;
        const jsonObj = Utils.isJsonObj(key);

        if (jsonObj) {
            Utils.validateJourneyKey(jsonObj);
            journeyId = this.createKey(ctx, jsonObj);
        }

        const buffer = await ctx.stub.getState(journeyId);
        try {
            return Utils.deserialize(buffer);
        } catch (er) {
            return null;
        }
    }

    /**
     * Create the unique key for a state on the ledger.
     * NB. They key needs to include journey attributes that should be searchable
     * by key range and partial composite key functions
     * @see https://fabric-shim.github.io/master/fabric-shim.ChaincodeStub.html#createCompositeKey__anchor
     *
     * @param {Context} ctx
     * @param { JourneyKey } journeyKey
     *
     * @return {string}
     */
    createKey(ctx, journeyKey) {
        let keyAttrs, id;
        try {
            keyAttrs = [journeyKey.droneId, journeyKey.owner, journeyKey.type, journeyKey.status];
            id = ctx.stub.createCompositeKey('Journey', keyAttrs);
            return id;
        } catch (er) {
            throw new TypeError('A key could not be created from: ' + keyAttrs);
        }
    }

    /**
     * @param {string} state JSON
     *
     * @return {Promise<Buffer>}
     */
    async createJourney(ctx, state) {
        const journeyId = this.createKey(ctx, JSON.parse(state));
        const query = await this.getJourney(ctx, journeyId);

        if (query) {
            throw new Error(`Can't create a journey(${journeyId}) that already exists.`);
        }

        await this._saveJourney(ctx, journeyId, state);

        return journeyId;
    }

    /**
     * @param {string} state JSON The last full Journey state
     * @param {string} newState JSON A partial Journey
     *
     * @return {Promise<Buffer>}
     */
    async updateJourney(ctx, state, newState) {
        const state_o = JSON.parse(state);
        const newState_o = JSON.parse(newState);

        const journeyId = this.createKey(ctx, state_o);
        const query = await this.getJourney(ctx, journeyId);

        if (!query) {
            throw new Error(`Can't update a journey(${journeyId}) that doesn't exist`);
        }

        return await this._saveJourney(ctx, journeyId, JSON.stringify({ ...state_o, ...newState_o }));
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
    }

    async deleteJourney(ctx, journeyId) {
        const query = await this.getJourney(ctx, journeyId);
        if (!query) {
            throw new Error(`The journey ${journeyId} does not exist`);
        }
        await ctx.stub.deleteState(journeyId);
    }

}

module.exports = JourneyContract;
