import { levelTitle } from "./levels";

export interface SheetRow {
  name: string;
  userId: string;
  password: string | null; // null when this student has no saved password
  level: number;
  linkCode: string | null;
}

/** Builds and downloads the Excel sheet a centre shares with its students:
 * name, User ID, password, level and test link. Runs in the browser. */
export async function downloadCredentialsSheet(
  rows: SheetRow[],
  origin: string,
  fileName: string
): Promise<void> {
  const { default: writeExcelFile } = await import("write-excel-file/universal");

  const header = ["Student Name", "User ID", "Password", "Level", "Test Link"].map((value) => ({
    value,
    fontWeight: "bold" as const,
  }));
  const body = rows.map((r) => [
    { value: r.name },
    { value: r.userId },
    { value: r.password ?? "-" },
    { value: levelTitle(r.level) },
    { value: r.linkCode ? `${origin}/t/${r.linkCode}` : "-" },
  ]);

  const blob = await writeExcelFile([header, ...body], {
    columns: [{ width: 28 }, { width: 20 }, { width: 14 }, { width: 22 }, { width: 58 }],
  }).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
