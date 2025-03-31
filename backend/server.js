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
  origin: ['http://localhost:3000', 'https://aifacetest11.netlify.app'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
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

// 文件大小限制：10MB
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    // 只允许上传图片
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('只允许上传图片文件！'));
    }
    cb(null, true);
  }
}).single('photo');

// 生产环境下服务静态文件
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
}

// API路由
app.get('/api', (req, res) => {
  res.json({ message: 'AI Fortune Teller API is running' });
});

// 文件上传路由
app.post('/api/upload', (req, res) => {
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: '文件大小不能超过10MB' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: '没有上传文件' });
      }

      // 愚人节整蛊分析结果
      const analysisResults = [
        {
          overall: "面相奇特，额头有光，疑似外星人转世",
          career: "事业运势：建议去月球开分公司，那里竞争小",
          love: "桃花运：你的真命天子/天女可能是一只猫",
          wealth: "财运：明天可能会在路上捡到一张彩票，记得刮开看看",
          health: "健康提醒：建议每天倒立3小时，据说可以长高"
        },
        {
          overall: "面相显示你前世可能是一只企鹅",
          career: "事业运势：建议去南极开企鹅主题餐厅",
          love: "桃花运：你的另一半可能正在南极游泳",
          wealth: "财运：投资企鹅保险，稳赚不赔",
          health: "健康提醒：建议每天游泳3小时，保持企鹅本色"
        },
        {
          overall: "面相显示你可能是穿越者",
          career: "事业运势：建议去古代开连锁店",
          love: "桃花运：你的真命天子/天女可能还在古代",
          wealth: "财运：投资古董，稳赚不赔",
          health: "健康提醒：建议每天骑马3小时，保持古代本色"
        },
        {
          overall: "面相显示你可能是机器人",
          career: "事业运势：建议去硅谷应聘AI研究员",
          love: "桃花运：你的另一半可能是一个智能音箱",
          wealth: "财运：投资比特币，稳赚不赔",
          health: "健康提醒：建议每天充电3小时，保持电量充足"
        },
        {
          overall: "面相显示你可能是超级英雄",
          career: "事业运势：建议去漫威应聘",
          love: "桃花运：你的另一半可能是一个超级反派",
          wealth: "财运：投资超级英雄保险，稳赚不赔",
          health: "健康提醒：建议每天飞3小时，保持超能力"
        }
      ];

      // 随机选择一个分析结果
      const randomResult = analysisResults[Math.floor(Math.random() * analysisResults.length)];

      res.json({ 
        message: '文件上传成功',
        filename: req.file.filename,
        result: randomResult
      });
    } catch (error) {
      console.error('处理文件时出错:', error);
      res.status(500).json({ error: '文件处理失败' });
    }
  });
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