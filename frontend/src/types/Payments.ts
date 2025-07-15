export type Payment = {
  id: number;
  student_id: number;
  student_name: string;
  amount: number;
  cheque_number?: string;
  paid_date?: string;
};
