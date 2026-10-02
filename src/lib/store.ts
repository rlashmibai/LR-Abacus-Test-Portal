import { promises as fs } from "fs";
import path from "path";
import type { Student, TestSession, TestResult, Center } from "./types";
import {
  isDbConfigured,
  dbGetStudents,
  dbGetStudent,
  dbSaveStudents,
  dbSaveSession,
  dbGetSession,
  dbGetResults,
  dbGetResult,
  dbSaveResult,
  dbNextCounter,
  dbGetCounter,
  dbLogPageView,
  dbGetPageViews,
  dbCreateCenter,
  dbGetCenter,
  dbGetCenters,
  dbGetStudentsByCenterId,
  dbInsertStudents,
  dbReserveCounterRange,
} from "./db";

export interface PageView {
  id: string;
  viewedAt: string;
}

// Local JSON files are used when no database is configured (e.g. local
// dev). On a deployment like Vercel, DATABASE_URL is set and everything
// routes to Postgres instead - see db.ts - since serverless hosts don't
// keep a writable, persistent filesystem between requests.

const DATA_DIR = path.join(process.cwd(), "data");
const SESSIONS_DIR = path.join(DATA_DIR, "sessions");
const STUDENTS_FILE = path.join(DATA_DIR, "students.json");
const RESULTS_FILE = path.join(DATA_DIR, "results.json");
const COUNTERS_FILE = path.join(DATA_DIR, "counters.json");
const PAGE_VIEWS_FILE = path.join(DATA_DIR, "pageViews.json");
const CENTERS_FILE = path.join(DATA_DIR, "centers.json");

async function ensureDirs() {
  await fs.mkdir(SESSIONS_DIR, { recursive: true });
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown) {
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}

async function fileGetStudents(): Promise<Student[]> {
  await ensureDirs();
  return readJson<Student[]>(STUDENTS_FILE, []);
}

async function fileGetStudent(id: string): Promise<Student | undefined> {
  const students = await fileGetStudents();
  const needle = id.toLowerCase();
  return students.find((s) => s.id === id || s.userId.toLowerCase() === needle);
}

async function fileSaveStudents(students: Student[]): Promise<void> {
  await ensureDirs();
  await writeJson(STUDENTS_FILE, students);
}

async function fileSaveSession(session: TestSession): Promise<void> {
  await ensureDirs();
  await writeJson(path.join(SESSIONS_DIR, `${session.id}.json`), session);
}

async function fileGetSession(id: string): Promise<TestSession | undefined> {
  await ensureDirs();
  return readJson<TestSession | undefined>(
    path.join(SESSIONS_DIR, `${id}.json`),
    undefined
  );
}

async function fileGetResults(): Promise<TestResult[]> {
  await ensureDirs();
  return readJson<TestResult[]>(RESULTS_FILE, []);
}

async function fileGetResult(id: string): Promise<TestResult | undefined> {
  const results = await fileGetResults();
  return results.find((r) => r.id === id);
}

async function fileSaveResult(result: TestResult): Promise<void> {
  const results = await fileGetResults();
  results.unshift(result);
  await writeJson(RESULTS_FILE, results);
}

async function fileNextCounter(name: string): Promise<number> {
  await ensureDirs();
  const counters = await readJson<Record<string, number>>(COUNTERS_FILE, {});
  const next = (counters[name] ?? 0) + 1;
  counters[name] = next;
  await writeJson(COUNTERS_FILE, counters);
  return next;
}

async function fileGetCounter(name: string): Promise<number> {
  await ensureDirs();
  const counters = await readJson<Record<string, number>>(COUNTERS_FILE, {});
  return counters[name] ?? 0;
}

async function fileReserveCounterRange(name: string, count: number): Promise<number> {
  await ensureDirs();
  const counters = await readJson<Record<string, number>>(COUNTERS_FILE, {});
  const first = (counters[name] ?? 0) + 1;
  counters[name] = (counters[name] ?? 0) + count;
  await writeJson(COUNTERS_FILE, counters);
  return first;
}

async function fileInsertStudents(newStudents: Student[]): Promise<number> {
  const students = await fileGetStudents();
  const taken = new Set(students.map((s) => s.userId.toLowerCase()));
  let inserted = 0;
  for (const s of newStudents) {
    if (taken.has(s.userId.toLowerCase())) continue;
    students.push(s);
    taken.add(s.userId.toLowerCase());
    inserted++;
  }
  await fileSaveStudents(students);
  return inserted;
}

async function fileLogPageView(id: string): Promise<void> {
  await ensureDirs();
  const views = await readJson<PageView[]>(PAGE_VIEWS_FILE, []);
  views.unshift({ id, viewedAt: new Date().toISOString() });
  await writeJson(PAGE_VIEWS_FILE, views);
}

async function fileGetPageViews(): Promise<PageView[]> {
  await ensureDirs();
  return readJson<PageView[]>(PAGE_VIEWS_FILE, []);
}

async function fileGetCenters(): Promise<Center[]> {
  return readJson<Center[]>(CENTERS_FILE, []);
}

async function fileGetCenter(idOrUserId: string): Promise<Center | undefined> {
  const centers = await fileGetCenters();
  const needle = idOrUserId.toLowerCase();
  return centers.find((c) => c.id === idOrUserId || c.userId.toLowerCase() === needle);
}

async function fileCreateCenter(center: Center): Promise<void> {
  const centers = await fileGetCenters();
  centers.push(center);
  await writeJson(CENTERS_FILE, centers);
}

