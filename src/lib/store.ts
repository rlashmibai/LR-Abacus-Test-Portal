import { promises as fs } from "fs";
import path from "path";
import type { Student, TestSession, TestResult } from "./types";

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

export async function getStudents(): Promise<Student[]> {
  await ensureDirs();
  return readJson<Student[]>(STUDENTS_FILE, []);
}

export async function getStudent(id: string): Promise<Student | undefined> {
  const students = await getStudents();
  return students.find((s) => s.id === id || s.userId === id);
}

export async function saveSession(session: TestSession): Promise<void> {
  await ensureDirs();
  await writeJson(path.join(SESSIONS_DIR, `${session.id}.json`), session);
}

export async function getSession(id: string): Promise<TestSession | undefined> {
  await ensureDirs();
  return readJson<TestSession | undefined>(
    path.join(SESSIONS_DIR, `${id}.json`),
    undefined
  );
}

export async function getResults(): Promise<TestResult[]> {
  await ensureDirs();
  return readJson<TestResult[]>(RESULTS_FILE, []);
}

export async function getResult(id: string): Promise<TestResult | undefined> {
  const results = await getResults();
  return results.find((r) => r.id === id);
}

export async function saveResult(result: TestResult): Promise<void> {
  const results = await getResults();
  results.unshift(result);
  await writeJson(RESULTS_FILE, results);
}

export function newId(prefix = ""): string {
  const n = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}${n}`;
}
