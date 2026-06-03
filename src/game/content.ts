import type { Arc, Mission } from "./types";

// Shared base seed building blocks used across arcs (each mission re-creates only what it needs).
const employees = `
CREATE TABLE employees (
  emp_id INTEGER PRIMARY KEY,
  name TEXT,
  department TEXT,
  level INTEGER,
  status TEXT
);
INSERT INTO employees VALUES
 (1,'Mara Vex','Security',7,'active'),
 (2,'Renko Tao','Finance',9,'active'),
 (3,'Iris Cole','R&D',4,'active'),
 (4,'Juno Kade','Logistics',3,'inactive'),
 (5,'Soren Hale','Executive',10,'active'),
 (6,'Lyra Sato','R&D',6,'active'),
 (7,'Drex Mor','Security',2,'inactive'),
 (8,'Nyx Vell','Finance',8,'active'),
 (9,'Kade Onyx','Logistics',5,'active'),
 (10,'Vera Lin','Executive',10,'active');
`;

const accessLogs = `
CREATE TABLE access_logs (
  log_id INTEGER PRIMARY KEY,
  emp_id INTEGER,
  door TEXT,
  access_time TEXT,
  result TEXT
);
INSERT INTO access_logs VALUES
 (1,1,'LAB-3','2087-04-12 22:01','granted'),
 (2,3,'LAB-3','2087-04-12 22:14','granted'),
 (3,7,'VAULT-1','2087-04-12 23:02','denied'),
 (4,5,'EXEC-FLOOR','2087-04-13 01:30','granted'),
 (5,2,'VAULT-1','2087-04-13 02:11','granted'),
 (6,8,'VAULT-1','2087-04-13 02:45','granted'),
 (7,4,'LOADING-BAY','2087-04-13 04:00','denied'),
 (8,6,'LAB-3','2087-04-13 06:21','granted'),
 (9,9,'LOADING-BAY','2087-04-13 06:30','granted'),
 (10,1,'EXEC-FLOOR','2087-04-13 08:00','denied');
`;

const transactions = `
CREATE TABLE transactions (
  tx_id INTEGER PRIMARY KEY,
  emp_id INTEGER,
  amount INTEGER,
  tx_time TEXT,
  location TEXT
);
INSERT INTO transactions VALUES
 (1,2,50000,'2087-04-10','Offshore-7'),
 (2,2,75000,'2087-04-11','Offshore-7'),
 (3,8,12000,'2087-04-11','City-Bank'),
 (4,2,90000,'2087-04-12','Offshore-7'),
 (5,5,5000,'2087-04-12','City-Bank'),
 (6,8,40000,'2087-04-13','Offshore-7'),
 (7,10,3000,'2087-04-13','City-Bank'),
 (8,2,120000,'2087-04-14','Offshore-7');
`;

const devices = `
CREATE TABLE devices (
  device_id INTEGER PRIMARY KEY,
  emp_id INTEGER,
  device_type TEXT,
  last_seen_ip TEXT,
  compromised INTEGER
);
INSERT INTO devices VALUES
 (1,1,'phone','10.0.0.4',0),
 (2,2,'laptop','198.51.100.7',1),
 (3,3,'phone','10.0.0.9',0),
 (4,5,'laptop','203.0.113.2',1),
 (5,6,'tablet',NULL,0),
 (6,8,'laptop','198.51.100.9',1),
 (7,9,'phone','10.0.0.15',0);
`;

// Helper to build missions tersely
const M = (m: Mission): Mission => m;

