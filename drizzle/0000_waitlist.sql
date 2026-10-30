CREATE TABLE IF NOT EXISTS waitlist (
  id INTEGER PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  referral TEXT NOT NULL,
  role TEXT NOT NULL,
  consent_at TEXT NOT NULL,
  UNIQUE(email, role)
);
