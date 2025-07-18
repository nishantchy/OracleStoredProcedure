from .database import get_connection


def create_students_table():
    create_table_sql = """
    CREATE TABLE students (
        id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
        full_name VARCHAR2(100) NOT NULL,
        email VARCHAR2(100) NOT NULL UNIQUE,
        phone VARCHAR2(20),
        gender VARCHAR2(6) CHECK (gender IN ('male', 'female')),
        date_of_birth DATE
    )
    """
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(create_table_sql)
        conn.commit()
    except Exception as e:
        if hasattr(e, "args") and e.args and "ORA-00955" in str(e.args[0]):
            pass
        else:
            raise
    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass


def create_payments_table():
    create_table_sql = """
    CREATE TABLE payments (
        id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
        student_id NUMBER NOT NULL,
        student_name VARCHAR2(100) NOT NULL,
        amount NUMBER(10, 2) NOT NULL,
        cheque_number VARCHAR2(50),
        paid_date DATE,
        CONSTRAINT fk_student_id FOREIGN KEY (student_id) REFERENCES students(id)
    )
    """
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(create_table_sql)
        conn.commit()
    except Exception as e:
        if hasattr(e, "args") and e.args and "ORA-00955" in str(e.args[0]):
            pass
        else:
            raise
    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass
