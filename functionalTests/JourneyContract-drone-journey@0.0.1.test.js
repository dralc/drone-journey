/*
* Use this file for functional testing of your smart contract.
* Fill out the arguments and return values for a function and
* use the CodeLens links above the transaction blocks to
* invoke/submit transactions.
* All transactions defined in your smart contract are used here
* to generate tests, including those functions that would
* normally only be used on instantiate and upgrade operations.
* This basic test file can also be used as the basis for building
* further functional tests to run as part of a continuous
* integration pipeline, or for debugging locally deployed smart
* contracts by invoking/submitting individual transactions.
*/
/*
* Generating this test file will also trigger an npm install
* in the smart contract project directory. This installs any
* package dependencies, including fabric-network, which are
* required for this test file to be run locally.
*/

'use strict';

const assert = require('assert');
const fabricNetwork = require('fabric-network');
const SmartContractUtil = require('./js-smart-contract-util');
const os = require('os');
const path = require('path');

describe('JourneyContract-drone-journey@0.0.1' , () => {

    const homedir = os.homedir();
    const walletPath = path.join(homedir, '.fabric-vscode', 'wallets', 'local_fabric_wallet');
    const gateway = new fabricNetwork.Gateway();
    const wallet = new fabricNetwork.FileSystemWallet(walletPath);
    const identityName = 'admin';
    let connectionProfile;

    before(async () => {
        connectionProfile = await SmartContractUtil.getConnectionProfile();
    });

    beforeEach(async () => {

        const discoveryAsLocalhost = SmartContractUtil.hasLocalhostURLs(connectionProfile);
        const discoveryEnabled = true;

        const options = {
            wallet: wallet,
            identity: identityName,
            discovery: {
                asLocalhost: discoveryAsLocalhost,
                enabled: discoveryEnabled
            }
        };

        await gateway.connect(connectionProfile, options);
    });

    afterEach(async () => {
        gateway.disconnect();
    });

    it('journeyExists', async () => {
        const args = ['journey1'];

        const response = await SmartContractUtil.submitTransaction('JourneyContract', 'journeyExists', args, gateway); // Returns buffer of transaction return value

        assert.equal(JSON.parse(response.toString()), true);
    }).timeout(10000);

    it('createJourney', async () => {
        const value = {
            status: 'In-flight',
            startCoord: 'x, y, z',
            lastCoord: 'a, b, c',
            flightTime: '1hr 2min',
            startTime: '1/Jan/2019 9:00am'
        };

        const args = [ 'journey1', JSON.stringify(value) ];

        const response = await SmartContractUtil.submitTransaction('JourneyContract', 'createJourney', args, gateway); // Returns buffer of transaction return value

        assert.equal(response.length, 0);

    }).timeout(90000);

    it('readJourney', async () => {
        const args = ['journey1'];

        const response = await SmartContractUtil.submitTransaction('JourneyContract', 'readJourney', args, gateway); // Returns buffer of transaction return value

        let value = JSON.parse(response.toString()).value;

        assert.equal(value, '{"status":"In-flight","startCoord":"x, y, z","lastCoord":"a, b, c","flightTime":"1hr 2min","startTime":"1/Jan/2019 9:00am"}');

    }).timeout(10000);

    it('updateJourney', async () => {
        const oldVal = {
            status: 'In-flight',
            startCoord: 'x, y, z',
            lastCoord: 'a, b, c',
            flightTime: '1hr 2min',
            startTime: '1/Jan/2019 9:00am'
        };

        const newVal = { ...oldVal, ...{ status: 'complete' } };

        const args = ['journey1', JSON.stringify(newVal)];

        const response = await SmartContractUtil.submitTransaction('JourneyContract', 'updateJourney', args, gateway); // Returns buffer of transaction return value

        assert.equal(response.length, 0);
    }).timeout(10000);

    it('deleteJourney', async () => {
        const args = ['journey1'];

        const response = await SmartContractUtil.submitTransaction('JourneyContract', 'deleteJourney', args, gateway); // Returns buffer of transaction return value

        assert.equal(response.length, 0);
    }).timeout(10000);

});