const arc1: Arc = {
  id: 1,
  codename: "ROOKIE_OPERATOR",
  title: "Arc 1 — Rookie Operator",
  tagline: "First night on Ghostline. Learn to read the city's data.",
  episodes: [
    {
      id: "1.1", arcId: 1, number: 1, title: "The Breach",
      brief: "NEXACORP leaked access logs. Pull them up.",
      missions: [M({
        id: "1.1", title: "Read the leaked logs",
        story: "// GHOSTLINE > Welcome aboard, operator. NEXACORP just lost a chunk of their access logs to a leak. We need eyes on them. Pull every row.",
        objective: "Return all rows from access_logs.",
        hint: "SELECT * FROM table_name",
        setupSql: accessLogs,
        expectedSql: "SELECT * FROM access_logs;",
        xp: 50, concepts: ["SELECT"],
      })],
    },
    {
      id: "1.2", arcId: 1, number: 2, title: "Night Shift Logs",
      brief: "Filter the noise. Show only LAB-3 entries.",
      missions: [M({
        id: "1.2", title: "Filter by door",
        story: "// Something happened inside LAB-3 last night. Isolate that door only.",
        objective: "Return all access_logs where door = 'LAB-3'.",
        hint: "Use WHERE door = 'LAB-3'",
        setupSql: accessLogs,
        expectedSql: "SELECT * FROM access_logs WHERE door = 'LAB-3';",
        xp: 60, concepts: ["WHERE"],
      })],
    },
    {
      id: "1.3", arcId: 1, number: 3, title: "Denied Access",
      brief: "Combine conditions to find rejected vault attempts.",
      missions: [M({
        id: "1.3", title: "AND / OR",
        story: "// Someone tried to crack VAULT-1 and got bounced. Find every denied attempt at VAULT-1.",
        objective: "All access_logs rows where door = 'VAULT-1' AND result = 'denied'.",
        hint: "WHERE ... AND ...",
        setupSql: accessLogs,
        expectedSql: "SELECT * FROM access_logs WHERE door = 'VAULT-1' AND result = 'denied';",
        xp: 70, concepts: ["WHERE", "AND/OR"],
      })],
    },
    {
      id: "1.4", arcId: 1, number: 4, title: "High-Level Ghosts",
      brief: "Find the top-ranked active employees.",
      missions: [M({
        id: "1.4", title: "ORDER BY + LIMIT",
        story: "// Who's still walking the executive floors? Show the 3 highest-level ACTIVE employees, ranked by level.",
        objective: "Top 3 active employees by level (highest first). Return name and level.",
        hint: "ORDER BY level DESC LIMIT 3",
        setupSql: employees,
        expectedSql: "SELECT name, level FROM employees WHERE status='active' ORDER BY level DESC LIMIT 3;",
        orderSensitive: true,
        xp: 80, concepts: ["ORDER BY", "LIMIT"],
      })],
    },
    {
      id: "1.5", arcId: 1, number: 5, title: "Clean the Trail",
      brief: "Wipe a compromising row before sunrise.",
      missions: [M({
        id: "1.5", title: "DELETE the trail",
        story: "// Drex Mor's denied attempt at VAULT-1 ties back to us. Delete log_id = 3.",
        objective: "After your query, access_logs must no longer contain log_id = 3.",
        hint: "DELETE FROM access_logs WHERE log_id = 3;",
        setupSql: accessLogs,
        expectedSql: "DELETE FROM access_logs WHERE log_id = 3; SELECT * FROM access_logs;",
        xp: 90, concepts: ["DELETE"],
      })],
    },
  ],
};

