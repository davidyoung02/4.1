const multipart = require('lambda-multipart-parser');

/**
 * 处理文件上传的Netlify函数
 */
exports.handler = async (event, context) => {
  // 设置CORS头
  const headers = {
    'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
      ? 'https://aifacetest11.netlify.app'
      : 'http://localhost:3000',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // 处理预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: '只支持POST请求' })
    };
  }

  try {
    // 解析multipart表单数据
    const { files } = await multipart.parse(event);
    
    if (!files || files.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '没有上传文件' })
      };
    }

    const file = files[0];

    // 验证文件类型
    if (!file.contentType.startsWith('image/')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '只允许上传图片文件' })
      };
    }

    // 验证文件大小（20MB）
    const maxSize = 20 * 1024 * 1024;
    if (file.content.length > maxSize) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '文件大小不能超过20MB' })
      };
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: '文件上传成功',
        filename: file.filename,
        result: randomResult
      })
    };
  } catch (error) {
    console.error('处理文件时出错:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: '服务器内部错误' })
    };
  }
}; 