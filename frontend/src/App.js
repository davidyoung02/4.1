/**
 * @fileoverview AI Fortune Teller App主组件
 */

import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import PhotoUpload from './components/PhotoUpload';
import './App.css';

/**
 * App组件
 * @returns {JSX.Element} 渲染的App组件
 */
function App() {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          AI 面相算命
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
          上传您的照片，让AI为您解读面相
        </Typography>
        <PhotoUpload />
      </Box>
    </Container>
  );
}

export default App; 