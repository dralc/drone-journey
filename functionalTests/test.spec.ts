import { Invoke, Journey, JourneyType, JourneyStatus, QueryJourney } from "../services/invoke";
import JourneyContract from "../lib/journey-contract";
import anyTest, { TestInterface } from 'ava';
import { Query } from "fabric-network";
const test = anyTest as TestInterface<{ invoke: Invoke, fixtures }>;

// Fixtures --------
const startTime = new Date();
const fixtures: Array<Journey> = [
    {
        droneId: Invoke.makeDroneId(),
        owner: 'dralc',
        type: JourneyType.commercial,
        status: JourneyStatus.start,
        startCoord: '1,2,3',
        lastCoord: '1,2,3',
        startTime: startTime,
        endTime: undefined,
    }
];

function cloneArrayOfObj(ar: Array<Object>) {
    const ret = [];
    ar.forEach(ob => ret.push({ ...ob }));
    return ret;
}
//-------------------

test.beforeEach(async t => {
    t.context.invoke = new Invoke();
    t.context.fixtures = cloneArrayOfObj(fixtures);
    await t.context.invoke.connect();
});

test.afterEach(t => {
    t.context.invoke.disconnect();
});

test('getJourney', async t => {
    const fakeJourney = {
        droneId: '123xyz',
        startTime: new Date()
    };
    const buf = await t.context.invoke.submit(JourneyContract.getName(), 'getJourney', fakeJourney);
    t.true((buf as QueryJourney).exists === false);
});

test('createJourney', async t => {
    const buf = await t.context.invoke.submit(JourneyContract.getName(), 'createJourney', t.context.fixtures[0]);
    const journey = Invoke.deserialize(buf as Buffer);
    
    t.deepEqual(journey, t.context.fixtures[0]);
});

test('updateJourney', async t => {
    const journey:Journey = t.context.fixtures[0];
    const journeyUpdate:Journey = {
        status: JourneyStatus.inflight
    };
    
    const buf = await t.context.invoke.submit(JourneyContract.getName(), 'updateJourney', journey, journeyUpdate);
    
    const expected = { ...journey, ...journeyUpdate };

    t.deepEqual(JSON.parse(buf.toString()), expected);
});
