/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { JourneyContract } = require('..');
const Utils = require('../Utils');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logging = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('JourneyContract', () => {

    /** @type {JourneyContract} */
    let contract;
    let ctx;
    const journeysFixtures = new Map([
        ['exists', {
            droneId: '1001',
            owner: 'dralc',
            type: 'ci',
            status: 's',
            startCoord: '1,2,3',
            lastCoord: '1,2,3',
            startTime: new Date().toISOString(),
            endTime: new Date(0).toISOString(),
        }],
        ['new', {
            droneId: '1002',
            owner: 'Xcorp',
            type: 'co',
            status: 's',
            startCoord: '1,2,3',
            lastCoord: '1,2,3',
            startTime: new Date().toISOString(),
            endTime: new Date(0).toISOString(),
        }]
    ]);

    beforeEach(() => {
        contract = new JourneyContract();
        ctx = new TestContext();
        const buf = Utils.serialize(journeysFixtures.get('exists'));
        const keyThatExists = journeysFixtures.get('exists').droneId;

        // Stub the world state
        ctx.stub.getState.withArgs(keyThatExists).resolves(buf);
    });

    describe('#getJourney', () => {

        it.only('should return an existing journey', async () => {
            const keyThatExists = journeysFixtures.get('exists').droneId;
            const journey = await contract.getJourney(ctx, keyThatExists);
            console.log('journey: ', journey);

            Utils.isEmpty(journey).should.be.false;
            Utils.deserialize(journey).should.deep.equal(journeysFixtures.get('exists'));
        });

        it('should return null for a journey that does not exist', async () => {
            const j = await contract.getJourney(ctx, 'fake-key');
            j.should.be.null;
        });

    });

    describe('#createJourney', () => {
        it('should create a journey', async () => {
            const key = '\x00' + 'Journey' + '\u0000' + 'abc' + '\u0000';
            ctx.stub.createCompositeKey = sinon.stub().returns(key);

            const state = journeysFixtures.get('new');
            await contract.createJourney(ctx, JSON.stringify(state));

            ctx.stub.putState.should.have.been.calledOnceWithExactly(key, Utils.serialize(state));
        });

        it('should throw an error for a journey that already exists', async () => {
            const key = journeysFixtures.get('exists').droneId;
            ctx.stub.createCompositeKey = sinon.stub().returns(key);
            await contract.createJourney(ctx, JSON.stringify({droneId: key})).should.eventually.be.rejectedWith(`Can't create a journey(${key}) that already exists.`);
        });

    });

    describe('#updateJourney', () => {

        it('should update a journey', async () => {

            const lastState = journeysFixtures.get('exists');
            const newState = {
                lastCoord: '4,5,6',
            };
            const key = journeysFixtures.get('exists').droneId;
            ctx.stub.createCompositeKey = sinon.stub().returns(key);
            await contract.updateJourney(ctx, JSON.stringify(lastState), JSON.stringify(newState));

            ctx.stub.putState.should.have.been.calledOnceWithExactly(key, Utils.serialize({ ...lastState, ...newState }));
        });

        it('should throw an error for a journey that does not exist', async () => {
            const key = journeysFixtures.get('new').droneId;
            ctx.stub.createCompositeKey = sinon.stub().returns(key);
            await contract.updateJourney(ctx, JSON.stringify({blah: 1}), JSON.stringify({blah:2})).should.be.rejectedWith(`Can't update a journey(${key}) that doesn't exist`);
        });

    });

    describe('#deleteJourney', () => {

        it('should delete a journey', async () => {
            await contract.deleteJourney(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a journey that does not exist', async () => {
            await contract.deleteJourney(ctx, '1003').should.be.rejectedWith(/The journey 1003 does not exist/);
        });

    });

});