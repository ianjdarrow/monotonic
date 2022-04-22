import * as MonotonicErrors from "./errors";

type Resolution = "ms" | "seconds";
type OutputFormat = "number" | "string";

interface MonotonicConstructorOptions {
  maxEventsPerBase?: number;
  resolution?: Resolution;
  outputFormat?: OutputFormat;
}

interface SplitOutput {
  timestamp: number;
  nonce: number;
}

class Monotonic {
  _maxEventsPerBase: number;
  _nonce: number;
  _lastTimestamp: number;
  _outputFormat: OutputFormat;
  _resolution: Resolution;
  _decimals: number;
  _nearestPow10: number;

  constructor({
    outputFormat = "string",
    maxEventsPerBase = 1e6,
    resolution = "seconds",
  }: MonotonicConstructorOptions = {}) {
    // avoid exceeding Number.MAX_SAFE_INTEGER
    if (outputFormat === "number") {
      if (
        (resolution === "ms" && maxEventsPerBase > 1e3) ||
        (resolution === "seconds" && maxEventsPerBase > 1e6)
      ) {
        throw new MonotonicErrors.MaxSafeIntegerError();
      }
    }
    if (maxEventsPerBase < 10) {
      throw new MonotonicErrors.InvalidArgumentError(
        "monotonic: maxEventsPerBase must be at least 10"
      );
    }
    this._maxEventsPerBase = maxEventsPerBase;
    this._nonce = 0;
    this._lastTimestamp = 0;
    this._resolution = resolution;
    this._outputFormat = outputFormat;
    this._decimals = Math.log10(maxEventsPerBase);
    this._nearestPow10 = Math.pow(10, Math.ceil(Math.log10(maxEventsPerBase)));
  }

  _resolve() {
    if (this._outputFormat === "string") {
      return (
        String(this._lastTimestamp) +
        ":" +
        String(this._nonce).padStart(this._decimals, "0")
      );
    } else if (this._outputFormat === "number") {
      return this._lastTimestamp * this._nearestPow10 + this._nonce;
    }
  }

  get() {
    const now =
      this._resolution === "ms" ? Date.now() : Math.floor(Date.now() / 1000);
    if (this._lastTimestamp === now) {
      if (this._nonce > this._maxEventsPerBase) {
        throw new MonotonicErrors.MaxEventsPerBaseExceededError(
          this._maxEventsPerBase
        );
      }
      this._nonce += 1;
    } else {
      this._lastTimestamp = now;
      this._nonce = 0;
    }
    return this._resolve();
  }

  split(input: string | number): SplitOutput | undefined {
    if (typeof input === "string") {
      try {
        const [timestamp, nonce] = input.split(":").map((val) => Number(val));
        return { timestamp, nonce };
      } catch (err) {
        throw new Error(
          `monotonic#split: expected colon-delimited string, got: ${input}`
        );
      }
    } else if (typeof input === "number") {
      const timestamp = Math.floor(input / this._nearestPow10);
      const nonce = input % this._nearestPow10;
      return { timestamp, nonce };
    }
  }
}

export default Monotonic;
export { MonotonicConstructorOptions, MonotonicErrors };
