# Lab 03 — Student and Book Directory API

Student: Ayush Ram Tripathi · Scholar number: 23145004 · BCA VII · DSVV
Subject: CS403NOD — Node.js · Lab number: 03 · Date: 02 October 2026

## Run

```sh
node students-server.js
```

Open http://localhost:3000. Uses only `node:http`. The `PORT` environment variable can override 3000.

## Routes

| GET route | Response |
| --- | --- |
| `/students` | Three student records |
| `/students/1`, `/students/2` | Student with matching numeric ID |
| `/students/99` | 404 Student not found |
| `/students/abc` | 400 ID must be a positive integer |
| `/students/course/BCA` | BCA records selected using Array.filter() |
| `/items` | Five books with IDs, titles, and authors |
| `/items/1` | Book with matching ID |
| `/items/99` | 404 Item not found |
| Any unknown route | 404 Route not found |

`req.url` is parsed into a pathname so a query string does not become part of an ID. `pathname.split('/')` turns `/students/2` into `['', 'students', '2']`; index 2 is converted to an ID after validation. `Array.find()` selects a single record and `Array.filter()` selects a course. Both the required student directory and original book directory remain available in one server.

## Evidence

Actual responses are in `output.txt`. `students-output.png` covers student routes and errors; `items-output.png` covers all books, a single book, and a missing book. `code.png` captures the source.

## Problems Faced

No unresolved problems. Route segment counts are checked so extra path segments cannot silently match a student.
