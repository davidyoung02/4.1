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
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://aifacetest11.netlify.app'
    ];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('不允许的来源'));
    }
  },
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

// 文件大小限制：从环境变量获取，默认20MB
const maxFileSize = (parseInt(process.env.UPLOAD_LIMIT) || 20) * 1024 * 1024;

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: maxFileSize
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
        return res.status(400).json({ error: '文件大小不能超过20MB' });
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
          overall: "面相显示你是隐藏的动漫主角",
          career: "建议去漫画公司应聘，可能会被选为下一部动漫主角",
          love: "桃花运旺盛，但要小心是不是在演动漫剧情",
          wealth: "财运：动漫周边代言费将会让你发财",
          health: "建议多看动漫补充能量"
        },
        {
          overall: "面相显示你前世是一只网红猫",
          career: "建议开个猫咖，老本行了",
          love: "桃花运：你的真命天子/天女就在猫咖等你",
          wealth: "财运：投资猫咪周边，稳赚不赔",
          health: "建议每天学猫咪晒太阳"
        },
        {
          overall: "面相显示你是外星人派来的卧底",
          career: "建议去NASA应聘，他们正在找你",
          love: "桃花运：你的另一半可能在太空站",
          wealth: "财运：外星科技专利费即将到账",
          health: "建议多补充外星能量"
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