// Tasks 4–6: introduction, console output, and student variables.
const studentName = 'Ayush Ram Tripathi';
const scholarNumber = '23145004';
const course = 'BCA';
const semester = 'VII';
const collegeName = 'DSVV';

console.log('Welcome to Node.js');
console.log('Name:', studentName);
console.log('Scholar Number:', scholarNumber);
console.log('Course:', course);
console.log('Semester:', semester);
console.log('College:', collegeName);
console.log('\nHello Node.js');
console.log('Learning Backend Development');
console.log("Today's Lab Completed Successfully");

// Task 7: typeof null is "object", a historical JavaScript behavior.
const age = 21;
const isStudent = true;
let address;
const result = null;
console.log('\nData types:');
for (const [label, value] of Object.entries({ studentName, age, isStudent, address, result })) {
  console.log(`${label}: ${value} | typeof: ${typeof value}`);
}
