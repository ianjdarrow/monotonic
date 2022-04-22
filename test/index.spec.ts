import { expect } from "chai";

import { Monotonic, MonotonicErrors } from "../src";

describe("Monotonic tests", () => {
  describe("String output format", () => {
    const mono = new Monotonic();
    it("Does a timestamp", (done) => {
      const ts = mono.get();
      done();
    });
    it("Is fast enough", (done) => {
      const NUM_ITERATIONS = 1e5;
      const TARGET_OPS_PER_MS = 3000;
      const start = Date.now();
      for (let i = 0; i < NUM_ITERATIONS; i++) {
        mono.get();
      }
      const elapsed = Date.now() - start;
      expect(NUM_ITERATIONS / elapsed > TARGET_OPS_PER_MS).to.be.true;
      done();
    });
    it("Throws on too many nonces", (done) => {
      const monoThrottled = new Monotonic({ maxEventsPerBase: 10 });
      function makeItThrow() {
        for (let i = 0; i < 20; i++) {
          monoThrottled.get();
        }
      }
      try {
        makeItThrow();
      } catch (err) {
        expect(err instanceof MonotonicErrors.MaxEventsPerBaseExceededError);
        done();
      }
    });
    it("Splits an output back to its inputs", (done) => {
      const monoFresh = new Monotonic();
      const ts = monoFresh.get();
      const { timestamp, nonce } = monoFresh.split(ts);
      expect(typeof timestamp).to.equal("number");
      expect(nonce).to.equal(0);
      done();
    });
    it("Refreshes at the correct frequency", (done) => {
      const monoMs = new Monotonic({ resolution: "ms" });
      const t1 = monoMs.get();
      let t2;
      setTimeout(() => {
        t2 = monoMs.get();
        const { timestamp: t1Ms, nonce: t1Nonce } = monoMs.split(t1);
        const { timestamp: t2Ms, nonce: t2Nonce } = monoMs.split(t2);
        expect(t2Ms > t1Ms).to.be.true;
        expect(Number(t1Nonce)).to.equal(0);
        expect(Number(t2Nonce)).to.equal(0);
        done();
      }, 2);
    });
    it("Always generates sequential nonces per base", (done) => {
      interface SequentialNonceTester {
        [timestamp: number]: Array<number>;
      }
      const NUM_ITERATIONS = 1e4;
      let results: SequentialNonceTester = {};
      for (let i = 0; i < NUM_ITERATIONS; i++) {
        const ts = mono.get();
        const { timestamp, nonce } = mono.split(ts);
        results[timestamp] = results[timestamp] ?? [];
        results[timestamp].push(nonce);
      }
      for (let timestamp of Object.keys(results)) {
        const workingSet = results[timestamp];
        for (let i = 0; i < workingSet.length - 1; i++) {
          expect(workingSet[i + 1] - workingSet[i]).to.equal(1);
        }
      }
      done();
    });
    it("Always makes a unique output", (done) => {
      const NUM_OUTPUTS = 1e5;
      let outputs = new Set<string>();
      for (let i = 0; i < NUM_OUTPUTS; i++) {
        outputs.add(mono.get());
      }
      expect(outputs.size).to.eq(NUM_OUTPUTS);
      done();
    });
  });
  describe("Numeric output format", () => {
    const mono = new Monotonic({ outputFormat: "number" });
    it("Does a timestamp", (done) => {
      const ts = mono.get();
      done();
    });
    it("Is fast enough", (done) => {
      const NUM_ITERATIONS = 1e5;
      const TARGET_OPS_PER_MS = 3000;
      const start = Date.now();
      for (let i = 0; i < NUM_ITERATIONS; i++) {
        mono.get();
      }
      const elapsed = Date.now() - start;
      expect(NUM_ITERATIONS / elapsed > TARGET_OPS_PER_MS).to.be.true;
      done();
    });
    it("Throws on too many nonces", (done) => {
      const monoThrottled = new Monotonic({
        outputFormat: "number",
        maxEventsPerBase: 10,
      });
      function makeItThrow() {
        for (let i = 0; i < 20; i++) {
          const m = monoThrottled.get();
        }
      }
      try {
        makeItThrow();
      } catch (err) {
        expect(err instanceof MonotonicErrors.MaxEventsPerBaseExceededError);
        done();
      }
    });
    it("Splits an output back to its inputs", (done) => {
      const monoFresh = new Monotonic({ outputFormat: "number" });
      const ts = monoFresh.get();
      const { timestamp, nonce } = monoFresh.split(ts);
      expect(typeof timestamp).to.equal("number");
      expect(nonce).to.equal(0);
      done();
    });
    it("Refreshes at the correct frequency", (done) => {
      const monoMs = new Monotonic({
        outputFormat: "number",
        resolution: "ms",
        maxEventsPerBase: 1e3,
      });
      const t1 = monoMs.get();
      let t2;
      setTimeout(() => {
        t2 = monoMs.get();
        const { timestamp: t1Ms, nonce: t1Nonce } = monoMs.split(t1);
        const { timestamp: t2Ms, nonce: t2Nonce } = monoMs.split(t2);
        expect(t2Ms > t1Ms).to.be.true;
        expect(Number(t1Nonce)).to.equal(0);
        expect(Number(t2Nonce)).to.equal(0);
        done();
      }, 2);
    });
    it("Always generates sequential nonces per base", (done) => {
      interface SequentialNonceTester {
        [timestamp: number]: Array<number>;
      }
      const NUM_ITERATIONS = 1e4;
      let results: SequentialNonceTester = {};
      for (let i = 0; i < NUM_ITERATIONS; i++) {
        const ts = mono.get();
        const { timestamp, nonce } = mono.split(ts);
        results[timestamp] = results[timestamp] ?? [];
        results[timestamp].push(nonce);
      }
      for (let timestamp of Object.keys(results)) {
        const workingSet = results[timestamp];
        for (let i = 0; i < workingSet.length - 1; i++) {
          expect(workingSet[i + 1] - workingSet[i]).to.equal(1);
        }
      }
      done();
    });
    it("Always makes a unique output", (done) => {
      const NUM_OUTPUTS = 1e5;
      let outputs = new Set<number>();
      for (let i = 0; i < NUM_OUTPUTS; i++) {
        outputs.add(mono.get());
      }
      expect(outputs.size).to.eq(NUM_OUTPUTS);
      done();
    });
  });
});
