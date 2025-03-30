# AI 面相算命

这是一个基于 React 和 Node.js 的 AI 面相算命应用。

## 功能特点

- 照片上传和预览
- 面相分析
- 现代化的用户界面

## 技术栈

- 前端：React, Material-UI, Axios
- 后端：Node.js, Express, Multer

## 开发环境设置

### 后端设置

1. 进入后端目录：
```bash
cd backend
```

2. 安装依赖：
```bash
npm install
```

3. 创建上传目录：
```bash
mkdir uploads
```

4. 启动后端服务器：
```bash
npm run dev
```

### 前端设置

1. 进入前端目录：
```bash
cd frontend
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm start
```

## 生产环境部署

1. 克隆项目：
```bash
git clone [项目地址]
cd ai-fortune-teller
```

2. 安装依赖并构建项目：
```bash
npm install
npm run build
```

3. 创建上传目录：
```bash
mkdir -p backend/uploads
```

4. 启动生产服务器：
```bash
npm start
```

## 使用说明

1. 打开浏览器访问 `http://localhost:3000`
2. 点击"选择照片"按钮上传照片
3. 预览照片后点击"开始分析"
4. 等待分析结果

## 开发说明

- 后端服务器运行在 `http://localhost:3001`
- 前端开发服务器运行在 `http://localhost:3000`
- 上传的照片将保存在 `backend/uploads` 目录中

## 注意事项

- 请确保上传的照片清晰可见
- 建议使用正面照片以获得更准确的分析结果
- 上传文件大小限制为 5MB
- 生产环境部署前请确保配置正确的环境变量
- 建议使用 PM2 等进程管理工具来管理生产环境的 Node.js 应用 