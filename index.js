import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db.js';
import cors from 'cors';
import memoRoutes from './routers/memoRouter.js';
import authRoutes from './routers/userRouter.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import adminRoutes from './routers/adminRouter.js'

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure 'uploads' directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

dotenv.config();
connectDB();

const app = express();

// Configure CORS
app.use(cors({
  origin: 'https://promptly-dict-ncl9.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/memo', memoRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Hello, MongoDB Atlas!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});