from datetime import date

from fastapi import APIRouter, HTTPException, Query

from .database import get_connection
from .schema import (
    PaymentCreateSchema,
    PaymentSchema,
    PaymentUpdateSchema,
    StudentSchema,
    StudentUpdateSchema,
)

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
            SELECT id, student_id, student_name, amount, cheque_number, paid_date
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
                id=row[0],
                student_id=row[1],
                student_name=row[2],
                amount=row[3],
                cheque_number=row[4],
                paid_date=row[5].date() if hasattr(row[5], "date") else row[5],
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


@router.put("/students/{student_id}", response_model=StudentSchema)
def update_student(student_id: int, student: StudentUpdateSchema):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        update_fields = []
        params = {"id": student_id}
        if student.full_name is not None:
            update_fields.append("full_name = :full_name")
            params["full_name"] = student.full_name
        if student.email is not None:
            update_fields.append("email = :email")
            params["email"] = student.email
        if student.phone is not None:
            update_fields.append("phone = :phone")
            params["phone"] = student.phone
        if student.gender is not None:
            update_fields.append("gender = :gender")
            params["gender"] = student.gender
        if student.date_of_birth is not None:
            update_fields.append("date_of_birth = :date_of_birth")
            params["date_of_birth"] = student.date_of_birth
        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update.")
        sql = f"UPDATE students SET {', '.join(update_fields)} WHERE id = :id"
        cursor.execute(sql, params)
        conn.commit()
        cursor.execute(
            "SELECT id, full_name, email, phone, gender, date_of_birth FROM students WHERE id = :id",
            {"id": student_id},
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Student not found.")
        return StudentSchema(
            id=row[0],
            full_name=row[1],
            email=row[2],
            phone=row[3],
            gender=row[4],
            date_of_birth=row[5],
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass


@router.delete("/students/{student_id}", response_model=dict)
def delete_student(student_id: int):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM students WHERE id = :id", {"id": student_id})
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Student not found.")
        return {"status": "success", "message": "Student deleted."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass


@router.put("/payments/{payment_id}", response_model=PaymentSchema)
def update_payment(payment_id: int, payment: PaymentUpdateSchema):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        update_fields = []
        params = {"id": payment_id}
        if payment.student_id is not None:
            update_fields.append("student_id = :student_id")
            params["student_id"] = payment.student_id
        if payment.amount is not None:
            update_fields.append("amount = :amount")
            params["amount"] = payment.amount
        if payment.cheque_number is not None:
            update_fields.append("cheque_number = :cheque_number")
            params["cheque_number"] = payment.cheque_number
        if payment.paid_date is not None:
            update_fields.append("paid_date = :paid_date")
            params["paid_date"] = payment.paid_date
        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update.")
        sql = f"UPDATE payments SET {', '.join(update_fields)} WHERE id = :id"
        cursor.execute(sql, params)
        conn.commit()
        cursor.execute(
            "SELECT id, student_id, student_name, amount, cheque_number, paid_date FROM payments WHERE id = :id",
            {"id": payment_id},
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Payment not found.")
        return PaymentSchema(
            id=row[0],
            student_id=row[1],
            student_name=row[2],
            amount=row[3],
            cheque_number=row[4],
            paid_date=row[5].date() if hasattr(row[5], "date") else row[5],
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass


@router.delete("/payments/{payment_id}", response_model=dict)
def delete_payment(payment_id: int):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM payments WHERE id = :id", {"id": payment_id})
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Payment not found.")
        return {"status": "success", "message": "Payment deleted."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass
