import { Invoke } from "../services/invoke";
import JourneyContract from "../lib/journey-contract";
import avaTest, { TestInterface } from 'ava';
import { Journey, JourneyType, JourneyStatus, JourneyKey, QueryJourney } from "global";
const test = avaTest as TestInterface<{ invoke: Invoke, fixtures }>;

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
    const fakeJourney:JourneyKey = {
        droneId: '123xyz',
        owner: 'john',
        type: JourneyType.civil,
        status: JourneyStatus.start,
    };
    const buf = await t.context.invoke.submit( JourneyContract.getName(), 'getJourney', fakeJourney);
    t.false((buf as QueryJourney).exists);
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
