--Day 6 Assignment: School Database

PRAGMA foreign_keys = ON;


DROP TABLE IF EXISTS enrolments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;


CREATE TABLE students(
    id INTEGER PRIMARTY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

CREATE TABLE enrolments (
    id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT,

    FOREIGN KEY (student_id)
    REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id)
    REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE (student_id, course_is)
);

-- Insert Students

INSERT INTO students (id, name, email) VALUES
(1, 'John Paul', 'john@example.com'),
(2, 'Martin Mawut', 'martin@example.com'),
(3, 'Thomas Aleu', 'aleu@example.com'),
(4, 'Mapong Abang', 'mapong@example.com'),

-- Insert Courses

INSERT INTO courses (id, name, course_code) VALUES
(1, 'Database Systems', 'CS201'),
(1, 'Web Development', 'CS202'),
(1, 'Computer Network', 'CS203'),

-- Insert Enrolments

INSERT INTO enrolments (id, student_id, course_id, grade) VALUES
(1, 1, 1, 'A'),
(2, 1, 1, 'B'),
(3, 1, 1, 'B'),
(4, 1, 1, 'A'),
(5, 1, 1, 'A'),
(6, 1, 1, 'B'),

-- Query 1: All courses for one student

SELECT students.name AS student_name,
       courses.name AS course_name,
       courses.course_code
FROM students
JOIN enrolments ON enrolments.student_id = students.id
JOIN courses ON courses.id = enrolments.course_id
WHERE students.name = 'John Paul'
ORDER BY courses.name;

--Query 2: All students on one course

SELECT couress.name AS course_name,
       students.name AS student_name,
       students.email        
FROM courses
JOIN enrolments ON enrolments.course_id = courses.id
JOIN courses ON studentss.id = enrolments.student_id
WHERE courses.name = 'Database Systems'
ORDER BY students.name;

-- Query 3: Number of students per course

SELECT courses.name AS course_name,
       COUNT(enrolments.sdtudent_id) AS student_id

FROM courses
LEFT JOIN enrolments ON enrolments.course_id = courses.id
GROUP BY courses.id, courses.name
ORDER BY courses.name;

-- Query 4: Students who have no renrolments

SELECT students.id, students.name, students.email
FROM students
LEFT JOIN enrolments ON enrolments.students_id = students.id
WHERE enrolments.students_id IS NULL
ORDER BY students.name;

-- Query 5: Update one's renrolments grade

UPDATE enrolments
SET grade = 'A-'
WHERE id = 2;

-- Verify the updated grade
SELECT students.name AS student_name,
       courses.name AS course_name,
       enrolment.grade

FROM enrolments
JOIN students ON students.id =enrolments.student_id
JOIN courses ON courses.id = enrolments.course_id
WHERE enrolments.id = 2;

-- Recommended Index

CREATE INDEX idx_enrolments_course_id
ON enrolments(course_id);

