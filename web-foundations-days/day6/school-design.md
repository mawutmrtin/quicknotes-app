
# School Database Design

## 1. Tables

### Students
Stores each student's details.
- `id`: primary key that uniquely identifies each student.
- `name`: required student name.
- `email`: required and unique email address.

### Courses
Stores the courses offered by the school.
- `id`: primary key that uniquely identifies each course.
- `name`: required course name.
- `course_code`: required and unique course code.

### Enrolments
Records which student is enrolled on which course and stores the grade.
- `id`: primary key for each enrolment.
- `student_id`: foreign key referencing `students.id`.
- `course_id`: foreign key referencing `courses.id`.
- `grade`: the student's grade for the course; it may be empty until assigned.
- `UNIQUE (student_id, course_id)`: prevents duplicate enrolments.

The foreign keys use `ON DELETE CASCADE`, so deleting a student or course also removes its related enrolment records.

## 2. Relationships

- **Students to enrolments — one-to-many:** one student can have multiple enrolments, but each enrolment belongs to one student.
- **Courses to enrolments — one-to-many:** one course can have multiple enrolments, but each enrolment refers to one course.
- **Students to courses — many-to-many:** a student can take many courses, and each course can have many students.

The `enrolments` table is the join table that implements the many-to-many relationship. It connects student IDs to course IDs and stores the grade for each student-course combination. Without this table, student and course information could be repeated or stored in lists, making queries and updates harder to maintain.

## 3. Index

I would add an index on `enrolments(course_id)`:

```sql
CREATE INDEX idx_enrolments_course_id
ON enrolments(course_id);
```

This can make searches for students on a particular course and counts of students per course faster as the enrolments table grows. The trade-off is extra storage and slightly slower writes because the index must also be updated. SQLite automatically indexes primary keys and unique constraints.

## 4. SQL or NoSQL?

I would choose a relational SQL database, such as SQLite for this assignment or PostgreSQL for a larger deployed school system. Students, courses, and enrolments have a clear structure and important relationships. SQL foreign keys and constraints help maintain consistent records, while JOIN, GROUP BY, and LEFT JOIN make it straightforward to retrieve course lists, class lists, enrolment counts, and students without enrolments. A document database could also work, but SQL is a good fit for this system because of its many-to-many relationship and need for consistent enrolment records.
```
