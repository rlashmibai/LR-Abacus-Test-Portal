import { neon } from "@neondatabase/serverless";
import type { Student, TestSession, TestResult } from "./types";

// The demo account, seeded once so a fresh deployment has something to
// sign in with immediately. Same account/password as local dev.
const DEMO_STUDENT = {
  id: "5506",
  userId: "XGDEMOL3001",
  name: "XGDEMOL3",
  centerName: "XTRAGENIUS",
  level: "LEVEL 3",
  passwordHash:
    "b9b4dfe3ed467382b993ca218376a915:0ff8c62db3054b4dfc9985d5e6918a84c8b7d02ecf608e29c8a0e60b535f6a7d0b5bff8a51ff31fa70dd92ff869e17e0553215f2a4e6c53e37e98bd70e3f8417",
};

function connectionString(): string | undefined {
  // Vercel's Neon integration commonly injects one of these names
  // depending on how the database was provisioned.
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED
  );
}

export function isDbConfigured(): boolean {
  return Boolean(connectionString());
}

type SqlClient = ReturnType<typeof neon>;
let sqlClient: SqlClient | null = null;

function getSql(): SqlClient {
  if (!sqlClient) {
    const conn = connectionString();
    if (!conn) throw new Error("No database connection string configured");
    sqlClient = neon(conn);
  }
  return sqlClient;
}

let schemaReady: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = getSql();
      await sql`
        CREATE TABLE IF NOT EXISTS students (
          id TEXT PRIMARY KEY,
          user_id TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          center_name TEXT NOT NULL,
          level TEXT NOT NULL,
          password_hash TEXT
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS test_sessions (
          id TEXT PRIMARY KEY,
          student_id TEXT NOT NULL,
          data JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS results (
          id TEXT PRIMARY KEY,
          student_id TEXT NOT NULL,
          data JSONB NOT NULL,
          submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;

      await sql`
        INSERT INTO students (id, user_id, name, center_name, level, password_hash)
        VALUES (
          ${DEMO_STUDENT.id}, ${DEMO_STUDENT.userId}, ${DEMO_STUDENT.name},
          ${DEMO_STUDENT.centerName}, ${DEMO_STUDENT.level}, ${DEMO_STUDENT.passwordHash}
        )
        ON CONFLICT (user_id) DO NOTHING
      `;
    })();
  }
  return schemaReady;
}

interface StudentRow {
  id: string;
  user_id: string;
  name: string;
  center_name: string;
  level: string;
  password_hash: string | null;
}

function rowToStudent(row: StudentRow): Student {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    centerName: row.center_name,
    level: row.level,
    passwordHash: row.password_hash ?? undefined,
  };
}

export async function dbGetStudents(): Promise<Student[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = (await sql`SELECT * FROM students`) as unknown as StudentRow[];
  return rows.map(rowToStudent);
}

export async function dbGetStudent(id: string): Promise<Student | undefined> {
  await ensureSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM students WHERE id = ${id} OR lower(user_id) = lower(${id}) LIMIT 1
  `) as unknown as StudentRow[];
  return rows[0] ? rowToStudent(rows[0]) : undefined;
}

export async function dbSaveStudents(students: Student[]): Promise<void> {
  await ensureSchema();
  const sql = getSql();
  for (const s of students) {
    await sql`
      INSERT INTO students (id, user_id, name, center_name, level, password_hash)
      VALUES (${s.id}, ${s.userId}, ${s.name}, ${s.centerName}, ${s.level}, ${s.passwordHash ?? null})
      ON CONFLICT (id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        name = EXCLUDED.name,
        center_name = EXCLUDED.center_name,
        level = EXCLUDED.level,
        password_hash = EXCLUDED.password_hash
    `;
  }
}

export async function dbSaveSession(session: TestSession): Promise<void> {
  await ensureSchema();
  const sql = getSql();
  await sql`
    INSERT INTO test_sessions (id, student_id, data)
    VALUES (${session.id}, ${session.studentId}, ${JSON.stringify(session)}::jsonb)
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
  `;
}

export async function dbGetSession(id: string): Promise<TestSession | undefined> {
  await ensureSchema();
  const sql = getSql();
  const rows = (await sql`SELECT data FROM test_sessions WHERE id = ${id} LIMIT 1`) as unknown as {
    data: TestSession;
  }[];
  return rows[0]?.data;
}

export async function dbGetResults(): Promise<TestResult[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT data FROM results ORDER BY submitted_at DESC
  `) as unknown as { data: TestResult }[];
  return rows.map((r) => r.data);
}

export async function dbGetResult(id: string): Promise<TestResult | undefined> {
  await ensureSchema();
  const sql = getSql();
  const rows = (await sql`SELECT data FROM results WHERE id = ${id} LIMIT 1`) as unknown as {
    data: TestResult;
  }[];
  return rows[0]?.data;
}

export async function dbSaveResult(result: TestResult): Promise<void> {
  await ensureSchema();
  const sql = getSql();
  await sql`
    INSERT INTO results (id, student_id, data)
    VALUES (${result.id}, ${result.studentId}, ${JSON.stringify(result)}::jsonb)
  `;
}
