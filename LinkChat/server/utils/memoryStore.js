const bcrypt = require('bcryptjs');

let users = [];
let verificationCodes = [];
let userIdCounter = 1;
let codeIdCounter = 1;

const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

const comparePassword = async (candidate, hash) => {
  return bcrypt.compare(candidate, hash);
};

const generateId = () => {
  return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const memoryStore = {
  users: {
    create: async (userData) => {
      const user = {
        _id: generateId(),
        ...userData,
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        securityVerified: userData.securityVerified || false,
        securityQuestions: userData.securityQuestions || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        comparePassword: async function(candidate) {
          if (!this.password) return false;
          return comparePassword(candidate, this.password);
        }
      };
      
      if (user.password && !user.password.startsWith('$2a$')) {
        user.password = await hashPassword(user.password);
      }
      
      if (!user.nickname) {
        user.nickname = user.phone ? `乐聊用户${user.phone.slice(-4)}` : '乐聊用户';
      }
      
      users.push(user);
      return user;
    },
    
    findOne: async (query) => {
      return users.find(u => {
        for (const key in query) {
          if (u[key] !== query[key]) return false;
        }
        return true;
      }) || null;
    },
    
    findById: async (id) => {
      return users.find(u => u._id === id) || null;
    },
    
    findByIdAndUpdate: async (id, update) => {
      const index = users.findIndex(u => u._id === id);
      if (index === -1) return null;
      users[index] = { ...users[index], ...update, updatedAt: new Date() };
      return users[index];
    }
  },
  
  verificationCodes: {
    create: async (codeData) => {
      const code = {
        _id: generateId(),
        ...codeData,
        used: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      verificationCodes.push(code);
      return code;
    },
    
    findOne: async (query) => {
      const now = new Date();
      return verificationCodes.find(c => {
        for (const key in query) {
          if (key === 'expiresAt') {
            if (c.expiresAt <= now) return false;
          } else if (c[key] !== query[key]) {
            return false;
          }
        }
        return true;
      }) || null;
    },
    
    deleteMany: async (query) => {
      verificationCodes = verificationCodes.filter(c => {
        for (const key in query) {
          if (c[key] !== query[key]) return true;
        }
        return false;
      });
      return { deletedCount: verificationCodes.length };
    }
  },
  
  save: async (doc) => {
    doc.updatedAt = new Date();
    return doc;
  },
  
  clear: () => {
    users = [];
    verificationCodes = [];
  },
  
  getUsers: () => users,
  getCodes: () => verificationCodes
};

module.exports = memoryStore;
