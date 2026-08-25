import { promises as fs } from "fs";
import path from "path";
import type { Student, TestSession, TestResult } from "./types";
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
} from "./db";

// Local JSON files are used when no database is configured (e.g. local
// dev). On a deployment like Vercel, DATABASE_URL is set and everything
// routes to Postgres instead - see db.ts - since serverless hosts don't
// keep a writable, persistent filesystem between requests.

const DATA_DIR = path.join(process.cwd(), "data");
const SESSIONS_DIR = path.join(DATA_DIR, "sessions");
const STUDENTS_FILE = path.join(DATA_DIR, "students.json");
const RESULTS_FILE = path.join(DATA_DIR, "results.json");
const COUNTERS_FILE = path.join(DATA_DIR, "counters.json");

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
