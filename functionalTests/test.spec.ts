import { Invoke, Journey } from "../services/invoke";
import * as JourneyContract from "../lib/journey-contract";

describe("test 1", () => {
    it('journeyExists', async () => {
        const invoke = new Invoke();

        const dat:Journey = { endTime: new Date(), startTime: new Date(), status: 'start', startCoord: '', lastCoord: '' };
        await invoke.connect();
        const response = await invoke.submit(JourneyContract.getName(), 'journeyExists', 'journey1');
        invoke.disconnect();

    });
});