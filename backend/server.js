/**
 * @fileoverview AI Fortune Teller Backend Server
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const helmet = require('helmet');
const fs = require('fs');
const net = require('net');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

/**
 * 检查端口是否可用
 * @param {number} port - 要检查的端口号
 * @returns {Promise<boolean>} 端口是否可用
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => {
      resolve(false);
    });
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

/**
 * 查找可用端口
 * @param {number} startPort - 起始端口号
 * @returns {Promise<number>} 可用的端口号
 */
async function findAvailablePort(startPort) {
  let port = startPort;
  while (!(await isPortAvailable(port))) {
    port++;
  }
  return port;
}

// 允许的域名列表
const allowedOrigins = [
  'http://localhost:3000',
  'https://aifacetest11.netlify.app',
  'https://67ea87b0bacef7000851fdfa--aifae.netlify.app',
  'https://aifae.netlify.app',
  /^https:\/\/[a-zA-Z0-9-]+--aifae\.netlify\.app$/ // 匹配所有Netlify预览域名
];

// 检查域名是否允许
function isOriginAllowed(origin) {
  if (!origin) return true;
  return allowedOrigins.some(allowed => {
    if (allowed instanceof RegExp) {
      return allowed.test(origin);
    }
    return allowed === origin;
  });
}

// CORS中间件
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // 记录CORS请求信息
  console.log('CORS请求:', {
    origin,
    method: req.method,
    path: req.path,
    headers: req.headers
  });

  if (isOriginAllowed(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24小时
    res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
    res.header('Vary', 'Origin');
  }

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// 安全中间件配置
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 请求体解析中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 创建上传目录
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 文件上传配置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
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

// 健康检查路由
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API路由
app.get('/api', (req, res) => {
  res.json({ message: 'AI Fortune Teller API is running' });
});

// 文件上传路由
app.post('/api/upload', (req, res) => {
  // 记录请求信息
  console.log('收到上传请求:', {
    origin: req.headers.origin,
    method: req.method,
    contentType: req.headers['content-type'],
    body: req.body
  });

  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: '文件大小不能超过20MB' });
      }
      console.error('Multer错误:', err);
      return res.status(400).json({ error: err.message });
    } else if (err) {
      console.error('上传错误:', err);
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

      // 删除上传的文件（可选）
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('删除文件失败:', err);
      });

      res.json({ 
        message: '文件上传成功',
        filename: req.file.filename,
        result: randomResult
      });
    } catch (error) {
      console.error('处理文件时出错:', error);
      // 确保删除上传的文件
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('删除文件失败:', err);
        });
      }
      res.status(500).json({ error: '文件处理失败' });
    }
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('错误:', err.stack);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? '服务器内部错误' 
      : err.message 
  });
});

// 生产环境下处理所有其他路由
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，准备关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

// 启动服务器
(async () => {
  try {
    const availablePort = await findAvailablePort(port);
    if (availablePort !== port) {
      console.log(`端口 ${port} 已被占用，使用端口 ${availablePort}`);
    }
    
    const server = app.listen(availablePort, () => {
      console.log(`服务器运行在端口 ${availablePort}`);
    });

    // 错误处理
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`端口 ${availablePort} 已被占用`);
        process.exit(1);
      } else {
        console.error('服务器错误:', error);
      }
    });
  } catch (error) {
    console.error('启动服务器时出错:', error);
    process.exit(1);
  }
})(); 