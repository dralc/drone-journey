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
const expect = chai.expect;
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

describe('--------- JourneyContract ---------', () => {

    /** @type {JourneyContract} */
    let contract;
    let ctx;
    let contractCreateKeyStub;
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

        // Stub the world state with one record
        ctx.stubExistingKey = 'Journey:a:b:c:d';
        ctx.stub.getState
            .withArgs(ctx.stubExistingKey)
            .resolves( Utils.serialize(journeysFixtures.get('exists')) );

        ctx.stubExistingKey_o = Utils.getJourneyKey(journeysFixtures.get('exists'));
        contractCreateKeyStub = sinon.stub(contract, 'createKey');

        contractCreateKeyStub
            .withArgs(ctx, ctx.stubExistingKey_o)
            .returns(ctx.stubExistingKey);

        contractCreateKeyStub
            .withArgs(ctx, journeysFixtures.get('exists'))
            .returns(ctx.stubExistingKey);
    });

    describe('#getJourney', () => {

        it('should return an existing journey', async () => {
            let journey;

            // Test `key` param with composite string
            journey = await contract.getJourney(ctx, ctx.stubExistingKey);
            journey.should.deep.equal(journeysFixtures.get('exists'));

            // Test `key` param with jsonObj string
            journey = await contract.getJourney(ctx, JSON.stringify(ctx.stubExistingKey_o));
            journey.should.deep.equal(journeysFixtures.get('exists'));
        });

        it('should return null for a journey that does not exist', async () => {
            const journey = await contract.getJourney(ctx, 'fake-key');
            expect(journey).to.equal(null);
        });

    });

    describe('#createJourney', () => {
        it('should create a journey', async () => {
            const state = journeysFixtures.get('new');
            const stubKey = 'Journey:x:y:z';
            contractCreateKeyStub
                .withArgs(ctx, state)
                .returns(stubKey);

            await contract.createJourney(ctx, JSON.stringify(state));

            ctx.stub.putState.should.be.calledOnceWithExactly(stubKey, Utils.serialize(state));
        });

        it('should throw an error for a journey that already exists', async () => {
            const journey = journeysFixtures.get('exists');
            await contract.createJourney(ctx, JSON.stringify(journey))
                .should.eventually.be.rejectedWith(`Can't create a journey(${ctx.stubExistingKey}) that already exists.`);
        });

    });

    describe('#updateJourney', () => {
        it('should update a journey', async () => {
            const newState = {
                lastCoord: '4,5,6',
            };
            await contract.updateJourney(ctx, JSON.stringify(ctx.stubExistingKey_o), JSON.stringify(newState));

            ctx.stub.putState.should.have.been.calledOnceWithExactly(
                ctx.stubExistingKey,
                Utils.serialize({ ...journeysFixtures.get('exists'), ...newState }));
        });

        it('should throw an error for a journey that does not exist', async () => {
            const key = Utils.getJourneyKey(journeysFixtures.get('new'));
            const key_st = 'Journey:1:2:3';
            contractCreateKeyStub
                .withArgs(ctx, key)
                .returns(key_st);

            await contract.updateJourney(ctx,
                JSON.stringify(key),
                JSON.stringify({ blah: 2 })).should.be.rejectedWith(`Can't update a journey(${key_st}) that doesn't exist`);
        });

    });

    describe('#deleteJourney', () => {
        it('should delete a journey', async () => {
            await contract.deleteJourney(ctx, ctx.stubExistingKey);
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly(ctx.stubExistingKey);
        });

        it('should throw an error for a journey that does not exist', async () => {
            await contract.deleteJourney(ctx, '1003').should.be.rejectedWith(/The journey 1003 does not exist/);
        });

    });

});