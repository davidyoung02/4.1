/**
 * @fileoverview 照片上传组件
 */

import React, { useState } from 'react';
import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';
import AnalysisResult from './AnalysisResult';

// API路径配置
const API_URL = '/api';  // 使用相对路径，让Netlify代理处理

/**
 * PhotoUpload组件
 * @returns {JSX.Element} 渲染的照片上传组件
 */
const PhotoUpload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  /**
   * 处理文件选择
   * @param {Event} event - 文件选择事件
   */
  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // 检查文件类型
      if (!selectedFile.type.startsWith('image/')) {
        setError('请选择图片文件');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      setAnalysisResult(null); // 清除之前的结果
      
      // 创建预览URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.onerror = () => {
        setError('文件读取失败');
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  /**
   * 处理文件上传
   */
  const handleUpload = async () => {
    if (!file) {
      setError('请先选择照片');
      return;
    }

    // 检查文件大小
    const maxSize = parseInt(process.env.REACT_APP_MAX_FILE_SIZE || 20) * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`文件大小不能超过${process.env.REACT_APP_MAX_FILE_SIZE || 20}MB`);
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('photo', file);

    try {
      // 添加调试信息
      console.log('上传配置:', {
        url: `${API_URL}/upload`,
        fileSize: file.size,
        fileType: file.type
      });
      
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        },
        withCredentials: true  // 允许跨域请求携带凭证
      });

      console.log('服务器响应:', response);
      
      if (response.status === 200 && response.data.result) {
        setAnalysisResult(response.data.result);
      } else {
        throw new Error(response.data.error || '分析失败');
      }
    } catch (err) {
      console.error('上传错误:', err);
      let errorMessage = '上传失败，请稍后重试';
      
      if (err.response) {
        // 服务器返回的错误信息
        errorMessage = err.response.data.error || `上传失败 (${err.response.status})`;
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = '上传超时，请重试';
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = `无法连接到服务器，请检查网络连接`;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="photo-upload"
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="photo-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUploadIcon />}
              disabled={loading}
            >
              选择照片
            </Button>
          </label>
          
          {preview && (
            <Box sx={{ mt: 2 }}>
              <img
                src={preview}
                alt="预览"
                style={{ maxWidth: '300px', maxHeight: '300px', objectFit: 'contain' }}
              />
            </Box>
          )}

          {file && !analysisResult && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : '开始分析'}
            </Button>
          )}

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>
      </Paper>

      {analysisResult && (
        <AnalysisResult result={analysisResult} />
      )}
    </Box>
  );
};

export default PhotoUpload; 