const arc2: Arc = {
  id: 2,
  codename: "INSIDE_MAN",
  title: "Arc 2 — Inside Man",
  tagline: "Cross-reference everything. Find the mole.",
  episodes: [
    {
      id: "2.1", arcId: 2, number: 1, title: "Employee Web",
      brief: "Join names to access events.",
      missions: [M({
        id: "2.1", title: "INNER JOIN",
        story: "// Logs only show emp_id. Put names on them. Join employees and access_logs.",
        objective: "Return name and door for every access_logs row.",
        hint: "JOIN employees ON employees.emp_id = access_logs.emp_id",
        setupSql: employees + accessLogs,
        expectedSql: "SELECT e.name, l.door FROM access_logs l JOIN employees e ON e.emp_id = l.emp_id;",
        xp: 100, concepts: ["JOIN"],
      })],
    },
    {
      id: "2.2", arcId: 2, number: 2, title: "Missing Signals",
      brief: "Some employees never carried a device. Find them.",
      missions: [M({
        id: "2.2", title: "LEFT JOIN + IS NULL",
        story: "// Devices that go offline can't be tracked. Find employees with NO device on record.",
        objective: "Return name of every employee that has no row in devices.",
        hint: "LEFT JOIN ... WHERE devices.device_id IS NULL",
        setupSql: employees + devices,
        expectedSql: "SELECT e.name FROM employees e LEFT JOIN devices d ON d.emp_id = e.emp_id WHERE d.device_id IS NULL;",
        xp: 110, concepts: ["LEFT JOIN", "NULL"],
      })],
    },
    {
      id: "2.3", arcId: 2, number: 3, title: "Follow the Money",
      brief: "Aggregate transactions per employee.",
      missions: [M({
        id: "2.3", title: "GROUP BY + SUM",
        story: "// Money is moving offshore. Sum total amount per emp_id.",
        objective: "Return emp_id and SUM(amount) for every employee with transactions.",
        hint: "GROUP BY emp_id",
        setupSql: transactions,
        expectedSql: "SELECT emp_id, SUM(amount) AS total FROM transactions GROUP BY emp_id;",
        xp: 120, concepts: ["GROUP BY", "SUM"],
      })],
    },
    {
      id: "2.4", arcId: 2, number: 4, title: "Suspicious Patterns",
      brief: "HAVING isolates the big spenders.",
      missions: [M({
        id: "2.4", title: "HAVING",
        story: "// Anyone moving more than 200k is a flag. Find them.",
        objective: "Return emp_id and total amount for employees with SUM(amount) > 200000.",
        hint: "GROUP BY emp_id HAVING SUM(amount) > 200000",
        setupSql: transactions,
        expectedSql: "SELECT emp_id, SUM(amount) AS total FROM transactions GROUP BY emp_id HAVING SUM(amount) > 200000;",
        xp: 130, concepts: ["HAVING"],
      })],
    },
    {
      id: "2.5", arcId: 2, number: 5, title: "The Mole",
      brief: "Boss: identify the insider.",
      missions: [M({
        id: "2.5", title: "JOIN + GROUP + filter",
        story: "// One name keeps surfacing across vault access AND offshore money. Find the employee with the most VAULT-1 'granted' entries.",
        objective: "Return name and access_count for the employee with the MOST 'granted' VAULT-1 logs.",
        hint: "JOIN, WHERE door=... AND result='granted', GROUP BY, ORDER BY count DESC LIMIT 1",
        setupSql: employees + accessLogs,
        expectedSql:
          "SELECT e.name, COUNT(*) AS access_count FROM access_logs l JOIN employees e ON e.emp_id=l.emp_id WHERE l.door='VAULT-1' AND l.result='granted' GROUP BY e.name ORDER BY access_count DESC LIMIT 1;",
        orderSensitive: true,
        xp: 200, concepts: ["JOIN", "GROUP BY", "ORDER BY"],
      })],
    },
  ],
};

