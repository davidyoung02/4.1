/**
 * @fileoverview 照片上传组件
 */

import React, { useState, useCallback } from 'react';
import { Upload, message, Spin } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import axios from 'axios';
import AnalysisResult from './AnalysisResult';
import 'antd/dist/antd.css'; // 导入antd样式
import './PhotoUpload.css'; // 导入自定义样式

/**
 * 配置常量
 */
const CONFIG = {
  API_URL: '/api/upload',
  UPLOAD_TIMEOUT: 30000,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  MAX_PREVIEW_SIZE: 2 * 1024 * 1024, // 2MB
};

/**
 * 错误消息映射
 */
const ERROR_MESSAGES = {
  FILE_TOO_LARGE: '文件大小不能超过5MB',
  INVALID_TYPE: '只支持JPG、PNG、GIF格式的图片',
  UPLOAD_FAILED: '上传失败，请重试',
  NETWORK_ERROR: '网络错误，请检查网络连接',
  SERVER_ERROR: '服务器错误，请稍后重试',
};

/**
 * 文件验证函数
 * @param {File} file - 要验证的文件
 * @returns {boolean} - 验证结果
 */
const validateFile = (file) => {
  if (file.size > CONFIG.MAX_FILE_SIZE) {
    message.error(ERROR_MESSAGES.FILE_TOO_LARGE);
    return false;
  }
  if (!CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
    message.error(ERROR_MESSAGES.INVALID_TYPE);
    return false;
  }
  return true;
};

/**
 * 创建预览URL
 * @param {File} file - 要预览的文件
 * @returns {Promise<string>} - 预览URL
 */
const createPreviewUrl = (file) => {
  return new Promise((resolve) => {
    if (file.size <= CONFIG.MAX_PREVIEW_SIZE) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    } else {
      resolve(null);
    }
  });
};

/**
 * 处理API错误
 * @param {Error} error - 错误对象
 * @returns {string} - 错误消息
 */
const handleApiError = (error) => {
  if (error.response) {
    return error.response.data?.message || ERROR_MESSAGES.SERVER_ERROR;
  }
  if (error.request) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  return ERROR_MESSAGES.UPLOAD_FAILED;
};

/**
 * 照片上传组件
 * @returns {JSX.Element} - 组件渲染结果
 */
const PhotoUpload = () => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  /**
   * 处理文件上传
   * @param {Object} options - 上传选项
   */
  const handleUpload = useCallback(async ({ file, onSuccess, onError }) => {
    try {
      if (!validateFile(file)) {
        return;
      }

      setUploading(true);
      const preview = await createPreviewUrl(file);
      setPreviewUrl(preview);

      const formData = new FormData();
      formData.append('photo', file);

      const response = await axios.post(CONFIG.API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: CONFIG.UPLOAD_TIMEOUT,
        withCredentials: true,
      });

      onSuccess(response.data);
      message.success('上传成功');
      setAnalysisResult(response.data.result);
    } catch (error) {
      const errorMessage = handleApiError(error);
      message.error(errorMessage);
      onError(error);
    } finally {
      setUploading(false);
    }
  }, []);

  return (
    <div className="photo-upload-container">
      <Upload.Dragger
        accept={CONFIG.ALLOWED_FILE_TYPES.join(',')}
        showUploadList={false}
        customRequest={handleUpload}
        disabled={uploading}
      >
        <Spin spinning={uploading}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            {uploading ? '上传中...' : '点击或拖拽图片到此区域上传'}
          </p>
          <p className="ant-upload-hint">
            支持JPG、PNG、GIF格式，大小不超过5MB
          </p>
        </Spin>
      </Upload.Dragger>
      {previewUrl && (
        <div className="preview-container">
          <img src={previewUrl} alt="预览" className="preview-image" />
        </div>
      )}

      {analysisResult && (
        <AnalysisResult result={analysisResult} />
      )}
    </div>
  );
};

export default PhotoUpload; 