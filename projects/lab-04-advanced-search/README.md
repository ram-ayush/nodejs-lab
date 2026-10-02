# Lab 04 — Advanced Search, Filter and Sort API

Student: Ayush Ram Tripathi · Scholar number: 23145004 · BCA VII · DSVV
Subject: CS403NOD — Node.js · Lab number: 04 · Date: 02 October 2026

## Run

```sh
node advanced-server.js
```

Visit http://localhost:3000/students. The `PORT` environment variable overrides 3000. Eight student objects include numeric marks and BCA/BIT courses.

## Query parameters

| Parameter | Meaning | Example |
| --- | --- | --- |
| `course` | Course match, case insensitive | `/students?course=BCA` |
| `minMarks` | Marks greater than or equal to a finite number | `/students?minMarks=60` |
| `search` | Partial name match, case insensitive | `/students?search=AN` |
| `sort` | Sort by `name` or `marks` | `/students?sort=name` |
| `order` | `asc` (default) or `desc` | `/students?sort=marks&order=desc` |

Combined: `/students?course=BCA&minMarks=60&search=a&sort=marks&order=desc`.
Bonus: `/students/course/BCA?minMarks=60&sort=marks&order=desc`.
Filters use AND logic before sorting a new array, preserving the original dataset. If path and query course filters differ, both conditions apply and the result is empty.

## Invalid input

Invalid numbers and unknown sort fields return status 400 with explanatory JSON. Invalid orders, blank values, repeated query fields, unknown parameters, and malformed course encoding also return 400. Unknown routes return 404, and non-GET methods return 405 without crashing the server.

## Evidence

`output.txt` includes the eight required checklist requests plus combined, bonus, and validation examples. `advanced-output.png` captures all recorded checks and `code.png` captures the source.

## Problems Faced

No unresolved problems. Sorting a filtered copy avoids accidentally changing later unfiltered responses.
