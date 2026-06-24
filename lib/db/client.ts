import fs from 'fs';
import path from 'path';

export interface Lead {
  id?: number;
  name: string;
  email?: string;
  phone: string;
  loan_type: string;
  loan_amount: number;
  monthly_income: number;
  employment_type: string;
  eligibility_status: 'Qualified' | 'Needs Review' | 'Disqualified';
  eligibility_reason: string;
  source: 'Web Chat' | 'Voice Call' | 'WhatsApp';
  call_sid?: string;
  transcript?: string;
  recording_url?: string;
  hubspot_synced: number; // 0 or 1
  sheets_synced: number;   // 0 or 1
  make_synced: number;     // 0 or 1
  pabbly_synced: number;   // 0 or 1
  pickyassist_synced: number; // 0 or 1
  employment_history?: string;
  created_at?: string;
}

const JSON_DB_PATH = path.join(process.cwd(), 'db.json');

// Memory DB fallback in case SQLite fails
let jsonDbMemory: Lead[] = [];

function loadJsonDb() {
  try {
    if (fs.existsSync(JSON_DB_PATH)) {
      const data = fs.readFileSync(JSON_DB_PATH, 'utf-8');
      jsonDbMemory = JSON.parse(data);
    } else {
      jsonDbMemory = [];
      fs.writeFileSync(JSON_DB_PATH, JSON.stringify([]), 'utf-8');
    }
  } catch (err) {
    console.error("Failed to load JSON database, using in-memory only", err);
    jsonDbMemory = [];
  }
}

function saveJsonDb() {
  try {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(jsonDbMemory, null, 2), 'utf-8');
  } catch (err) {
    console.error("Failed to save JSON database", err);
  }
}

// Check database mode. We can use SQLite as default.
let dbInstance: any = null;
let dbMode: 'sqlite' | 'json' = 'json';

export async function getDb() {
  if (dbInstance) return { db: dbInstance, mode: dbMode };

  try {
    // Dynamically require sqlite and sqlite3 to avoid compilation crash on windows import checks
    const sqlite = require('sqlite');
    const sqlite3 = require('sqlite3');

    const dbPath = path.join(process.cwd(), 'database.db');
    dbInstance = await sqlite.open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Create table if not exists
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT NOT NULL,
        loan_type TEXT NOT NULL,
        loan_amount REAL NOT NULL,
        monthly_income REAL NOT NULL,
        employment_type TEXT NOT NULL,
        eligibility_status TEXT NOT NULL,
        eligibility_reason TEXT,
        source TEXT NOT NULL,
        call_sid TEXT,
        transcript TEXT,
        recording_url TEXT,
        hubspot_synced INTEGER DEFAULT 0,
        sheets_synced INTEGER DEFAULT 0,
        make_synced INTEGER DEFAULT 0,
        pabbly_synced INTEGER DEFAULT 0,
        pickyassist_synced INTEGER DEFAULT 0,
        employment_history TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    dbMode = 'sqlite';
    console.log("Database initialized in SQLite mode.");
  } catch (error) {
    console.warn("Could not load SQLite, falling back to JSON database file.", error);
    loadJsonDb();
    dbMode = 'json';
    dbInstance = {
      // Mock SQLite operations using jsonDbMemory
      all: async (sql: string, params?: any[]) => {
        return [...jsonDbMemory].reverse(); // return latest leads first
      },
      run: async (sql: string, params: any[]) => {
        if (sql.includes('INSERT INTO leads')) {
          const lead: Lead = {
            id: jsonDbMemory.length + 1,
            name: params[0],
            email: params[1],
            phone: params[2],
            loan_type: params[3],
            loan_amount: params[4],
            monthly_income: params[5],
            employment_type: params[6],
            eligibility_status: params[7],
            eligibility_reason: params[8],
            source: params[9],
            call_sid: params[10],
            transcript: params[11],
            recording_url: params[12],
            hubspot_synced: params[13] || 0,
            sheets_synced: params[14] || 0,
            make_synced: params[15] || 0,
            pabbly_synced: params[16] || 0,
            pickyassist_synced: params[17] || 0,
            employment_history: params[18] || null,
            created_at: new Date().toISOString()
          };
          jsonDbMemory.push(lead);
          saveJsonDb();
          return { lastID: lead.id };
        }
        return { lastID: 0 };
      },
      exec: async (sql: string) => {
        return;
      }
    };
  }

  if (dbInstance) {
    try {
      const { seedDatabase } = require('./seed');
      seedDatabase().catch((err: any) => console.error("Database seeding failed", err));
    } catch (e) {
      console.warn("Could not load seed function", e);
    }
  }

  return { db: dbInstance, mode: dbMode };
}

export async function saveLead(lead: Lead): Promise<number> {
  const { db, mode } = await getDb();
  if (mode === 'sqlite') {
    const result = await db.run(
      `INSERT INTO leads (
        name, email, phone, loan_type, loan_amount, monthly_income, 
        employment_type, eligibility_status, eligibility_reason, source, 
        call_sid, transcript, recording_url, hubspot_synced, sheets_synced, 
        make_synced, pabbly_synced, pickyassist_synced, employment_history
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        lead.name,
        lead.email || null,
        lead.phone,
        lead.loan_type,
        lead.loan_amount,
        lead.monthly_income,
        lead.employment_type,
        lead.eligibility_status,
        lead.eligibility_reason,
        lead.source,
        lead.call_sid || null,
        lead.transcript || null,
        lead.recording_url || null,
        lead.hubspot_synced,
        lead.sheets_synced,
        lead.make_synced,
        lead.pabbly_synced,
        lead.pickyassist_synced,
        lead.employment_history || null
      ]
    );
    return result.lastID;
  } else {
    const result = await db.run('INSERT INTO leads', [
      lead.name,
      lead.email || null,
      lead.phone,
      lead.loan_type,
      lead.loan_amount,
      lead.monthly_income,
      lead.employment_type,
      lead.eligibility_status,
      lead.eligibility_reason,
      lead.source,
      lead.call_sid || null,
      lead.transcript || null,
      lead.recording_url || null,
      lead.hubspot_synced,
      lead.sheets_synced,
      lead.make_synced,
      lead.pabbly_synced,
      lead.pickyassist_synced,
      lead.employment_history || null
    ]);
    return result.lastID;
  }
}

export async function getAllLeads(): Promise<Lead[]> {
  const { db, mode } = await getDb();
  if (mode === 'sqlite') {
    return await db.all("SELECT * FROM leads ORDER BY id DESC");
  } else {
    return await db.all("");
  }
}

export async function updateLeadSyncStatus(
  id: number,
  syncType: 'hubspot' | 'sheets' | 'make' | 'pabbly' | 'pickyassist',
  status: 0 | 1
) {
  const { db, mode } = await getDb();
  const fieldMap = {
    hubspot: 'hubspot_synced',
    sheets: 'sheets_synced',
    make: 'make_synced',
    pabbly: 'pabbly_synced',
    pickyassist: 'pickyassist_synced'
  };

  const field = fieldMap[syncType];

  if (mode === 'sqlite') {
    await db.run(`UPDATE leads SET ${field} = ? WHERE id = ?`, [status, id]);
  } else {
    const lead = jsonDbMemory.find(l => l.id === id);
    if (lead) {
      (lead as any)[field] = status;
      saveJsonDb();
    }
  }
}
