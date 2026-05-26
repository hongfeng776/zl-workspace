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
  
  Post: {
    create: async (data) => {
      if (isMongoConnected()) {
        const Post = require('../models/Post');
        return new Post(data).save();
      }
      return memoryStore.posts.create(data);
    },
    
    insertMany: async (data) => {
      if (isMongoConnected()) {
        const Post = require('../models/Post');
        return Post.insertMany(data);
      }
      return memoryStore.posts.insertMany(data);
    },
    
    countDocuments: async (query) => {
      if (isMongoConnected()) {
        const Post = require('../models/Post');
        return Post.countDocuments(query);
      }
      return memoryStore.posts.countDocuments(query);
    },
    
    find: async (query) => {
      if (isMongoConnected()) {
        const Post = require('../models/Post');
        return Post.find(query);
      }
      return memoryStore.posts.find(query);
    },
    
    findById: async (id) => {
      if (isMongoConnected()) {
        const Post = require('../models/Post');
        return Post.findById(id);
      }
      return memoryStore.posts.findById(id);
    },
    
    findByIdAndUpdate: async (id, update) => {
      if (isMongoConnected()) {
        const Post = require('../models/Post');
        return Post.findByIdAndUpdate(id, update, { new: true });
      }
      return memoryStore.posts.findByIdAndUpdate(id, update);
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
