SELECT typname, enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid ORDER BY typname, enumsortorder;
