export class MaxSafeIntegerError extends Error {
  constructor() {
    super(
      "monotonic: For outputFormat 'number', maxEventsPerBase can't exceed 100 (at ms resolution) or 1,000,000 (at second resolution). Decrease maxEventsPerBase or try outputFormat 'string'."
    );
    this.name = "MaxSafeIntegerError";
  }
}

export class MaxEventsPerBaseExceededError extends Error {
  constructor(maxEventsPerBase: number) {
    super(
      `monotonic: Too many events (try initializing with a higher maxEventsPerBase, current: ${maxEventsPerBase})`
    );
    this.name = "MaxEventsPerBaseExceededError";
  }
}

export class InvalidArgumentError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "InvalidArgumentError";
  }
}
