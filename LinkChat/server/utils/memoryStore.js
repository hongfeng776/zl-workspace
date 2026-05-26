const bcrypt = require('bcryptjs');

let users = [];
let verificationCodes = [];
let posts = [];
let userIdCounter = 1;
let codeIdCounter = 1;
let postIdCounter = 1;

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
          const queryValue = query[key];
          if (queryValue && typeof queryValue === 'object' && !(queryValue instanceof Date)) {
            if (queryValue.$gt !== undefined) {
              const compareValue = queryValue.$gt instanceof Date ? queryValue.$gt.getTime() : queryValue.$gt;
              const fieldValue = u[key] instanceof Date ? u[key].getTime() : u[key];
              if (fieldValue <= compareValue) return false;
            } else if (queryValue.$lt !== undefined) {
              const compareValue = queryValue.$lt instanceof Date ? queryValue.$lt.getTime() : queryValue.$lt;
              const fieldValue = u[key] instanceof Date ? u[key].getTime() : u[key];
              if (fieldValue >= compareValue) return false;
            } else if (queryValue.$gte !== undefined) {
              const compareValue = queryValue.$gte instanceof Date ? queryValue.$gte.getTime() : queryValue.$gte;
              const fieldValue = u[key] instanceof Date ? u[key].getTime() : u[key];
              if (fieldValue < compareValue) return false;
            } else if (queryValue.$lte !== undefined) {
              const compareValue = queryValue.$lte instanceof Date ? queryValue.$lte.getTime() : queryValue.$lte;
              const fieldValue = u[key] instanceof Date ? u[key].getTime() : u[key];
              if (fieldValue > compareValue) return false;
            } else {
              return false;
            }
          } else if (u[key] !== queryValue) {
            if (u[key] instanceof Date && queryValue instanceof Date) {
              if (u[key].getTime() !== queryValue.getTime()) return false;
            } else {
              return false;
            }
          }
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
          const queryValue = query[key];
          if (queryValue && typeof queryValue === 'object' && !(queryValue instanceof Date)) {
            if (queryValue.$gt !== undefined) {
              const compareValue = queryValue.$gt instanceof Date ? queryValue.$gt.getTime() : queryValue.$gt;
              const fieldValue = c[key] instanceof Date ? c[key].getTime() : c[key];
              if (fieldValue <= compareValue) return false;
            } else if (queryValue.$lt !== undefined) {
              const compareValue = queryValue.$lt instanceof Date ? queryValue.$lt.getTime() : queryValue.$lt;
              const fieldValue = c[key] instanceof Date ? c[key].getTime() : c[key];
              if (fieldValue >= compareValue) return false;
            } else if (queryValue.$gte !== undefined) {
              const compareValue = queryValue.$gte instanceof Date ? queryValue.$gte.getTime() : queryValue.$gte;
              const fieldValue = c[key] instanceof Date ? c[key].getTime() : c[key];
              if (fieldValue < compareValue) return false;
            } else if (queryValue.$lte !== undefined) {
              const compareValue = queryValue.$lte instanceof Date ? queryValue.$lte.getTime() : queryValue.$lte;
              const fieldValue = c[key] instanceof Date ? c[key].getTime() : c[key];
              if (fieldValue > compareValue) return false;
            } else {
              return false;
            }
          } else if (key === 'expiresAt' && !queryValue) {
            if (c.expiresAt <= now) return false;
          } else if (c[key] !== queryValue) {
            if (c[key] instanceof Date && queryValue instanceof Date) {
              if (c[key].getTime() !== queryValue.getTime()) return false;
            } else {
              return false;
            }
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
  
  posts: {
    create: async (postData) => {
      const post = {
        _id: generateId(),
        ...postData,
        likes: postData.likes || 0,
        comments: postData.comments || 0,
        views: postData.views || 0,
        shares: postData.shares || 0,
        isActive: postData.isActive !== undefined ? postData.isActive : true,
        tags: postData.tags || [],
        createdAt: postData.createdAt || new Date(),
        updatedAt: new Date()
      };
      posts.push(post);
      return post;
    },
    
    insertMany: async (postsData) => {
      const createdPosts = postsData.map(postData => ({
        _id: generateId(),
        ...postData,
        likes: postData.likes || 0,
        comments: postData.comments || 0,
        views: postData.views || 0,
        shares: postData.shares || 0,
        isActive: postData.isActive !== undefined ? postData.isActive : true,
        tags: postData.tags || [],
        createdAt: postData.createdAt || new Date(),
        updatedAt: new Date()
      }));
      posts = [...posts, ...createdPosts];
      return createdPosts;
    },
    
    countDocuments: async (query = {}) => {
      return posts.filter(p => {
        for (const key in query) {
          if (key === '$or') {
            const orMatch = query.$or.some(orCondition => {
              for (const orKey in orCondition) {
                const val = p[orKey];
                const cond = orCondition[orKey];
                if (cond && typeof cond === 'object' && cond.$regex) {
                  const regex = new RegExp(cond.$regex, cond.$options || '');
                  if (Array.isArray(val)) {
                    return val.some(v => regex.test(v));
                  }
                  return regex.test(val);
                }
                if (val !== cond) return false;
              }
              return true;
            });
            if (!orMatch) return false;
          } else {
            if (p[key] !== query[key]) return false;
          }
        }
        return true;
      }).length;
    },
    
    find: async (query = {}) => {
      let filtered = posts.filter(p => {
        for (const key in query) {
          if (key === '$or') {
            const orMatch = query.$or.some(orCondition => {
              for (const orKey in orCondition) {
                const val = p[orKey];
                const cond = orCondition[orKey];
                if (cond && typeof cond === 'object' && cond.$regex) {
                  const regex = new RegExp(cond.$regex, cond.$options || '');
                  if (Array.isArray(val)) {
                    return val.some(v => regex.test(v));
                  }
                  return regex.test(val);
                }
                if (val !== cond) return false;
              }
              return true;
            });
            if (!orMatch) return false;
          } else if (key === '$and') {
            const andMatch = query.$and.every(andCondition => {
              for (const andKey in andCondition) {
                if (p[andKey] !== andCondition[andKey]) return false;
              }
              return true;
            });
            if (!andMatch) return false;
          } else {
            if (p[key] !== query[key]) return false;
          }
        }
        return true;
      });
      
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      return {
        sort: () => ({
          skip: (skip) => ({
            limit: (limit) => ({
              select: () => filtered.slice(skip, skip + limit)
            })
          })
        }),
        skip: (skip) => ({
          limit: (limit) => ({
            select: () => filtered.slice(skip, skip + limit)
          })
        })
      };
    },
    
    findById: async (id) => {
      return posts.find(p => p._id === id) || null;
    },
    
    findByIdAndUpdate: async (id, update) => {
      const index = posts.findIndex(p => p._id === id);
      if (index === -1) return null;
      posts[index] = { ...posts[index], ...update, updatedAt: new Date() };
      return posts[index];
    }
  },
  
  save: async (doc) => {
    doc.updatedAt = new Date();
    return doc;
  },
  
  clear: () => {
    users = [];
    verificationCodes = [];
    posts = [];
  },
  
  getUsers: () => users,
  getCodes: () => verificationCodes,
  getPosts: () => posts
};

module.exports = memoryStore;
