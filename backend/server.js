/**
 * @fileoverview AI Fortune Teller Backend Server
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// 安全中间件
app.use(helmet());

// CORS配置
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://你的域名.com'
    : 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  maxAge: 86400 // 24小时
};

app.use(cors(corsOptions));
app.use(express.json());

// 文件上传配置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // 添加时间戳和随机数防止文件名冲突
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 文件大小限制：5MB
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    // 只允许上传图片
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('只允许上传图片文件！'));
    }
    cb(null, true);
  }
});

// 生产环境下服务静态文件
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
}

// API路由
app.get('/api', (req, res) => {
  res.json({ message: 'AI Fortune Teller API is running' });
});

// 文件上传路由
app.post('/api/upload', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有上传文件' });
    }

    // 愚人节整蛊分析结果
    const analysisResult = {
      overall: "面相奇特，额头有光，疑似外星人转世",
      career: "事业运势：建议去月球开分公司，那里竞争小",
      love: "桃花运：你的真命天子/天女可能是一只猫",
      wealth: "财运：明天可能会在路上捡到一张彩票，记得刮开看看",
      health: "健康提醒：建议每天倒立3小时，据说可以长高"
    };

    res.json({ 
      message: '文件上传成功',
      filename: req.file.filename,
      result: analysisResult
    });
  } catch (error) {
    res.status(500).json({ error: '文件上传失败' });
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

// 生产环境下处理所有其他路由
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在端口 ${port}`);
}); 