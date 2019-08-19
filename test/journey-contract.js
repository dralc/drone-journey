/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { JourneyContract } = require('..');
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

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new JourneyContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"journey 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"journey 1002 value"}'));
    });

    describe('#journeyExists', () => {

        it('should return true for a journey', async () => {
            await contract.journeyExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a journey that does not exist', async () => {
            await contract.journeyExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createJourney', () => {

        it('should create a journey', async () => {
            await contract.createJourney(ctx, '1003', 'journey 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"journey 1003 value"}'));
        });

        it('should throw an error for a journey that already exists', async () => {
            await contract.createJourney(ctx, '1001', 'myvalue').should.be.rejectedWith(/The journey 1001 already exists/);
        });

    });

    describe('#readJourney', () => {

        it('should return a journey', async () => {
            await contract.readJourney(ctx, '1001').should.eventually.deep.equal({ value: 'journey 1001 value' });
        });

        it('should throw an error for a journey that does not exist', async () => {
            await contract.readJourney(ctx, '1003').should.be.rejectedWith(/The journey 1003 does not exist/);
        });

    });

    describe('#updateJourney', () => {

        it('should update a journey', async () => {
            await contract.updateJourney(ctx, '1001', 'journey 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"journey 1001 new value"}'));
        });

        it('should throw an error for a journey that does not exist', async () => {
            await contract.updateJourney(ctx, '1003', 'journey 1003 new value').should.be.rejectedWith(/The journey 1003 does not exist/);
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