/**
 * @fileoverview 照片上传组件
 */

import React, { useState } from 'react';
import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';
import AnalysisResult from './AnalysisResult';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

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
      setFile(selectedFile);
      setError(null);
      setAnalysisResult(null); // 清除之前的结果
      // 创建预览URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
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
    if (file.size > 20 * 1024 * 1024) {
      setError('文件大小不能超过20MB');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30秒超时
      });
      
      if (response.data.result) {
        setAnalysisResult(response.data.result);
      } else {
        setError('分析结果获取失败');
      }
    } catch (err) {
      console.error('上传错误:', err);
      if (err.response) {
        // 服务器返回的错误信息
        setError(err.response.data.error || '上传失败，请重试');
      } else if (err.code === 'ECONNABORTED') {
        setError('上传超时，请重试');
      } else {
        setError('网络错误，请检查网络连接');
      }
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