const arc3: Arc = {
  id: 3,
  codename: "DEEP_SYSTEMS",
  title: "Arc 3 — Deep Systems",
  tagline: "Subqueries, set logic, and window functions.",
  episodes: [
    {
      id: "3.1", arcId: 3, number: 1, title: "Nested Shadows",
      brief: "Compare each transaction to the average.",
      missions: [M({
        id: "3.1", title: "Subquery in WHERE",
        story: "// Anything above the average amount stinks. Find every transaction above the mean.",
        objective: "Return tx_id and amount for transactions where amount > average amount.",
        hint: "WHERE amount > (SELECT AVG(amount) FROM transactions)",
        setupSql: transactions,
        expectedSql: "SELECT tx_id, amount FROM transactions WHERE amount > (SELECT AVG(amount) FROM transactions);",
        xp: 150, concepts: ["Subquery"],
      })],
    },
    {
      id: "3.2", arcId: 3, number: 2, title: "Mirror Tables",
      brief: "UNION two snapshots of activity.",
      missions: [M({
        id: "3.2", title: "UNION",
        story: "// We have two pulls of denied events. Combine emp_ids from each, no duplicates.",
        objective:
          "Return DISTINCT emp_id from (access_logs where result='denied') UNION (transactions where amount > 100000).",
        hint: "SELECT emp_id FROM ... UNION SELECT emp_id FROM ...",
        setupSql: accessLogs + transactions,
        expectedSql:
          "SELECT emp_id FROM access_logs WHERE result='denied' UNION SELECT emp_id FROM transactions WHERE amount > 100000;",
        xp: 160, concepts: ["UNION"],
      })],
    },
    {
      id: "3.3", arcId: 3, number: 3, title: "Ranking Threats",
      brief: "Rank employees by total moved.",
      missions: [M({
        id: "3.3", title: "Window: RANK",
        story: "// Build a threat board. Rank employees by total money moved, highest first.",
        objective: "Return emp_id, total, rank — using RANK() OVER (ORDER BY total DESC).",
        hint: "SELECT emp_id, SUM(amount) AS total, RANK() OVER (ORDER BY SUM(amount) DESC) AS rnk FROM transactions GROUP BY emp_id",
        setupSql: transactions,
        expectedSql:
          "SELECT emp_id, SUM(amount) AS total, RANK() OVER (ORDER BY SUM(amount) DESC) AS rnk FROM transactions GROUP BY emp_id;",
        xp: 180, concepts: ["Window functions"],
      })],
    },
    {
      id: "3.4", arcId: 3, number: 4, title: "Moving Targets",
      brief: "Partition by department.",
      missions: [M({
        id: "3.4", title: "PARTITION BY",
        story: "// Rank employees by level WITHIN their department.",
        objective:
          "Return name, department, level, rank — RANK() OVER (PARTITION BY department ORDER BY level DESC).",
        hint: "PARTITION BY department ORDER BY level DESC",
        setupSql: employees,
        expectedSql:
          "SELECT name, department, level, RANK() OVER (PARTITION BY department ORDER BY level DESC) AS rnk FROM employees;",
        xp: 190, concepts: ["PARTITION BY"],
      })],
    },
    {
      id: "3.5", arcId: 3, number: 5, title: "The Blacklist",
      brief: "Boss: top earners per department flagged with a compromised device.",
      missions: [M({
        id: "3.5", title: "Subquery + window combo",
        story: "// Cross-check: top-level person per department who also has a compromised device.",
        objective:
          "Return name, department, level for the highest-level employee in each department whose device is compromised.",
        hint: "Use a window or JOIN with devices WHERE compromised=1, then top per department.",
        setupSql: employees + devices,
        expectedSql:
          "SELECT name, department, level FROM (SELECT e.name, e.department, e.level, ROW_NUMBER() OVER (PARTITION BY e.department ORDER BY e.level DESC) AS rn FROM employees e JOIN devices d ON d.emp_id=e.emp_id WHERE d.compromised=1) WHERE rn = 1;",
        xp: 240, concepts: ["Subquery", "Window"],
      })],
    },
  ],
};

const arc4: Arc = {
  id: 4,
  codename: "ARCHITECT_OF_THE_GRID",
  title: "Arc 4 — Architect of the Grid",
  tagline: "Design schemas. Bend the structure of NEXACORP's data.",
  episodes: [
    {
      id: "4.1", arcId: 4, number: 1, title: "Blueprints",
      brief: "Create a clean rebel safehouse table.",
      missions: [M({
        id: "4.1", title: "CREATE TABLE",
        story: "// We need our own table of safehouses. Create it and insert one row.",
        objective:
          "Create table safehouses(id INTEGER PRIMARY KEY, codename TEXT NOT NULL, district TEXT). Then insert (1,'Hollow','Sector-9'). The final SELECT * FROM safehouses must return that row.",
        hint: "CREATE TABLE ...; INSERT INTO ...;",
        setupSql: "-- empty world",
        expectedSql:
          "CREATE TABLE safehouses(id INTEGER PRIMARY KEY, codename TEXT NOT NULL, district TEXT); INSERT INTO safehouses VALUES (1,'Hollow','Sector-9'); SELECT * FROM safehouses;",
        xp: 160, concepts: ["DDL", "CREATE TABLE"],
      })],
    },
    {
      id: "4.2", arcId: 4, number: 2, title: "Rules of the Grid",
      brief: "Enforce constraints.",
      missions: [M({
        id: "4.2", title: "ALTER TABLE",
        story: "// Add a UNIQUE rule on codename so no safehouse name is duplicated.",
        objective:
          "Start from the existing safehouses table. Create a UNIQUE INDEX on codename, then SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='safehouses'.",
        hint: "CREATE UNIQUE INDEX uniq_codename ON safehouses(codename);",
        setupSql:
          "CREATE TABLE safehouses(id INTEGER PRIMARY KEY, codename TEXT, district TEXT); INSERT INTO safehouses VALUES (1,'Hollow','Sector-9'),(2,'Ash','Sector-3');",
        expectedSql:
          "CREATE UNIQUE INDEX uniq_codename ON safehouses(codename); SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='safehouses';",
        xp: 170, concepts: ["INDEX", "UNIQUE"],
      })],
    },
    {
      id: "4.3", arcId: 4, number: 3, title: "Phantom Views",
      brief: "Hide sensitive columns behind a view.",
      missions: [M({
        id: "4.3", title: "CREATE VIEW",
        story: "// Junior operators must not see compromised flags. Build a sanitized view.",
        objective:
          "Create view safe_devices AS SELECT device_id, emp_id, device_type FROM devices. Then SELECT * FROM safe_devices.",
        hint: "CREATE VIEW ... AS SELECT ...",
        setupSql: devices,
        expectedSql:
          "CREATE VIEW safe_devices AS SELECT device_id, emp_id, device_type FROM devices; SELECT * FROM safe_devices;",
        xp: 180, concepts: ["VIEW"],
      })],
    },
    {
      id: "4.4", arcId: 4, number: 4, title: "Secret Paths",
      brief: "Break logic with a CTE.",
      missions: [M({
        id: "4.4", title: "WITH (CTE)",
        story: "// Use a WITH clause to find avg amount, then list transactions above it.",
        objective:
          "Use a CTE named avg_tx(avg_amount) returning AVG(amount). Then SELECT tx_id FROM transactions JOIN avg_tx WHERE amount > avg_amount.",
        hint: "WITH avg_tx AS (SELECT AVG(amount) AS avg_amount FROM transactions) SELECT ...",
        setupSql: transactions,
        expectedSql:
          "WITH avg_tx AS (SELECT AVG(amount) AS avg_amount FROM transactions) SELECT tx_id FROM transactions, avg_tx WHERE amount > avg_amount;",
        xp: 200, concepts: ["CTE"],
      })],
    },
    {
      id: "4.5", arcId: 4, number: 5, title: "Index Trap",
      brief: "Speed up the hunt.",
      missions: [M({
        id: "4.5", title: "CREATE INDEX",
        story: "// Queries on access_logs.door are crawling. Build an index, then list indexes.",
        objective:
          "CREATE INDEX idx_door ON access_logs(door). Then SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='access_logs'.",
        hint: "CREATE INDEX ... ON table(col);",
        setupSql: accessLogs,
        expectedSql:
          "CREATE INDEX idx_door ON access_logs(door); SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='access_logs';",
        xp: 200, concepts: ["INDEX"],
      })],
    },
  ],
};

