"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Download, Loader2, CheckCircle2, FileSpreadsheet } from "lucide-react";

interface ParsedRow {
  row: number; // row number in the teacher's spreadsheet (header is row 1)
  name: string;
  userId: string;
  password: string;
  level: string; // optional in the file - blank means Level 1, checked by the server
}

interface UploadResult {
  created: number;
  skipped: { row: number; userId: string; reason: string }[];
}

const MAX_ROWS = 200;

// Accepted spellings for each column heading, compared after lower-casing
// and stripping spaces/punctuation, so "User ID", "user_id" and "UserID"
// all match.
const HEADINGS = {
  name: ["studentname", "name", "fullname"],
  userId: ["userid", "username", "loginid"],
  password: ["password", "pass"],
  level: ["level", "studentlevel"],
};

function normalise(value: unknown): string {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function cellText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function parseCsv(text: string): string[][] {
  const clean = text.replace(/^﻿/, "");
  // Excel in some regions saves CSVs with semicolons instead of commas.
  const firstLine = clean.split(/\r?\n/)[0] ?? "";
  const delimiter = firstLine.split(";").length > firstLine.split(",").length ? ";" : ",";

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (inQuotes) {
      if (ch === '"' && clean[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && clean[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

async function readRows(file: File): Promise<unknown[][]> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv")) return parseCsv(await file.text());
  if (name.endsWith(".xlsx")) {
    const { readSheet } = await import("read-excel-file/universal");
    return (await readSheet(file)) as unknown[][];
  }
  throw new Error(
    name.endsWith(".xls")
      ? "Old .xls files aren't supported - in Excel, use File > Save As and choose .xlsx."
      : "Please choose an Excel (.xlsx) or CSV (.csv) file."
  );
}

function toStudentRows(rows: unknown[][]): ParsedRow[] {
  if (rows.length === 0) throw new Error("That file looks empty.");

  const header = rows[0].map(normalise);
  const find = (aliases: string[]) => header.findIndex((h) => aliases.includes(h));
  const nameCol = find(HEADINGS.name);
  const userIdCol = find(HEADINGS.userId);
  const passwordCol = find(HEADINGS.password);
  const levelCol = find(HEADINGS.level); // optional - -1 when the file has no Level column

  if (nameCol === -1 || userIdCol === -1 || passwordCol === -1) {
    throw new Error(
      'The first row needs the headings "Student Name", "User ID" and "Password" - download the template to see the layout.'
    );
  }

  const parsed: ParsedRow[] = [];
  rows.slice(1).forEach((r, i) => {
    const name = cellText(r[nameCol]);
    const userId = cellText(r[userIdCol]);
    const password = cellText(r[passwordCol]);
    const level = levelCol === -1 ? "" : cellText(r[levelCol]);
    if (!name && !userId && !password) return; // blank row
    parsed.push({ row: i + 2, name, userId, password, level });
  });

  if (parsed.length === 0) throw new Error("No student rows found under the headings.");
  return parsed;
}

async function downloadTemplate() {
  const { default: writeExcelFile } = await import("write-excel-file/universal");
  const blob = await writeExcelFile(
    [
      [
        { value: "Student Name", fontWeight: "bold" },
        { value: "User ID", fontWeight: "bold" },
        { value: "Password", fontWeight: "bold" },
        { value: "Level", fontWeight: "bold" },
      ],
    ],
    { columns: [{ width: 28 }, { width: 22 }, { width: 22 }, { width: 12 }] }
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "student-upload-template.xlsx";
  link.click();
  URL.revokeObjectURL(url);
}

export default function BulkUploadStudents() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedRow[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // so choosing the same (fixed) file again re-triggers
    if (!file) return;

    setParsed(null);
    setParseError(null);
    setUploadError(null);
    setResult(null);
    setFileName(file.name);

    try {
      setParsed(toStudentRows(await readRows(file)));
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Couldn't read that file.");
    }
  }

  async function handleUpload() {
    if (!parsed) return;
    setUploading(true);
    setUploadError(null);
    try {
      const res = await fetch("/api/center/students/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: parsed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? "Something went wrong. Please try again.");
        setUploading(false);
        return;
      }
      setResult({ created: data.created, skipped: data.skipped });
      setParsed(null);
      setFileName(null);
      setUploading(false);
      router.refresh();
    } catch {
      setUploadError("Something went wrong. Please try again.");
      setUploading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-3 text-sm font-semibold text-brand transition hover:bg-brand-soft"
      >
        <FileSpreadsheet size={16} />
        Bulk Upload (Excel / CSV)
      </button>
    );
  }

  const tooMany = parsed !== null && parsed.length > MAX_ROWS;

  return (
    <div className="space-y-4 rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-ink">
            Add many students at once
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            Upload an Excel (.xlsx) or CSV file with one student per row.
          </p>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-sm font-semibold text-ink-soft hover:text-ink"
        >
          Close
        </button>
      </div>

      <ol className="space-y-1.5 text-sm text-ink-soft">
        <li>
          <span className="font-semibold text-ink">1.</span> Download the template and fill
          in a row per student - <span className="font-medium">Student Name</span>,{" "}
          <span className="font-medium">User ID</span>, <span className="font-medium">Password</span>{" "}
          (at least 4 characters) and, if you like, <span className="font-medium">Level</span>{" "}
          (a number from 1 to 6 - leave it blank for Level 1).
        </li>
        <li>
          <span className="font-semibold text-ink">2.</span> Choose your finished file below
          (up to {MAX_ROWS} students per upload).
        </li>
        <li>
          <span className="font-semibold text-ink">3.</span> Each User ID must be unique across
          the whole site. Any rows that can&apos;t be added are listed afterwards, so you can fix
          just those and upload them again.
        </li>
      </ol>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={downloadTemplate}
          className="flex items-center gap-2 rounded-xl border border-line bg-paper px-4 py-2.5 text-sm font-semibold text-ink-soft transition hover:text-brand"
        >
          <Download size={15} />
          Download template
        </button>

        <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark">
          <Upload size={15} />
          Choose file
          <input
            type="file"
            accept=".xlsx,.csv"
            onChange={handleFile}
            className="sr-only"
          />
        </label>
      </div>

      {parseError && (
        <p className="rounded-lg bg-bad-soft px-3 py-2 text-sm font-medium text-bad">
          {parseError}
        </p>
      )}

      {parsed && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-paper px-4 py-3">
          <p className="text-sm text-ink">
            <span className="font-semibold">{parsed.length}</span> student
            {parsed.length === 1 ? "" : "s"} found in{" "}
            <span className="font-medium">{fileName}</span>
            {tooMany && (
              <span className="mt-1 block text-bad">
                That&apos;s over the {MAX_ROWS}-student limit per upload - please split the file.
              </span>
            )}
          </p>
          <button
            onClick={handleUpload}
            disabled={uploading || tooMany}
            className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Adding...
              </>
            ) : (
              `Add ${parsed.length} student${parsed.length === 1 ? "" : "s"}`
            )}
          </button>
        </div>
      )}

      {uploadError && (
        <p className="rounded-lg bg-bad-soft px-3 py-2 text-sm font-medium text-bad">
          {uploadError}
        </p>
      )}

      {result && (
        <div className="space-y-3 rounded-xl bg-paper px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <CheckCircle2 size={16} className="text-good" />
            {result.created} student{result.created === 1 ? "" : "s"} added
            {result.skipped.length > 0 && (
              <span className="font-medium text-bad">
                {" "}
                - {result.skipped.length} row{result.skipped.length === 1 ? "" : "s"} skipped
              </span>
            )}
          </p>
          {result.skipped.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-ink-faint">
                    <th className="pb-1.5 pr-4">Row</th>
                    <th className="pb-1.5 pr-4">User ID</th>
                    <th className="pb-1.5">Why it was skipped</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {result.skipped.map((s, i) => (
                    <tr key={i}>
                      <td className="py-1.5 pr-4 text-ink-soft">{s.row > 0 ? s.row : "-"}</td>
                      <td className="py-1.5 pr-4 text-ink-soft">{s.userId || "-"}</td>
                      <td className="py-1.5 text-ink">{s.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
