"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonotonicErrors = exports.Monotonic = void 0;
const MonotonicErrors = __importStar(require("./errors"));
exports.MonotonicErrors = MonotonicErrors;
class Monotonic {
    constructor({ outputFormat = "string", maxEventsPerBase = 1e6, resolution = "seconds", } = {}) {
        // avoid exceeding Number.MAX_SAFE_INTEGER
        if (outputFormat === "number") {
            if ((resolution === "ms" && maxEventsPerBase > 1e3) ||
                (resolution === "seconds" && maxEventsPerBase > 1e6)) {
                throw new MonotonicErrors.MaxSafeIntegerError();
            }
        }
        if (maxEventsPerBase < 10) {
            throw new MonotonicErrors.InvalidArgumentError("monotonic: maxEventsPerBase must be at least 10");
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
            return (String(this._lastTimestamp) +
                ":" +
                String(this._nonce).padStart(this._decimals, "0"));
        }
        else if (this._outputFormat === "number") {
            return this._lastTimestamp * this._nearestPow10 + this._nonce;
        }
    }
    get() {
        const now = this._resolution === "ms" ? Date.now() : Math.floor(Date.now() / 1000);
        if (this._lastTimestamp === now) {
            if (this._nonce > this._maxEventsPerBase) {
                throw new MonotonicErrors.MaxEventsPerBaseExceededError(this._maxEventsPerBase);
            }
            this._nonce += 1;
        }
        else {
            this._lastTimestamp = now;
            this._nonce = 0;
        }
        return this._resolve();
    }
    split(input) {
        if (typeof input === "string") {
            try {
                const [timestamp, nonce] = input.split(":").map((val) => Number(val));
                return { timestamp, nonce };
            }
            catch (err) {
                throw new Error(`monotonic#split: expected colon-delimited string, got: ${input}`);
            }
        }
        else if (typeof input === "number") {
            const timestamp = Math.floor(input / this._nearestPow10);
            const nonce = input % this._nearestPow10;
            return { timestamp, nonce };
        }
    }
}
exports.Monotonic = Monotonic;
