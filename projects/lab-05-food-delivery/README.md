# Lab 05 — Async JavaScript Food Delivery Tracker

Student: Ayush Ram Tripathi · Scholar number: 23145004 · BCA VII · DSVV
Subject: CS403NOD — Node.js · Lab number: 05 · Date: 02 October 2026

## Programs

| File | Demonstrates | Run |
| --- | --- | --- |
| callback-version.js | Three nested callback stages, 2-second timers | `node callback-version.js` |
| promise-version.js | Pending, fulfilled, and rejected Promise states; about 80% success | `node promise-version.js` |
| chaining-version.js | Three 1-second Promise stages and one final catch | `node chaining-version.js` |
| async-await-version.js | The same stages consumed with await and try/catch | `node async-await-version.js` |
| concurrent-orders.js | Three simultaneous orders using Promise.all, randomized delays, and timing | `node concurrent-orders.js` |
| order-steps.js | Shared Promise-returning lifecycle functions | Imported by chain and await programs |

The lifecycle prints Order Placed, Preparing, Out for Delivery, and Delivered in that order. `reflection-notes.txt` explains why timers do not freeze the process and why successful concurrent operations take approximately the longest delay.

## Repeatable error demonstrations

The default Promise outcome is random. In PowerShell set `$env:ORDER_OUTCOME='fail'` or `'success'` before running `promise-version.js`; remove it using `Remove-Item Env:ORDER_OUTCOME` to restore randomness. `FAIL_STAGE='Preparing'` makes the shared lifecycle reject; `FAIL_ORDER='Burger'` demonstrates Promise.all rejection. `DELAY_MS` overrides wait times for verification; defaults retain the assignment's real delays.

## Evidence

`output.txt` records callbacks, at least five random Promise runs including both outcomes, the chain, async/await, and concurrent timing. PNGs capture each section. `callback-output.png` includes callback source and output together; `code.png` shows the async/await version.

## Problems Faced

The random program may succeed several times in a row. Evidence capture continues until it has recorded at least five runs and both outcomes, rather than assuming five runs guarantee a rejection.
