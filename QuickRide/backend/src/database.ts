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
    driver_id?: number;
    car_type?: string;
    start_location: string;
    end_location: string;
    distance?: number;
    duration?: number;
    price?: number;
    status: string;
    created_at: string;
    completed_at?: string;
    rating?: number;
    review?: string;
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
  drivers: Array<{
    id: number;
    name: string;
    phone: string;
    avatar?: string;
    car_type: string;
    car_number: string;
    car_model: string;
    rating: number;
    rating_count: number;
    order_count: number;
  }>;
  reviews: Array<{
    id: number;
    trip_id: number;
    driver_id: number;
    user_id: number;
    rating: number;
    content?: string;
    created_at: string;
  }>;
}

const defaultData: DatabaseSchema = {
  users: [],
  verificationCodes: [],
  trips: [],
  appeals: [],
  drivers: [],
  reviews: []
};

let db: Low<DatabaseSchema>;
let nextIds = {
  user: 1,
  verificationCode: 1,
  trip: 1,
  appeal: 1,
  driver: 1,
  review: 1
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
  if (db.data.drivers.length > 0) {
    nextIds.driver = Math.max(...db.data.drivers.map(d => d.id)) + 1;
  }
  if (db.data.reviews.length > 0) {
    nextIds.review = Math.max(...db.data.reviews.map(r => r.id)) + 1;
  }

  if (db.data.drivers.length === 0) {
    db.data.drivers = [
      { id: nextIds.driver++, name: '张师傅', phone: '13800010001', avatar: '', car_type: 'express', car_number: '京A12345', car_model: '大众朗逸', rating: 4.9, rating_count: 256, order_count: 1256 },
      { id: nextIds.driver++, name: '李师傅', phone: '13800010002', avatar: '', car_type: 'premium', car_number: '京B23456', car_model: '丰田凯美瑞', rating: 4.8, rating_count: 189, order_count: 986 },
      { id: nextIds.driver++, name: '王师傅', phone: '13800010003', avatar: '', car_type: 'taxi', car_number: '京C34567', car_model: '现代索纳塔', rating: 4.7, rating_count: 342, order_count: 2341 },
      { id: nextIds.driver++, name: '刘师傅', phone: '13800010004', avatar: '', car_type: 'express', car_number: '京D45678', car_model: '丰田卡罗拉', rating: 4.85, rating_count: 198, order_count: 876 },
      { id: nextIds.driver++, name: '陈师傅', phone: '13800010005', avatar: '', car_type: 'luxury', car_number: '京E56789', car_model: '奔驰E级', rating: 4.95, rating_count: 120, order_count: 456 }
    ];
    await db.write();
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
      driver_id: params[1] || null,
      car_type: params[2] || 'express',
      start_location: params[3],
      end_location: params[4],
      distance: params[5] || 0,
      duration: params[6] || 0,
      price: params[7] || 0,
      status: params[8] || 'completed',
      created_at: new Date().toISOString(),
      completed_at: params[9] || null,
      rating: params[10] || null,
      review: params[11] || null
    };
    db.data.trips.push(trip);
    await db.write();
    return { lastID: trip.id, changes: 1 };
  }

  if (sql.startsWith('INSERT INTO reviews')) {
    const review = {
      id: nextIds.review++,
      trip_id: params[0],
      driver_id: params[1],
      user_id: params[2],
      rating: params[3],
      content: params[4] || null,
      created_at: new Date().toISOString()
    };
    db.data.reviews.push(review);
    await db.write();
    return { lastID: review.id, changes: 1 };
  }

  if (sql.startsWith('UPDATE trips SET')) {
    const tripId = params[params.length - 1];
    const tripIndex = db.data.trips.findIndex(t => t.id === tripId);
    if (tripIndex !== -1) {
      if (sql.includes('rating = ?') && sql.includes('review = ?')) {
        db.data.trips[tripIndex].rating = params[0];
        db.data.trips[tripIndex].review = params[1];
        await db.write();
        return { lastID: tripId, changes: 1 };
      }
    }
    return { lastID: 0, changes: 0 };
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
      .map(t => {
        const driver = db.data.drivers.find(d => d.id === t.driver_id);
        return {
          id: t.id,
          startLocation: t.start_location,
          endLocation: t.end_location,
          distance: t.distance,
          duration: t.duration,
          price: t.price,
          status: t.status,
          carType: t.car_type,
          createdAt: t.created_at,
          completedAt: t.completed_at,
          rating: t.rating,
          review: t.review,
          driver: driver ? {
            id: driver.id,
            name: driver.name,
            phone: driver.phone,
            carModel: driver.car_model,
            carNumber: driver.car_number,
            rating: driver.rating,
            orderCount: driver.order_count
          } : null
        };
      });
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

  if (sql.includes('SELECT * FROM drivers')) {
    return db.data.drivers.map(d => ({
      id: d.id,
      name: d.name,
      phone: d.phone,
      carType: d.car_type,
      carNumber: d.car_number,
      carModel: d.car_model,
      rating: d.rating,
      ratingCount: d.rating_count,
      orderCount: d.order_count
    }));
  }

  if (sql.includes('SELECT * FROM reviews WHERE driver_id = ?')) {
    return db.data.reviews
      .filter(r => r.driver_id === params[0])
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, params[1] || 20)
      .map(r => {
        const user = db.data.users.find(u => u.id === r.user_id);
        return {
          id: r.id,
          tripId: r.trip_id,
          rating: r.rating,
          content: r.content,
          createdAt: r.created_at,
          userName: user?.nickname || '匿名用户'
        };
      });
  }
  
  return [];
}
