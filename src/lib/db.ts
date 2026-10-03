import { neon } from "@neondatabase/serverless";
import type { Student, TestSession, TestResult, Center, TestLink } from "./types";

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
          password_hash TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      // The table already existed without this column on earlier
      // deployments - add it if missing so registration date is tracked
      // going forward (pre-existing rows get "now" as a placeholder,
      // since their real signup date was never recorded).
      await sql`
        ALTER TABLE students ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
        CREATE TABLE IF NOT EXISTS counters (
          name TEXT PRIMARY KEY,
          value INTEGER NOT NULL DEFAULT 0
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS page_views (
          id TEXT PRIMARY KEY,
          viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS centers (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          user_id TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      // Links a student to the center/teacher who created their profile -
      // NULL means an independent, self-registered student (unchanged
      // behavior for every account that existed before this feature).
      await sql`
        ALTER TABLE students ADD COLUMN IF NOT EXISTS center_id TEXT REFERENCES centers(id)
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS test_links (
          code TEXT PRIMARY KEY,
          center_id TEXT NOT NULL REFERENCES centers(id),
          level INTEGER NOT NULL,
          mode TEXT NOT NULL,
          question_count INTEGER NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
  created_at: string;
  center_id: string | null;
}

function rowToStudent(row: StudentRow): Student {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    centerName: row.center_name,
    level: row.level,
    passwordHash: row.password_hash ?? undefined,
    createdAt: row.created_at,
    centerId: row.center_id ?? undefined,
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
      INSERT INTO students (id, user_id, name, center_name, level, password_hash, center_id)
      VALUES (${s.id}, ${s.userId}, ${s.name}, ${s.centerName}, ${s.level}, ${s.passwordHash ?? null}, ${s.centerId ?? null})
      ON CONFLICT (id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        name = EXCLUDED.name,
        center_name = EXCLUDED.center_name,
        level = EXCLUDED.level,
        password_hash = EXCLUDED.password_hash,
        center_id = EXCLUDED.center_id
    `;
  }
}

export async function dbSetStudentLevel(studentId: string, level: string): Promise<void> {
  await ensureSchema();
  const sql = getSql();
  await sql`UPDATE students SET level = ${level} WHERE id = ${studentId}`;
}

interface CenterRow {
  id: string;
  name: string;
  user_id: string;
  password_hash: string;
  created_at: string;
}

function rowToCenter(row: CenterRow): Center {
  return {
    id: row.id,
    name: row.name,
    userId: row.user_id,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

export async function dbCreateCenter(center: Center): Promise<void> {
  await ensureSchema();
  const sql = getSql();
  await sql`
    INSERT INTO centers (id, name, user_id, password_hash)
    VALUES (${center.id}, ${center.name}, ${center.userId}, ${center.passwordHash})
  `;
}

export async function dbGetCenter(idOrUserId: string): Promise<Center | undefined> {
  await ensureSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM centers WHERE id = ${idOrUserId} OR lower(user_id) = lower(${idOrUserId}) LIMIT 1
  `) as unknown as CenterRow[];
  return rows[0] ? rowToCenter(rows[0]) : undefined;
}

export async function dbGetCenters(): Promise<Center[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = (await sql`SELECT * FROM centers`) as unknown as CenterRow[];
  return rows.map(rowToCenter);
}

interface TestLinkRow {
  code: string;
  center_id: string;
  level: number;
  mode: string;
  question_count: number;
  created_at: string;
}

function rowToTestLink(row: TestLinkRow): TestLink {
  return {
    code: row.code,
    centerId: row.center_id,
    level: row.level,
    mode: row.mode === "practice" ? "practice" : "exam",
    questionCount: row.question_count,
    createdAt: row.created_at,
  };
}

export async function dbCreateTestLink(link: TestLink): Promise<void> {
  await ensureSchema();
  const sql = getSql();
  await sql`
    INSERT INTO test_links (code, center_id, level, mode, question_count)
    VALUES (${link.code}, ${link.centerId}, ${link.level}, ${link.mode}, ${link.questionCount})
  `;
}

