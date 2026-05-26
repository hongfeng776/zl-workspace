import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';

interface DatabaseSchema {
  users: Array<{
    id: number;
    phone: string;
    password?: string;
    nickname?: string;
    avatar?: string;
    real_name?: string;
    id_card?: string;
    id_card_front?: string;
    id_card_back?: string;
    verified: number;
    status: number;
    created_at: string;
    updated_at: string;
  }>;
  verificationCodes: Array<{
    id: number;
    phone: string;
    code: string;
    type: string;
    expires_at: string;
    created_at: string;
  }>;
  trips: Array<{
    id: number;
    user_id: number;
    start_location: string;
    end_location: string;
    distance?: number;
    price?: number;
    status: string;
    created_at: string;
  }>;
  appeals: Array<{
    id: number;
    phone: string;
    real_name?: string;
    reason: string;
    materials?: string;
    status: string;
    created_at: string;
  }>;
}

const defaultData: DatabaseSchema = {
  users: [],
  verificationCodes: [],
  trips: [],
  appeals: []
};

let db: Low<DatabaseSchema>;
let nextIds = {
  user: 1,
  verificationCode: 1,
  trip: 1,
  appeal: 1
};

export async function initDatabase() {
  const dbPath = path.join(__dirname, '../db.json');
  const adapter = new JSONFile<DatabaseSchema>(dbPath);
  db = new Low<DatabaseSchema>(adapter, defaultData);
  
  await db.read();
  
  if (db.data.users.length > 0) {
    nextIds.user = Math.max(...db.data.users.map(u => u.id)) + 1;
  }
  if (db.data.verificationCodes.length > 0) {
    nextIds.verificationCode = Math.max(...db.data.verificationCodes.map(v => v.id)) + 1;
  }
  if (db.data.trips.length > 0) {
    nextIds.trip = Math.max(...db.data.trips.map(t => t.id)) + 1;
  }
  if (db.data.appeals.length > 0) {
    nextIds.appeal = Math.max(...db.data.appeals.map(a => a.id)) + 1;
  }

  console.log('数据库连接成功');
}

export async function run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
  await db.read();
  
  if (sql.startsWith('INSERT INTO users')) {
    const user = {
      id: nextIds.user++,
      phone: params[0],
      password: params[1] || undefined,
      nickname: params[2] || undefined,
      verified: 0,
      status: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.data.users.push(user);
    await db.write();
    return { lastID: user.id, changes: 1 };
  }
  
  if (sql.startsWith('INSERT INTO verification_codes')) {
    const code = {
      id: nextIds.verificationCode++,
      phone: params[0],
      code: params[1],
      type: params[2],
      expires_at: params[3],
      created_at: new Date().toISOString()
    };
    db.data.verificationCodes.push(code);
    await db.write();
    return { lastID: code.id, changes: 1 };
  }
  
  if (sql.startsWith('INSERT INTO trips')) {
    const trip = {
      id: nextIds.trip++,
      user_id: params[0],
      start_location: params[1],
      end_location: params[2],
      distance: params[3] || 0,
      price: params[4] || 0,
      status: params[5] || 'completed',
      created_at: new Date().toISOString()
    };
    db.data.trips.push(trip);
    await db.write();
    return { lastID: trip.id, changes: 1 };
  }
  
  if (sql.startsWith('INSERT INTO appeals')) {
    const appeal = {
      id: nextIds.appeal++,
      phone: params[0],
      real_name: params[1] || undefined,
      reason: params[2],
      materials: params[3] || undefined,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    db.data.appeals.push(appeal);
    await db.write();
    return { lastID: appeal.id, changes: 1 };
  }
  
  if (sql.startsWith('UPDATE users')) {
    const setClause = sql.match(/SET (.+?) WHERE/)[1];
    const whereClause = sql.match(/WHERE (.+)/)[1];
    
    const updates: any = {};
    if (setClause.includes('password')) {
      updates.password = params[0];
      updates.updated_at = new Date().toISOString();
    }
    if (setClause.includes('real_name')) {
      updates.real_name = params[0];
      updates.id_card = params[1];
      updates.id_card_front = params[2];
      updates.id_card_back = params[3];
      updates.verified = 1;
      updates.updated_at = new Date().toISOString();
    }
    
    const whereId = params[params.length - 1];
    const userIndex = db.data.users.findIndex(u => u.id === whereId);
    
    if (userIndex !== -1) {
      db.data.users[userIndex] = { ...db.data.users[userIndex], ...updates };
      await db.write();
      return { lastID: whereId, changes: 1 };
    }
    return { lastID: 0, changes: 0 };
  }
  
  return { lastID: 0, changes: 0 };
}

export async function get(sql: string, params: any[] = []): Promise<any> {
  await db.read();
  
  if (sql.includes('SELECT * FROM users WHERE phone = ?')) {
    return db.data.users.find(u => u.phone === params[0]) || null;
  }
  
  if (sql.includes('SELECT * FROM users WHERE id = ?')) {
    return db.data.users.find(u => u.id === params[0]) || null;
  }
  
  if (sql.includes('SELECT * FROM verification_codes WHERE phone = ? AND code = ? AND type = ?')) {
    return db.data.verificationCodes
      .filter(v => v.phone === params[0] && v.code === params[1] && v.type === params[2])
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] || null;
  }
  
  if (sql.includes('SELECT * FROM verification_codes WHERE phone = ? AND type = ?')) {
    return db.data.verificationCodes
      .filter(v => v.phone === params[0] && v.type === params[1])
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] || null;
  }
  
  if (sql.includes('SELECT id, phone, nickname, avatar, real_name, verified FROM users WHERE id = ?')) {
    const user = db.data.users.find(u => u.id === params[0]);
    if (user) {
      return {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        real_name: user.real_name,
        verified: user.verified
      };
    }
    return null;
  }
  
  if (sql.includes('SELECT real_name, id_card, id_card_front, id_card_back, verified FROM users WHERE id = ?')) {
    const user = db.data.users.find(u => u.id === params[0]);
    if (user) {
      return {
        verified: user.verified === 1,
        realName: user.real_name,
        idCard: user.id_card,
        idCardFront: user.id_card_front,
        idCardBack: user.id_card_back
      };
    }
    return null;
  }
  
  if (sql.includes('SELECT phone FROM users WHERE id = ?')) {
    const user = db.data.users.find(u => u.id === params[0]);
    return user ? { phone: user.phone } : null;
  }
  
  return null;
}

export async function all(sql: string, params: any[] = []): Promise<any[]> {
  await db.read();
  
  if (sql.includes('SELECT * FROM trips WHERE user_id = ?')) {
    return db.data.trips
      .filter(t => t.user_id === params[0])
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, params[1] || 50)
      .map(t => ({
        id: t.id,
        startLocation: t.start_location,
        endLocation: t.end_location,
        distance: t.distance,
        price: t.price,
        status: t.status,
        createdAt: t.created_at
      }));
  }
  
  if (sql.includes('SELECT * FROM appeals WHERE phone = ?')) {
    return db.data.appeals
      .filter(a => a.phone === params[0])
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map(a => ({
        id: a.id,
        reason: a.reason,
        status: a.status,
        createdAt: a.created_at
      }));
  }
  
  return [];
}
