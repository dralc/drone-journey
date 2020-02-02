// Type definitions for drone-journey
// Project: drone-moncon
// Definitions by: dralc [https://github.com/dralc]
export interface Journey {
    droneId?: string,
    owner?: string,
    type?: JourneyType,
    status?: JourneyStatus,
    startCoord?: string,
    lastCoord?: string,
    startTime?: string,
    endTime?: string,
}

export enum JourneyType {
    civil = 'ci',
    commercial = 'co',
    military = 'mi',
}
export enum JourneyStatus {
    start = 's',
    inflight = 'i',
    complete = 'c',
}

export interface JourneyKey {
    droneId: string,
    owner: string,
    type: JourneyType,
    status: JourneyStatus
}