const arc5: Arc = {
  id: 5,
  codename: "GHOSTLINE_PROTOCOL",
  title: "Arc 5 — Ghostline Protocol",
  tagline: "Transactions, triggers, and the final heist.",
  episodes: [
    {
      id: "5.1", arcId: 5, number: 1, title: "Transaction Heist",
      brief: "Move funds atomically.",
      missions: [M({
        id: "5.1", title: "BEGIN / COMMIT",
        story: "// Drain two accounts inside ONE transaction. All or nothing.",
        objective:
          "Inside BEGIN; ... COMMIT;, UPDATE accounts SET balance=balance-1000 WHERE id=1 and balance=balance+1000 WHERE id=2. Then SELECT id,balance FROM accounts ORDER BY id.",
        hint: "BEGIN; UPDATE ...; UPDATE ...; COMMIT;",
        setupSql:
          "CREATE TABLE accounts(id INTEGER PRIMARY KEY, balance INTEGER); INSERT INTO accounts VALUES (1,5000),(2,2000);",
        expectedSql:
          "BEGIN; UPDATE accounts SET balance = balance - 1000 WHERE id = 1; UPDATE accounts SET balance = balance + 1000 WHERE id = 2; COMMIT; SELECT id, balance FROM accounts ORDER BY id;",
        orderSensitive: true,
        xp: 220, concepts: ["Transactions"],
      })],
    },
    {
      id: "5.2", arcId: 5, number: 2, title: "Automated Revenge",
      brief: "Set a trigger that audits writes.",
      missions: [M({
        id: "5.2", title: "CREATE TRIGGER",
        story: "// Every UPDATE on accounts must log to audit_log. Wire it up, then trigger one update.",
        objective:
          "Create audit_log(id INTEGER PRIMARY KEY AUTOINCREMENT, account_id INTEGER, old_balance INTEGER, new_balance INTEGER). Create AFTER UPDATE trigger that inserts a row. Then UPDATE accounts SET balance=999 WHERE id=1. SELECT account_id, old_balance, new_balance FROM audit_log.",
        hint: "CREATE TRIGGER ... AFTER UPDATE ON accounts BEGIN INSERT INTO audit_log ... END;",
        setupSql:
          "CREATE TABLE accounts(id INTEGER PRIMARY KEY, balance INTEGER); INSERT INTO accounts VALUES (1,500);",
        expectedSql:
          "CREATE TABLE audit_log(id INTEGER PRIMARY KEY AUTOINCREMENT, account_id INTEGER, old_balance INTEGER, new_balance INTEGER); CREATE TRIGGER aud AFTER UPDATE ON accounts BEGIN INSERT INTO audit_log(account_id, old_balance, new_balance) VALUES (OLD.id, OLD.balance, NEW.balance); END; UPDATE accounts SET balance = 999 WHERE id = 1; SELECT account_id, old_balance, new_balance FROM audit_log;",
        xp: 250, concepts: ["TRIGGER"],
      })],
    },
    {
      id: "5.3", arcId: 5, number: 3, title: "Stored Weapons",
      brief: "Encapsulate logic with a view-as-function pattern.",
      missions: [M({
        id: "5.3", title: "Reusable VIEW logic",
        story: "// SQLite has no stored procs. Build a view 'threat_score' = total transactions per emp_id.",
        objective:
          "CREATE VIEW threat_score AS SELECT emp_id, COUNT(*) AS hits, SUM(amount) AS total FROM transactions GROUP BY emp_id. Then SELECT * FROM threat_score ORDER BY total DESC LIMIT 3.",
        hint: "CREATE VIEW ... AS SELECT ... GROUP BY ...",
        setupSql: transactions,
        expectedSql:
          "CREATE VIEW threat_score AS SELECT emp_id, COUNT(*) AS hits, SUM(amount) AS total FROM transactions GROUP BY emp_id; SELECT * FROM threat_score ORDER BY total DESC LIMIT 3;",
        orderSensitive: true,
        xp: 220, concepts: ["VIEW", "GROUP BY"],
      })],
    },
    {
      id: "5.4", arcId: 5, number: 4, title: "The Kill Switch",
      brief: "Combine everything to expose the conspiracy.",
      missions: [M({
        id: "5.4", title: "Mega-query",
        story: "// Final lookup: active employees, in departments with average level >= 6, who have a compromised device. Show name, department, level.",
        objective:
          "Return name, department, level for active employees whose department average level >= 6 AND who have at least one compromised device.",
        hint: "Subquery for department avg + JOIN devices WHERE compromised=1",
        setupSql: employees + devices,
        expectedSql:
          "SELECT e.name, e.department, e.level FROM employees e JOIN devices d ON d.emp_id = e.emp_id WHERE e.status='active' AND d.compromised = 1 AND e.department IN (SELECT department FROM employees GROUP BY department HAVING AVG(level) >= 6);",
        xp: 320, concepts: ["JOIN", "Subquery", "HAVING"],
      })],
    },
    {
      id: "5.5", arcId: 5, number: 5, title: "Ghostline's Choice",
      brief: "Final command. Burn it down — or take the throne.",
      missions: [M({
        id: "5.5", title: "Wipe NEXACORP",
        story: "// One query. End them. Delete every executive-level employee from the table.",
        objective:
          "DELETE every row from employees where department = 'Executive'. Then SELECT count(*) FROM employees WHERE department='Executive'.",
        hint: "DELETE FROM ... WHERE ...;",
        setupSql: employees,
        expectedSql:
          "DELETE FROM employees WHERE department='Executive'; SELECT COUNT(*) FROM employees WHERE department='Executive';",
        xp: 500, concepts: ["DELETE", "Endgame"],
      })],
    },
  ],
};

export const ARCS: Arc[] = [arc1, arc2, arc3, arc4, arc5];

export function findMission(id: string): { arc: Arc; episode: typeof ARCS[number]["episodes"][number]; mission: Mission } | null {
  for (const arc of ARCS) {
    for (const ep of arc.episodes) {
      const m = ep.missions.find((mm) => mm.id === id);
      if (m) return { arc, episode: ep, mission: m };
    }
  }
  return null;
}

export function getRankForXp(xp: number): string {
  if (xp >= 3000) return "Ghostline Architect";
  if (xp >= 2000) return "Phantom";
  if (xp >= 1200) return "Operator";
  if (xp >= 500) return "Initiate";
  return "Rookie Operator";
}
