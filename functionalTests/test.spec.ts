import { Invoke, Journey } from "../services/invoke";
import * as JourneyContract from "../lib/journey-contract";
import anyTest, {TestInterface} from 'ava';
const test = anyTest as TestInterface<{invoke: Invoke}>;

test.beforeEach(async t => {
    t.context.invoke = new Invoke();
    await t.context.invoke.connect();
});

test.afterEach(t => {
    t.context.invoke.disconnect();
});

test('journeyExists', async t => {
    const response = await t.context.invoke.submit(JourneyContract.getName(), 'journeyExists', 'fake-journey-xyz');
    t.true(response.toString() === 'false');
});

// const dat:Journey = { endTime: new Date(), startTime: new Date(), status: 'start', startCoord: '', lastCoord: '' };