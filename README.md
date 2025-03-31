# AI 面相算命

一个有趣的 AI 面相算命应用，专为愚人节设计。上传照片后，会收到一个搞笑的面相分析结果。

## 功能特点

- 照片上传和预览
- AI "分析" 面相（愚人节特别版）
- 随机生成有趣的分析结果
- 响应式设计，支持移动端

## 技术栈

### 前端
- React
- Material-UI (MUI)
- Axios

### 后端
- Node.js
- Express
- Multer（文件上传）
- CORS

## 本地开发

1. 克隆仓库
```bash
git clone https://github.com/你的用户名/ai-fortune-teller.git
cd ai-fortune-teller
```

2. 安装依赖
```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

3. 启动开发服务器
```bash
# 启动后端服务器（在 backend 目录下）
npm run dev

# 启动前端开发服务器（在 frontend 目录下）
npm start
```

4. 打开浏览器访问 http://localhost:3000

## 环境变量配置

### 前端 (.env)
```
REACT_APP_API_URL=http://localhost:3001
REACT_APP_TITLE=AI面相算命
```

### 后端 (.env)
```
PORT=3001
NODE_ENV=development
```

## 部署

- 前端部署在 Netlify
- 后端部署在你选择的服务器上

## 注意事项

- 上传图片大小限制为 20MB
- 仅支持图片格式文件
- 这是一个娱乐性质的应用，分析结果纯属虚构

## 许可证

MIT 