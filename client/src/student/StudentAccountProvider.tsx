import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { StudentAccountDto } from "@tesseracareerbridge/shared";
import { apiGet, ApiRequestError } from "../lib/api";
import { useAuth } from "../auth/AuthProvider";

interface StudentAccountContextValue {
  account: StudentAccountDto | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  setAccount: (account: StudentAccountDto) => void;
}

const StudentAccountContext = createContext<StudentAccountContextValue | null>(null);

export function StudentAccountProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [account, setAccount] = useState<StudentAccountDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<StudentAccountDto>("/students/me");
      setAccount(data);
    } catch (err) {
      setAccount(null);
      setError(err instanceof ApiRequestError ? err.message : "Unable to load your account.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    void reload();
  }, [user, reload]);

  const value = useMemo(
    () => ({ account, loading, error, reload, setAccount }),
    [account, loading, error, reload],
  );

  return <StudentAccountContext.Provider value={value}>{children}</StudentAccountContext.Provider>;
}

export function useStudentAccount() {
  const ctx = useContext(StudentAccountContext);
  if (!ctx) throw new Error("useStudentAccount must be used within StudentAccountProvider");
  return ctx;
}

export function useOptionalStudentAccount() {
  return useContext(StudentAccountContext);
}