export async function dbGetTestLink(code: string): Promise<TestLink | undefined> {
  await ensureSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM test_links WHERE code = ${code} LIMIT 1
  `) as unknown as TestLinkRow[];
  return rows[0] ? rowToTestLink(rows[0]) : undefined;
}

export async function dbGetTestLinksByCenterId(centerId: string): Promise<TestLink[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM test_links WHERE center_id = ${centerId} ORDER BY level, created_at
  `) as unknown as TestLinkRow[];
  return rows.map(rowToTestLink);
}

export async function dbDeleteTestLink(code: string): Promise<void> {
  await ensureSchema();
  const sql = getSql();
  await sql`DELETE FROM test_links WHERE code = ${code}`;
}

export async function dbGetStudentsByCenterId(centerId: string): Promise<Student[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM students WHERE center_id = ${centerId}
  `) as unknown as StudentRow[];
  return rows.map(rowToStudent);
}

/** Inserts many new students in a single query (a bulk upload would
 * otherwise mean one round-trip per student). Rows whose user_id already
 * exists are skipped rather than failing the whole batch; returns how many
 * were actually inserted. */
export async function dbInsertStudents(students: Student[]): Promise<number> {
  if (students.length === 0) return 0;
  await ensureSchema();
  const sql = getSql();
  const rows = (await sql`
    INSERT INTO students (id, user_id, name, center_name, level, password_hash, center_id)
    SELECT * FROM unnest(
      ${students.map((s) => s.id)}::text[],
      ${students.map((s) => s.userId)}::text[],
      ${students.map((s) => s.name)}::text[],
      ${students.map((s) => s.centerName)}::text[],
      ${students.map((s) => s.level)}::text[],
      ${students.map((s) => s.passwordHash ?? null)}::text[],
      ${students.map((s) => s.centerId ?? null)}::text[]
    )
    ON CONFLICT (user_id) DO NOTHING
    RETURNING id
  `) as unknown as { id: string }[];
  return rows.length;
}

/** Atomically reserves `count` consecutive numbers from a named counter and
 * returns the first one - a bulk version of dbNextCounter. */
export async function dbReserveCounterRange(name: string, count: number): Promise<number> {
  await ensureSchema();
  const sql = getSql();
  const rows = (await sql`
    INSERT INTO counters (name, value) VALUES (${name}, ${count})
    ON CONFLICT (name) DO UPDATE SET value = counters.value + ${count}
    RETURNING value
  `) as unknown as { value: number }[];
  return rows[0].value - count + 1;
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

/** Atomically bump a named counter and return its new value - used to
 * hand out sequential STUD_### and GUEST_### numbers without a race
 * between two people signing up/starting a guest session at once. */
export async function dbNextCounter(name: string): Promise<number> {
  await ensureSchema();
  const sql = getSql();
  const rows = (await sql`
    INSERT INTO counters (name, value) VALUES (${name}, 1)
    ON CONFLICT (name) DO UPDATE SET value = counters.value + 1
    RETURNING value
  `) as unknown as { value: number }[];
  return rows[0].value;
}

/** Read-only lookup of a counter's current value - unlike dbNextCounter,
 * this never increments it. Used to display a total without consuming
 * one of the sequential IDs it hands out. */
export async function dbGetCounter(name: string): Promise<number> {
  await ensureSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT value FROM counters WHERE name = ${name} LIMIT 1
  `) as unknown as { value: number }[];
  return rows[0]?.value ?? 0;
}

/** Logs one homepage load with its own timestamp (not just a running
 * total) so the admin dashboard can show a real date/time per visit. */
export async function dbLogPageView(id: string): Promise<void> {
  await ensureSchema();
  const sql = getSql();
  await sql`INSERT INTO page_views (id) VALUES (${id})`;
}

export async function dbGetPageViews(): Promise<{ id: string; viewedAt: string }[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT id, viewed_at FROM page_views ORDER BY viewed_at DESC
  `) as unknown as { id: string; viewed_at: string }[];
  return rows.map((r) => ({ id: r.id, viewedAt: r.viewed_at }));
}

export async function dbSaveResult(result: TestResult): Promise<void> {
  await ensureSchema();
  const sql = getSql();
  await sql`
    INSERT INTO results (id, student_id, data)
    VALUES (${result.id}, ${result.studentId}, ${JSON.stringify(result)}::jsonb)
  `;
}
