import { Invoke } from "../services/invoke";
import * as Utils from "../Utils";
import * as JourneyContract from "../lib/journey-contract";
import avaTest, { TestInterface } from 'ava';
import { Journey, JourneyType, JourneyStatus, JourneyKey } from "../Journey";
const test = avaTest as TestInterface<{ invoke: Invoke, fixture }>;

interface EndorsementError extends Error {
    endorsements: Array<{ message: string }>
}

// Fixtures --------
const startTime = new Date().toISOString();
const endTime = new Date(0).toISOString();

function createNewFixture():Journey {
    return {
        droneId: Invoke.makeDroneId(),
        owner: 'dralc',
        type: JourneyType.commercial,
        status: JourneyStatus.start,
        startCoord: '1,2,3',
        lastCoord: '1,2,3',
        startTime: startTime,
        endTime: endTime,
    };
}

    test.beforeEach(async t => {
    t.context.invoke = new Invoke();

    // NB. every test is given a unique new fixture (journey) so you can assume
    // that the journey have never been recorded before at the start of a new test
    t.context.fixture = createNewFixture();
    await t.context.invoke.connect();
});

test.afterEach(t => {
    t.context.invoke.disconnect();
});

test('getJourney', async t => {
    const fakeJourney: JourneyKey = {
        droneId: '123xyz',
        owner: 'john',
        type: JourneyType.civil,
        status: JourneyStatus.start,
    };
    const buf = await t.context.invoke.submit(JourneyContract.getName(), 'getJourney', fakeJourney);
    t.true(Utils.isEmpty(buf), "should've returned an empty buffer");
});

test('createJourney', async t => {
    const journey = t.context.fixture;
    await t.context.invoke.submit(JourneyContract.getName(), 'createJourney', journey);
    const dat = await t.context.invoke.submit(JourneyContract.getName(), 'getJourney', Utils.getJourneyKey(journey));

    t.deepEqual(Utils.deserialize(dat), journey);
});

test('createJourney - throws error on invalid key attributes', async t => {
    let key = { droneId: null, owner: null, type: JourneyType.civil, status: JourneyStatus.inflight };
    await t.throwsAsync(
        t.context.invoke.submit(JourneyContract.getName(), 'createJourney', key),
        {
            instanceOf: Error,
            message: `Can't create a key with a non-string attribute (droneId:null)`
        }
    );
});

test('createJourney - throws error when journey already exists', async t => {
    let key_o = Utils.getJourneyKey(t.context.fixture);

    // Create
    let key_buf = await t.context.invoke.submit(JourneyContract.getName(), 'createJourney', key_o);

    // Re-create with the same key
    let er = await t.throwsAsync(
        t.context.invoke.submit(JourneyContract.getName(), 'createJourney', key_o)
    );

    t.is(er['endorsements'][0].message, `transaction returned with failure: Error: Can't create a journey(${Utils.deserialize(key_buf)}) that already exists.`);
});

test('updateJourney', async t => {
    // Create
    const journey = t.context.fixture;
    await t.context.invoke.submit(JourneyContract.getName(), 'createJourney', journey);

    // Update
    const journeyUpdate: Journey = { status: JourneyStatus.inflight };
    await t.context.invoke.submit(JourneyContract.getName(), 'updateJourney', journey, journeyUpdate);

    // Get
    const buf = await t.context.invoke.submit(JourneyContract.getName(), 'getJourney', Utils.getJourneyKey(journey));
    const expected = { ...journey, ...journeyUpdate };
    t.deepEqual(Utils.deserialize(buf), expected, "the journey should've been updated");
});

test('updateJourney - throws error when the journey doesn\'t exist', async t => {
    const journeyKey: JourneyKey = {
        droneId: 'fake-id-1', owner: 'fakeowner', type: JourneyType.civil, status: JourneyStatus.inflight
    };
    const updateState = { status: JourneyStatus.complete };

    const er = await t.throwsAsync(
        t.context.invoke.submit(JourneyContract.getName(), 'updateJourney', journeyKey, updateState)
    ) as EndorsementError;

    t.regex(er.endorsements[0].message, /Error: Can't update a journey\([\-a-z0-9\u0000]+\) that doesn't exist/i);
});