/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import roomRoutes from './routes/rooms.js'
import songRoutes from './routes/songs.js'
import battleRoutes from './routes/battles.js'
import audioRoutes from './routes/audio.js'
import { createServer } from 'http'
import { Server } from 'socket.io'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()
const server = createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

const onlineUsers = new Map<string, string>()

io.on('connection', (socket) => {
  console.log('用户连接:', socket.id)

  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    onlineUsers.set(socket.id, userId)
    io.to(roomId).emit('user-joined', { userId, socketId: socket.id })
  })

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId)
    io.to(roomId).emit('user-left', { socketId: socket.id })
  })

  socket.on('send-invite', ({ roomId, invitedUserId, inviterName }) => {
    const invitedSocketId = Array.from(onlineUsers.entries()).find(
      ([, userId]) => userId === invitedUserId
    )?.[0]
    
    if (invitedSocketId) {
      io.to(invitedSocketId).emit('receive-invite', {
        roomId,
        inviterName,
        message: `${inviterName} 邀请你加入歌房对战！`
      })
    }
  })

  socket.on('ready-status', ({ roomId, userId, isReady }) => {
    io.to(roomId).emit('player-ready', { userId, isReady })
  })

  socket.on('battle-start', ({ roomId, songId }) => {
    io.to(roomId).emit('start-singing', { songId, startTime: Date.now() })
  })

  socket.on('singing-data', ({ roomId, userId, audioData, pitch }) => {
    socket.to(roomId).emit('partner-singing', { userId, pitch })
  })

  socket.on('battle-finish', ({ roomId, battleId }) => {
    io.to(roomId).emit('show-result', { battleId })
  })

  socket.on('disconnect', () => {
    const userId = onlineUsers.get(socket.id)
    onlineUsers.delete(socket.id)
    console.log('用户断开连接:', socket.id)
  })
})

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/rooms', roomRoutes)
app.use('/api/songs', songRoutes)
app.use('/api/battles', battleRoutes)
app.use('/api/audio', audioRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export { app, server }
