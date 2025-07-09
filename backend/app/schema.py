from datetime import date
from typing import Annotated, Optional

from pydantic import BaseModel, EmailStr, Field, StringConstraints


class StudentSchema(BaseModel):
    id: int = None
    full_name: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)
    ]
    email: EmailStr
    phone: Optional[
        Annotated[str, StringConstraints(strip_whitespace=True, max_length=20)]
    ] = None
    gender: Annotated[
        str,
        StringConstraints(
            strip_whitespace=True, to_lower=True, min_length=4, max_length=6
        ),
    ]
    date_of_birth: Optional[date] = None

    class Config:
        schema_extra = {
            "example": {
                "id": 1,
                "full_name": "Ram Thapa",
                "email": "ramthapa@example.com",
                "phone": "98XXXXXXXX",
                "gender": "male",
                "date_of_birth": "2060-01-01",
            }
        }


class PaymentSchema(BaseModel):
    student_id: int
    student_name: str = None
    amount: float
    cheque_number: Optional[str]
    paid_date: Optional[date]

    class Config:
        schema_extra = {
            "example": {
                "student_id": 1,
                "amount": 5000.0,
                "cheque_number": "CHQ123456",
                "paid_date": "2024-06-01",
            }
        }


class PaymentCreateSchema(BaseModel):
    student_id: int
    amount: float
    cheque_number: Optional[str]
    paid_date: Optional[date] = Field(default=None)

    class Config:
        schema_extra = {
            "example": {
                "student_id": 1,
                "amount": 5000.0,
                "cheque_number": "CHQ123456",
                "paid_date": "2024-06-01",
            }
        }
