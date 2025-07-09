import useSWR from "swr";
import { fetcher } from "./fetcher";
import { Student } from "../types/Students";
import { Payment } from "../types/Payments";

export function useStudents(params?: {
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const { search = "", page = 1, pageSize = 10 } = params || {};
  const key = `/students?search=${encodeURIComponent(
    search
  )}&page=${page}&page_size=${pageSize}`;
  const { data, error, isLoading } = useSWR<{
    results: Student[];
    total: number;
    page: number;
    page_size: number;
  }>(key, fetcher);
  return { data, error, isLoading };
}

export function usePayments(params?: {
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const { search = "", page = 1, pageSize = 10 } = params || {};
  const key = `/payments?search=${encodeURIComponent(
    search
  )}&page=${page}&page_size=${pageSize}`;
  const { data, error, isLoading } = useSWR<{
    results: Payment[];
    total: number;
    page: number;
    page_size: number;
  }>(key, fetcher);
  return { data, error, isLoading };
}
