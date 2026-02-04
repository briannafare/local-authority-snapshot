import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, audits, auditVisuals, InsertAudit, InsertAuditVisual } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Audit queries
export async function createAudit(audit: InsertAudit) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(audits).values(audit);
  return result[0].insertId;
}

export async function getAuditById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const auditResult = await db.select().from(audits).where(eq(audits.id, id)).limit(1);
  if (auditResult.length === 0) return undefined;
  
  const audit = auditResult[0];
  
  // Fetch associated visuals
  const visualsResult = await db.select().from(auditVisuals).where(eq(auditVisuals.auditId, id));
  
  return {
    ...audit,
    visuals: visualsResult,
  };
}

export async function updateAudit(id: number, data: Partial<InsertAudit>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(audits).set(data).where(eq(audits.id, id));
}

export async function getAllAudits() {
  const db = await getDb();
  if (!db) return [];

  const { desc } = await import("drizzle-orm");
  return await db.select().from(audits).orderBy(desc(audits.createdAt));
}

// Audit visuals queries
export async function createAuditVisual(visual: InsertAuditVisual) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(auditVisuals).values(visual);
  return result[0].insertId;
}

export async function getAuditVisuals(auditId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(auditVisuals).where(eq(auditVisuals.auditId, auditId));
}
