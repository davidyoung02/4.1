/**
 * @fileoverview 照片上传组件
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';
import AnalysisResult from './AnalysisResult';

/**
 * 常量配置
 * @constant {Object} CONFIG - 组件配置
 */
const CONFIG = {
  API_URL: process.env.NODE_ENV === 'production' 
    ? 'https://aifacetest11.netlify.app/api'
    : '/api',
  UPLOAD_TIMEOUT: 30000,
  MAX_FILE_SIZE: parseInt(process.env.REACT_APP_MAX_FILE_SIZE || 20) * 1024 * 1024,
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  DEBUG: process.env.NODE_ENV === 'development'
};

/**
 * 错误消息映射
 * @constant {Object} ERROR_MESSAGES - 错误消息配置
 */
const ERROR_MESSAGES = {
  NO_FILE: '请先选择照片',
  INVALID_TYPE: '请选择图片文件',
  FILE_TOO_LARGE: `文件大小不能超过${process.env.REACT_APP_MAX_FILE_SIZE || 20}MB`,
  READ_ERROR: '文件读取失败',
  UPLOAD_FAILED: '上传失败，请稍后重试',
  API_NOT_FOUND: '上传接口不存在，请检查API配置',
  NO_PERMISSION: '没有权限访问该接口',
  TIMEOUT: '上传超时，请重试',
  NETWORK_ERROR: '无法连接到服务器，请检查网络连接',
  CORS_ERROR: '跨域请求被阻止，请检查CORS配置'
};

// 配置axios
axios.defaults.withCredentials = true;
axios.defaults.timeout = CONFIG.UPLOAD_TIMEOUT;

// 添加请求拦截器
axios.interceptors.request.use(
  config => {
    if (CONFIG.DEBUG) {
      console.log('发送请求:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        data: config.data
      });
    }
    return config;
  },
  error => {
    if (CONFIG.DEBUG) {
      console.error('请求错误:', error);
    }
    return Promise.reject(error);
  }
);

// 添加响应拦截器
axios.interceptors.response.use(
  response => {
    if (CONFIG.DEBUG) {
      console.log('收到响应:', {
        status: response.status,
        headers: response.headers,
        data: response.data
      });
    }
    return response;
  },
  error => {
    if (CONFIG.DEBUG) {
      console.error('响应错误:', {
        message: error.message,
        code: error.code,
        response: error.response,
        config: error.config
      });
    }
    return Promise.reject(error);
  }
);

/**
 * 创建文件预览URL
 * @param {File} file - 文件对象
 * @returns {Promise<string>} 预览URL
 */
const createPreviewUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(ERROR_MESSAGES.READ_ERROR));
    reader.readAsDataURL(file);
  });
};

/**
 * 验证文件
 * @param {File} file - 文件对象
 * @returns {string|null} 错误消息或null
 */
const validateFile = (file) => {
  if (!file) return ERROR_MESSAGES.NO_FILE;
  if (!CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) return ERROR_MESSAGES.INVALID_TYPE;
  if (file.size > CONFIG.MAX_FILE_SIZE) return ERROR_MESSAGES.FILE_TOO_LARGE;
  return null;
};

/**
 * 处理API错误
 * @param {Error} error - 错误对象
 * @returns {string} 错误消息
 */
const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    if (status === 404) return ERROR_MESSAGES.API_NOT_FOUND;
    if (status === 403) return ERROR_MESSAGES.NO_PERMISSION;
    return data?.error || `上传失败 (${status})`;
  }
  
  if (error.code === 'ECONNABORTED') return ERROR_MESSAGES.TIMEOUT;
  if (error.code === 'ERR_NETWORK') return ERROR_MESSAGES.NETWORK_ERROR;
  if (error.message.includes('CORS')) return ERROR_MESSAGES.CORS_ERROR;
  
  return error.message || ERROR_MESSAGES.UPLOAD_FAILED;
};

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

  // 组件挂载时检查API可用性
  useEffect(() => {
    const checkApiAvailability = async () => {
      try {
        const response = await axios.options(`${CONFIG.API_URL}/upload`);
        if (CONFIG.DEBUG) {
          console.log('API可用性检查:', response);
        }
      } catch (err) {
        if (CONFIG.DEBUG) {
          console.error('API可用性检查失败:', err);
        }
      }
    };

    checkApiAvailability();
  }, []);

  /**
   * 处理文件选择
   * @param {Event} event - 文件选择事件
   */
  const handleFileSelect = useCallback(async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setFile(selectedFile);
      setError(null);
      setAnalysisResult(null);
      const previewUrl = await createPreviewUrl(selectedFile);
      setPreview(previewUrl);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  /**
   * 处理文件上传
   */
  const handleUpload = useCallback(async () => {
    if (!file) {
      setError(ERROR_MESSAGES.NO_FILE);
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await axios({
        method: 'post',
        url: `${CONFIG.API_URL}/upload`,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        validateStatus: (status) => status >= 200 && status < 500,
        maxContentLength: CONFIG.MAX_FILE_SIZE,
        maxBodyLength: CONFIG.MAX_FILE_SIZE
      });

      if (response.status === 200 && response.data.result) {
        setAnalysisResult(response.data.result);
      } else {
        throw new Error(response.data.error || '分析失败');
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [file]);

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