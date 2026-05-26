const mongoose = require('mongoose');
const memoryStore = require('./memoryStore');

const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

const dbAdapter = {
  User: {
    create: async (data) => {
      if (isMongoConnected()) {
        const User = require('../models/User');
        return new User(data).save();
      }
      return memoryStore.users.create(data);
    },
    
    findOne: async (query) => {
      if (isMongoConnected()) {
        const User = require('../models/User');
        return User.findOne(query);
      }
      return memoryStore.users.findOne(query);
    },
    
    findById: async (id) => {
      if (isMongoConnected()) {
        const User = require('../models/User');
        return User.findById(id);
      }
      return memoryStore.users.findById(id);
    },
    
    findByIdAndUpdate: async (id, update) => {
      if (isMongoConnected()) {
        const User = require('../models/User');
        return User.findByIdAndUpdate(id, update, { new: true });
      }
      return memoryStore.users.findByIdAndUpdate(id, update);
    }
  },
  
  VerificationCode: {
    create: async (data) => {
      if (isMongoConnected()) {
        const VerificationCode = require('../models/VerificationCode');
        return new VerificationCode(data).save();
      }
      return memoryStore.verificationCodes.create(data);
    },
    
    findOne: async (query) => {
      if (isMongoConnected()) {
        const VerificationCode = require('../models/VerificationCode');
        return VerificationCode.findOne(query);
      }
      return memoryStore.verificationCodes.findOne(query);
    },
    
    deleteMany: async (query) => {
      if (isMongoConnected()) {
        const VerificationCode = require('../models/VerificationCode');
        return VerificationCode.deleteMany(query);
      }
      return memoryStore.verificationCodes.deleteMany(query);
    }
  },
  
  save: async (doc) => {
    if (isMongoConnected() && doc.save) {
      return doc.save();
    }
    return memoryStore.save(doc);
  },
  
  isUsingMemory: () => !isMongoConnected()
};

module.exports = dbAdapter;
