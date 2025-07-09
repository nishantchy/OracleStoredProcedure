from datetime import date
from typing import List

from fastapi import APIRouter, HTTPException, Query

from .database import get_connection
from .schema import PaymentCreateSchema, PaymentSchema, StudentSchema

router = APIRouter(prefix="/api", tags=["Students Payment"])


@router.post("/students", response_model=dict)
def add_student(student: StudentSchema):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        # Calling stored procedure ADD_STUDENT
        cursor.callproc(
            "ADD_STUDENT",
            [
                student.full_name,
                student.email,
                student.phone,
                student.gender,
                student.date_of_birth,
            ],
        )
        conn.commit()
        return {"status": "success", "message": "Student added via stored procedure."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass


@router.get("/students")
def get_students(
    search: str = Query("", description="Search by name or email"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        offset = (page - 1) * page_size
        search_query = f"%{search}%"
        cursor.execute(
            """
            SELECT id, full_name, email, phone, gender, date_of_birth
            FROM students
            WHERE full_name LIKE :search OR email LIKE :search
            ORDER BY id DESC
            OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
            """,
            {"search": search_query, "offset": offset, "limit": page_size},
        )
        rows = cursor.fetchall()
        students = [
            StudentSchema(
                id=row[0],
                full_name=row[1],
                email=row[2],
                phone=row[3],
                gender=row[4],
                date_of_birth=row[5],
            )
            for row in rows
        ]
        cursor.execute(
            """
            SELECT COUNT(*) FROM students
            WHERE full_name LIKE :search OR email LIKE :search
            """,
            {"search": search_query},
        )
        total = cursor.fetchone()[0]
        return {
            "results": students,
            "total": total,
            "page": page,
            "page_size": page_size,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass


@router.post("/payments", response_model=PaymentSchema)
def add_payment(payment: PaymentCreateSchema):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        paid_date = payment.paid_date or date.today()
        # Calling stored procedure ADD_PAYMENT
        cursor.callproc(
            "ADD_PAYMENT",
            [
                payment.student_id,
                payment.amount,
                payment.cheque_number,
                paid_date,
            ],
        )
        conn.commit()
        cursor.execute(
            """
            SELECT student_id, student_name, amount, cheque_number, paid_date
            FROM payments
            WHERE student_id = :student_id
            ORDER BY id DESC
            FETCH FIRST 1 ROWS ONLY
            """,
            {"student_id": payment.student_id},
        )
        row = cursor.fetchone()
        paid_date = row[4]
        if hasattr(paid_date, "date"):
            paid_date = paid_date.date()
        return PaymentSchema(
            student_id=row[0],
            student_name=row[1],
            amount=row[2],
            cheque_number=row[3],
            paid_date=paid_date,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass


@router.get("/payments")
def get_payments(
    search: str = Query("", description="Search by student name"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        offset = (page - 1) * page_size
        search_query = f"%{search}%"
        cursor.execute(
            """
            SELECT student_id, student_name, amount, cheque_number, paid_date
            FROM payments
            WHERE student_name LIKE :search
            ORDER BY id DESC
            OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
            """,
            {"search": search_query, "offset": offset, "limit": page_size},
        )
        rows = cursor.fetchall()
        payments = [
            PaymentSchema(
                student_id=row[0],
                student_name=row[1],
                amount=row[2],
                cheque_number=row[3],
                paid_date=row[4].date() if hasattr(row[4], "date") else row[4],
            )
            for row in rows
        ]
        cursor.execute(
            """
            SELECT COUNT(*) FROM payments
            WHERE student_name LIKE :search
            """,
            {"search": search_query},
        )
        total = cursor.fetchone()[0]
        return {
            "results": payments,
            "total": total,
            "page": page,
            "page_size": page_size,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass
