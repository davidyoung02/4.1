/**
 * @fileoverview 面相分析结果展示组件
 */

import React from 'react';
import { Paper, Typography, Box, List, ListItem, ListItemText, Divider } from '@mui/material';

/**
 * AnalysisResult组件
 * @param {Object} props - 组件属性
 * @param {Object} props.result - 分析结果数据
 * @returns {JSX.Element} 渲染的分析结果组件
 */
const AnalysisResult = ({ result }) => {
  if (!result) return null;

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        面相分析结果
      </Typography>
      <Divider sx={{ my: 2 }} />
      <List>
        <ListItem>
          <ListItemText
            primary="整体面相"
            secondary={result.overall || "面相奇特，额头有光，疑似外星人转世"}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="事业运势"
            secondary={result.career || "建议去月球开分公司，那里竞争小"}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="感情运势"
            secondary={result.love || "你的真命天子/天女可能是一只猫"}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="财运分析"
            secondary={result.wealth || "明天可能会在路上捡到一张彩票，记得刮开看看"}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="健康提醒"
            secondary={result.health || "建议每天倒立3小时，据说可以长高"}
          />
        </ListItem>
      </List>
      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          温馨提示：本分析结果纯属娱乐，如有雷同纯属巧合。愚人节快乐！🎉
        </Typography>
      </Box>
    </Paper>
  );
};

export default AnalysisResult; 