async function fileGetStudentsByCenterId(centerId: string): Promise<Student[]> {
  const students = await fileGetStudents();
  return students.filter((s) => s.centerId === centerId);
}

export async function getStudents(): Promise<Student[]> {
  return isDbConfigured() ? dbGetStudents() : fileGetStudents();
}

export async function getStudent(id: string): Promise<Student | undefined> {
  return isDbConfigured() ? dbGetStudent(id) : fileGetStudent(id);
}

export async function saveStudents(students: Student[]): Promise<void> {
  return isDbConfigured() ? dbSaveStudents(students) : fileSaveStudents(students);
}

export async function saveSession(session: TestSession): Promise<void> {
  return isDbConfigured() ? dbSaveSession(session) : fileSaveSession(session);
}

export async function getSession(id: string): Promise<TestSession | undefined> {
  return isDbConfigured() ? dbGetSession(id) : fileGetSession(id);
}

export async function getResults(): Promise<TestResult[]> {
  return isDbConfigured() ? dbGetResults() : fileGetResults();
}

export async function getResult(id: string): Promise<TestResult | undefined> {
  return isDbConfigured() ? dbGetResult(id) : fileGetResult(id);
}

export async function saveResult(result: TestResult): Promise<void> {
  return isDbConfigured() ? dbSaveResult(result) : fileSaveResult(result);
}

/** Atomically bump a named counter and return its new value - backs
 * both the STUD_### and GUEST_### sequences below, so two people
 * registering or starting a guest session at the same moment never
 * collide on the same number. */
export async function nextCounterValue(name: string): Promise<number> {
  return isDbConfigured() ? dbNextCounter(name) : fileNextCounter(name);
}

/** Read a counter's current value without incrementing it - for display
 * purposes (e.g. an admin dashboard), unlike nextCounterValue above. */
export async function getCounterValue(name: string): Promise<number> {
  return isDbConfigured() ? dbGetCounter(name) : fileGetCounter(name);
}

/** Logs one homepage view with its own timestamp, so the admin
 * dashboard can list individual visits with a real date/time - not
 * just a running total. */
export async function logPageView(): Promise<void> {
  const id = newId("view_");
  return isDbConfigured() ? dbLogPageView(id) : fileLogPageView(id);
}

export async function getPageViews(): Promise<PageView[]> {
  return isDbConfigured() ? dbGetPageViews() : fileGetPageViews();
}

export async function createCenter(center: Center): Promise<void> {
  return isDbConfigured() ? dbCreateCenter(center) : fileCreateCenter(center);
}

export async function getCenter(idOrUserId: string): Promise<Center | undefined> {
  return isDbConfigured() ? dbGetCenter(idOrUserId) : fileGetCenter(idOrUserId);
}

export async function getCenters(): Promise<Center[]> {
  return isDbConfigured() ? dbGetCenters() : fileGetCenters();
}

export async function getStudentsByCenterId(centerId: string): Promise<Student[]> {
  return isDbConfigured()
    ? dbGetStudentsByCenterId(centerId)
    : fileGetStudentsByCenterId(centerId);
}

/** Student and centre sign-in IDs share one namespace, since a single
 * sign-in page serves both - so a new ID must be free in both tables. */
export async function isUserIdTaken(userId: string): Promise<boolean> {
  const [student, center] = await Promise.all([getStudent(userId), getCenter(userId)]);
  return Boolean(student || center);
}

/** Reserves `count` sequential student ids ("STUD_007", "STUD_008", ...) in
 * one step - the bulk-upload counterpart of nextStudentId(). */
export async function nextStudentIds(count: number): Promise<string[]> {
  if (count <= 0) return [];
  const first = isDbConfigured()
    ? await dbReserveCounterRange("student", count)
    : await fileReserveCounterRange("student", count);
  return Array.from({ length: count }, (_, i) => `STUD_${String(first + i).padStart(3, "0")}`);
}

/** Adds new students without re-saving everyone who already exists
 * (unlike saveStudents). Returns how many were actually inserted. */
export async function addStudents(students: Student[]): Promise<number> {
  return isDbConfigured() ? dbInsertStudents(students) : fileInsertStudents(students);
}

/** The next sequential "CTR_001", "CTR_002", ... id for a newly
 * registered centre. */
export async function nextCenterId(): Promise<string> {
  const n = await nextCounterValue("center");
  return `CTR_${String(n).padStart(3, "0")}`;
}

/** The next sequential "STUD_001", "STUD_002", ... id for a newly
 * registered student. */
export async function nextStudentId(): Promise<string> {
  const n = await nextCounterValue("student");
  return `STUD_${String(n).padStart(3, "0")}`;
}

/** The next sequential "GUEST_001", "GUEST_002", ... id for a guest
 * session. Guests are still never persisted to the students table (see
 * the guest auth route) - this counter exists purely so the numbering
 * itself doubles as a rough count of how many times "try as guest" has
 * been used. */
export async function nextGuestId(): Promise<string> {
  const n = await nextCounterValue("guest");
  return `GUEST_${String(n).padStart(3, "0")}`;
}

export function newId(prefix = ""): string {
  // Timestamp + random suffix: unique per call even across many tests in
  // quick succession, which matters since each test's question set is
  // seeded from this id.
  const stamp = Date.now().toString(36);
  const rand = Math.floor(Math.random() * 46656)
    .toString(36)
    .padStart(3, "0");
  return `${prefix}${stamp}${rand}`;
}
