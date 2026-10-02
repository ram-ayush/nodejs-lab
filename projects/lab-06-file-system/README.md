# Lab 06 — File System and Command-Line Notes

Student: Ayush Ram Tripathi · Scholar number: 23145004 · BCA VII · DSVV
Subject: CS403NOD — Node.js · Lab number: 06 · Date: 02 October 2026

## Programs

| File | Demonstrates |
| --- | --- |
| read-async.js | Callback read; the BEFORE message prints first |
| read-sync.js | Blocking read; the AFTER message prints after content |
| write-file.js | Create or overwrite output.txt; accepts optional replacement text |
| append-file.js | Add another line to output.txt |
| delete-file.js | Delete output.txt; explain ENOENT on the second run |
| async-await-version.js | Copy sample.txt to copy.txt using fs.promises |
| add-note.js | Append a timestamped command-line note |
| read-notes.js | Read saved notes, or explain that none exist |
| file-path.js | Resolve data files beside the project independent of working directory |

## Run the full sequence

```sh
node read-async.js
node read-sync.js
node write-file.js
node write-file.js "This replaces the first message."
node append-file.js
node append-file.js
node append-file.js
node delete-file.js
node delete-file.js
node async-await-version.js
node add-note.js "Submit Lab 06 by Friday"
node add-note.js "Revise the Event Loop before the mid-term"
node read-notes.js
```

The second delete reports ENOENT and exits with code 1 because the file is already gone. Missing note arguments exit with code 1; reading notes before any exist displays `No notes found yet.` A non-ENOENT read error remains visible and sets a failure exit code.

`reflection-notes.txt` answers the blocking and simultaneous-append questions with 4–5 sentences each. Data files live beside the scripts, so commands also work from the repository root. Verification sets `LAB_DATA_DIR` to an isolated temporary directory and does not erase a user's notes.

## Evidence

`evidence.txt` records the actual run, including contents after two writes, three appends, two deletes, an identical copy, and two notes. `read-comparison.png`, `notes-app-output.png`, `file-operations.png`, and `code.png` capture these results.

## Problems Faced

Deleting the same file twice causes ENOENT by design. The program explains the error clearly. A shared multi-user notes system would need serialized writes or a database; this lab is a small local command-line tool.
