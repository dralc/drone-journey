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
    startTime?: Date,
    endTime?: Date
}

export enum JourneyType {
    civil,
    commercial,
    military,
}
export enum JourneyStatus {
    start,
    inflight,
    complete,
}

export interface QueryJourney {
    buffer: Buffer,
    exists: boolean
}

export interface JourneyKey {
    droneId: string,
    owner: string,
    type: JourneyType,
    status: JourneyStatus
}