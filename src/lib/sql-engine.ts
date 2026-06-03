// Client-only SQLite via sql.js
import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";

let sqlPromise: Promise<SqlJsStatic> | null = null;

function getSql(): Promise<SqlJsStatic> {
  if (!sqlPromise) {
    sqlPromise = initSqlJs({ locateFile: () => "/wasm/sql-wasm.wasm" });
  }
  return sqlPromise;
}

export type QueryResult = {
  ok: true;
  columns: string[];
  rows: unknown[][];
} | {
  ok: false;
  error: string;
};

export async function createDb(setupSql: string): Promise<Database> {
  const SQL = await getSql();
  const db = new SQL.Database();
  db.exec(setupSql);
  return db;
}

export function runQuery(db: Database, sql: string): QueryResult {
  try {
    const res = db.exec(sql);
    if (res.length === 0) {
      return { ok: true, columns: [], rows: [] };
    }
    const last = res[res.length - 1];
    return { ok: true, columns: last.columns, rows: last.values as unknown[][] };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// Compare two result sets; ignores row order unless orderSensitive
export function compareResults(
  a: { columns: string[]; rows: unknown[][] },
  b: { columns: string[]; rows: unknown[][] },
  orderSensitive = false,
): boolean {
  if (a.columns.length !== b.columns.length) return false;
  if (a.rows.length !== b.rows.length) return false;
  const norm = (r: unknown[]) => r.map((v) => (v === null || v === undefined ? "∅" : String(v))).join("⏐");
  const A = a.rows.map(norm);
  const B = b.rows.map(norm);
  if (orderSensitive) return A.every((v, i) => v === B[i]);
  return [...A].sort().join("|") === [...B].sort().join("|");
}

export async function previewTables(db: Database): Promise<{ name: string; columns: string[]; rows: unknown[][] }[]> {
  const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
  if (tables.length === 0) return [];
  const names = tables[0].values.map((r) => r[0] as string);
  return names.map((name) => {
    const r = db.exec(`SELECT * FROM "${name}" LIMIT 50`);
    if (r.length === 0) return { name, columns: [], rows: [] };
    return { name, columns: r[0].columns, rows: r[0].values as unknown[][] };
  });
}
