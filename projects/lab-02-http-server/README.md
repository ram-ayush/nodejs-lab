# Lab 02 — Your First HTTP Server

Student: Ayush Ram Tripathi · Scholar number: 23145004 · BCA VII · DSVV
Subject: CS403NOD — Node.js · Lab number: 02 · Date: 02 October 2026

## Run

```sh
node server.js
```

Visit http://localhost:3000. No external dependencies are required. To choose a port in PowerShell, run `$env:PORT=3001` before starting the server; in a POSIX shell use `PORT=3001 node server.js`. Stop the server with Ctrl+C before starting another lab on the same port.

## Routes

| GET route | Response |
| --- | --- |
| `/` | Welcome, full name, scholar number, and course |
| `/about` | Short personal introduction |
| `/college` | DSVV and semester VII |
| `/profile` | JSON with name, scholarNumber, course, semester, and college |
| Any unknown route | 404, Page Not Found |

Non-GET methods return 405 with `Allow: GET`. Query strings do not interfere with route matching. `architecture-notes.txt` answers the event loop, threading, and libuv questions in 4–5 sentences each.

## Evidence

`output.txt` contains actual HTTP responses. `server-running.png`, `routes-output.png`, and `code.png` capture the server output, route examples, and source.

## Problems Faced

No unresolved problems. Separate server factories let verification start an ephemeral port and close it after testing.
