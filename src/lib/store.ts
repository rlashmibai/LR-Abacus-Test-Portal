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
} from "./db";

// Local JSON files are used when no database is configured (e.g. local
// dev). On a deployment like Vercel, DATABASE_URL is set and everything
// routes to Postgres instead - see db.ts - since serverless hosts don't
// keep a writable, persistent filesystem between requests.

const DATA_DIR = path.join(process.cwd(), "data");
const SESSIONS_DIR = path.join(DATA_DIR, "sessions");
const STUDENTS_FILE = path.join(DATA_DIR, "students.json");
const RESULTS_FILE = path.join(DATA_DIR, "results.json");

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
