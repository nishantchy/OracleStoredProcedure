
CREATE SEQUENCE seq_student START WITH 1;

   CREATE OR REPLACE PROCEDURE ADD_STUDENT(
       p_full_name IN VARCHAR2,
       p_email IN VARCHAR2,
       p_phone IN VARCHAR2,
       p_gender IN VARCHAR2,
       p_date_of_birth IN DATE
   ) AS
   BEGIN
       INSERT INTO students (full_name, email, phone, gender, date_of_birth)
       VALUES (p_full_name, p_email, p_phone, p_gender, p_date_of_birth);
   END;
   /
   
   
SELECT text
FROM user_source
WHERE name = 'ADD_STUDENT'
ORDER BY line;

SELECT * FROM Students;

SELECT * FROM payments;

DELETE FROM payments WHERE student_id = 1;


CREATE OR REPLACE PROCEDURE ADD_PAYMENT(
    p_student_id IN NUMBER,
    p_amount IN NUMBER,
    p_cheque_number IN VARCHAR2,
    p_paid_date IN DATE DEFAULT NULL
) AS
    v_student_name VARCHAR2(100);
    v_paid_date DATE;
BEGIN
    SELECT full_name INTO v_student_name FROM students WHERE id = p_student_id;
    IF p_paid_date IS NULL THEN
        v_paid_date := SYSDATE;
    ELSE
        v_paid_date := p_paid_date;
    END IF;
    INSERT INTO payments (student_id, student_name, amount, cheque_number, paid_date)
    VALUES (p_student_id, v_student_name, p_amount, p_cheque_number, v_paid_date);
END;
/

SELECT text
FROM user_source
WHERE name = 'ADD_PAYMENT'
ORDER BY line;


DELETE FROM payments;
DELETE FROM students;
COMMIT;
