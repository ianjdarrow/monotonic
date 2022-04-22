"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidArgumentError = exports.MaxEventsPerBaseExceededError = exports.MaxSafeIntegerError = void 0;
class MaxSafeIntegerError extends Error {
    constructor() {
        super("monotonic: For outputFormat 'number', maxEventsPerBase can't exceed 100 (at ms resolution) or 1,000,000 (at second resolution). Decrease maxEventsPerBase or try outputFormat 'string'.");
        this.name = "MaxSafeIntegerError";
    }
}
exports.MaxSafeIntegerError = MaxSafeIntegerError;
class MaxEventsPerBaseExceededError extends Error {
    constructor(maxEventsPerBase) {
        super(`monotonic: Too many events (try initializing with a higher maxEventsPerBase, current: ${maxEventsPerBase})`);
        this.name = "MaxEventsPerBaseExceededError";
    }
}
exports.MaxEventsPerBaseExceededError = MaxEventsPerBaseExceededError;
class InvalidArgumentError extends Error {
    constructor(msg) {
        super(msg);
        this.name = "InvalidArgumentError";
    }
}
exports.InvalidArgumentError = InvalidArgumentError;
