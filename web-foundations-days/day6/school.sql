

PRAGMA foreign_keys = ON;

-- Drop existing tables in the correct order

DROP TABLE IF EXISTS enrolments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;

-- 1. Create Students table

CREATE TABLE students (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

-- 2. Create Courses table
CREATE TABLE courses (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    course_code TEXT NOT NULL UNIQUE
);

-- 3. Create Enrolments table

CREATE TABLE enrolments (
    id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT,

    FOREIGN KEY (student_id)
        REFERENCES students(id) ON DELETE CASCADE,

    FOREIGN KEY (course_id)
        REFERENCES courses(id) ON DELETE CASCADE,

    UNIQUE (student_id, course_id)
);

-- 4. Insert Students

INSERT INTO students (id, name, email) VALUES
(1, John Paul, john@example.com),
(2, Martin Mawut, martin@example.com),
(3, Thomas Aleu, aleu@example.com),
(4, Mapong Abang, mapong@example.com);

-- 5. Insert Courses

INSERT INTO courses (id, name, course_code) VALUES
(1, Database Systems, CS201),
(2, Web Development, CS202),
(3, Computer Network, CS203);

-- 6. Insert Enrolments

INSERT INTO enrolments (id, student_id, course_id, grade) VALUES
(1, 1, 1, A),
(2, 1, 2, B),
(3, 2, 1, B),
(4, 2, 3, A),
(5, 3, 2, A),
(6, 3, 3, B);

-- Query 1: All courses for John Paul

SELECT
    students.name AS student_name,
    courses.name AS course_name,
    courses.course_code
FROM students
JOIN enrolments
    ON enrolments.student_id = students.id
JOIN courses
    ON courses.id = enrolments.course_id
WHERE students.name = John Paul
ORDER BY courses.name;

-- Query 2: All students on Database Systems

SELECT
    courses.name AS course_name,
    students.name AS student_name,
    students.email
FROM courses
JOIN enrolments
    ON enrolments.course_id = courses.id
JOIN students
    ON students.id = enrolments.student_id
WHERE courses.name = Database Systems
ORDER BY students.name;

-- Query 3: Number of students per course

SELECT
    courses.name AS course_name,
    COUNT(enrolments.student_id) AS student_count
FROM courses
LEFT JOIN enrolments
    ON enrolments.course_id = courses.id
GROUP BY courses.id, courses.name
ORDER BY courses.name;

-- Query 4: Students who have no enrolments

SELECT
    students.id,
    students.name,
    students.email
FROM students
LEFT JOIN enrolments
    ON enrolments.student_id = students.id
WHERE enrolments.student_id IS NULL
ORDER BY students.name;

-- Query 5: Update one enrolment's grade

UPDATE enrolments
SET grade = A-
WHERE id = 2;

-- Verify the updated grade

SELECT
    students.name AS student_name,
    courses.name AS course_name,
    enrolments.grade
FROM enrolments
JOIN students
    ON students.id = enrolments.student_id
JOIN courses
    ON courses.id = enrolments.course_id
WHERE enrolments.id = 2;

-- 7. Create a recommended index
CREATE INDEX idx_enrolments_course_id
ON enrolments(course_id);

