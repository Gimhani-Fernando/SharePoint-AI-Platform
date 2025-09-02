import * as React from 'react';
import { useState } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  Stack,
  IconButton,
  Button,
  Divider,
} from '@mui/material';
import {
  Assignment,
  TrendingUp,
  PlayArrow,
  CheckCircle,
  Analytics,
  CloudUpload,
  Settings,
  ArrowUpward,
  MoreVert,
} from '@mui/icons-material';

// Mock data
const MOCK_STATS = {
  total_assignments: 24,
  completed_assignments: 12,
  in_progress_assignments: 8,
  pending_assignments: 4,
  total_documents: 156,
  active_projects: 3,
};

const MOCK_ASSIGNMENTS = [
  {
    id: '1',
    title: 'Update API Documentation',
    status: 'in-progress',
    priority: 'high',
    progress: 75,
    due_date: '2024-12-30',
    project: { name: 'SharePoint Integration' },
    assignee: 'John Doe'
  },
  {
    id: '2',
    title: 'Security Audit Review',
    status: 'todo',
    priority: 'high',
    progress: 0,
    due_date: '2024-12-28',
    project: { name: 'Security Enhancement' },
    assignee: 'Sarah Wilson'
  },
  {
    id: '3',
    title: 'User Interface Improvements',
    status: 'in-progress',
    priority: 'medium',
    progress: 45,
    due_date: '2025-01-05',
    project: { name: 'UI/UX Overhaul' },
    assignee: 'Mike Johnson'
  },
  {
    id: '4',
    title: 'Database Optimization',
    status: 'completed',
    priority: 'medium',
    progress: 100,
    due_date: '2024-12-20',
    project: { name: 'Performance Boost' },
    assignee: 'Lisa Chen'
  },
  {
    id: '5',
    title: 'Mobile App Testing',
    status: 'in-progress',
    priority: 'low',
    progress: 30,
    due_date: '2025-01-10',
    project: { name: 'Mobile Development' },
    assignee: 'David Brown'
  }
];

const MOCK_RECENT_ACTIVITY = [
  { action: 'Assignment completed', item: 'Database Optimization', time: '2 hours ago', user: 'Lisa Chen' },
  { action: 'Document uploaded', item: 'API Security Guidelines.pdf', time: '4 hours ago', user: 'John Doe' },
  { action: 'Assignment created', item: 'Mobile App Testing', time: '1 day ago', user: 'Sarah Wilson' },
  { action: 'Project updated', item: 'SharePoint Integration', time: '2 days ago', user: 'Mike Johnson' },
];

export default function DashboardHome() {

  const getCompletionRate = () => {
    return Math.round((MOCK_STATS.completed_assignments / MOCK_STATS.total_assignments) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'todo': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
          Good morning, Team! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
          Here's what's happening with your SharePoint AI projects today.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
        gap: 3, 
        mb: 4 
      }}>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          height: '140px',
          display: 'flex',
          alignItems: 'center',
          '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
        }}>
          <CardContent sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {MOCK_STATS.total_assignments}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                  Total Assignments
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <ArrowUpward sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="caption">+12% from last month</Typography>
                </Box>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 60, height: 60 }}>
                <Assignment sx={{ fontSize: 30 }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          height: '140px',
          display: 'flex',
          alignItems: 'center',
          '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
        }}>
          <CardContent sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {MOCK_STATS.in_progress_assignments}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                  In Progress
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <ArrowUpward sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="caption">+8% this week</Typography>
                </Box>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 60, height: 60 }}>
                <PlayArrow sx={{ fontSize: 30 }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ 
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          height: '140px',
          display: 'flex',
          alignItems: 'center',
          '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
        }}>
          <CardContent sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {MOCK_STATS.completed_assignments}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                  Completed
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <ArrowUpward sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="caption">+15% this month</Typography>
                </Box>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 60, height: 60 }}>
                <CheckCircle sx={{ fontSize: 30 }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Main Content Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, 
        gap: 3,
        minHeight: '600px' // Set minimum height for the grid
      }}>
        {/* Progress Overview */}
        <Box>
          <Card sx={{ 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            height: { xs: 'auto', lg: '100%' }
          }}>
            <CardContent sx={{ 
              p: 3,
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUp color="primary" sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Recent Assignments
                  </Typography>
                </Box>
                <Button variant="outlined" size="small">View All</Button>
              </Box>
              
              <List sx={{ 
                '& .MuiListItem-root': { px: 0, py: 2 },
                flexGrow: 1,
                overflow: 'auto'
              }}>
                {MOCK_ASSIGNMENTS.map((assignment, index) => (
                  <React.Fragment key={assignment.id}>
                    <ListItem>
                      <ListItemIcon>
                        <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
                          <Assignment />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600, flex: 1 }}>
                              {assignment.title}
                            </Typography>
                            <Chip 
                              label={assignment.priority}
                              color={getPriorityColor(assignment.priority) as any}
                              size="small"
                              sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Chip 
                                label={assignment.status.replace('-', ' ')}
                                color={getStatusColor(assignment.status) as any}
                                size="small"
                                sx={{ textTransform: 'capitalize', fontSize: '0.75rem' }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                Due: {new Date(assignment.due_date).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60 }}>
                                {assignment.project.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                • {assignment.assignee}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                      <Box sx={{ minWidth: 120, textAlign: 'right' }}>
                        <Typography variant="body2" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
                          {assignment.progress}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={assignment.progress} 
                          sx={{ width: 80, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </ListItem>
                    {index < MOCK_ASSIGNMENTS.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Right Sidebar */}
        <Box sx={{ height: '100%' }}>
          <Stack spacing={3} sx={{ height: '100%' }}>
            {/* Completion Progress */}
            <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Overall Progress
                </Typography>
                
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Box
                    sx={{
                      position: 'relative',
                      width: 140,
                      height: 140,
                      borderRadius: '50%',
                      background: `conic-gradient(#1976d2 ${getCompletionRate() * 3.6}deg, #e3f2fd 0deg)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    <Box
                      sx={{
                        width: 110,
                        height: 110,
                        borderRadius: '50%',
                        backgroundColor: 'background.paper',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                        {getCompletionRate()}%
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Tasks completed this month
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>Completed</Typography>
                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                        {MOCK_STATS.completed_assignments}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(MOCK_STATS.completed_assignments / MOCK_STATS.total_assignments) * 100}
                      color="success"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>In Progress</Typography>
                      <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                        {MOCK_STATS.in_progress_assignments}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(MOCK_STATS.in_progress_assignments / MOCK_STATS.total_assignments) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>Pending</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {MOCK_STATS.pending_assignments}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(MOCK_STATS.pending_assignments / MOCK_STATS.total_assignments) * 100}
                      color="inherit"
                      sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { bgcolor: '#e0e0e0' } }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card sx={{ 
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardContent sx={{ 
                p: 3,
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Recent Activity
                  </Typography>
                  <IconButton size="small">
                    <MoreVert />
                  </IconButton>
                </Box>
                
                <List sx={{ 
                  '& .MuiListItem-root': { px: 0, py: 1.5 },
                  flexGrow: 1,
                  overflow: 'auto'
                }}>
                  {MOCK_RECENT_ACTIVITY.map((activity, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemIcon>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                            {activity.user.split(' ').map(n => n[0]).join('')}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {activity.action}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                                {activity.item}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {activity.time} • {activity.user}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < MOCK_RECENT_ACTIVITY.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        {/* Quick Actions */}
        <Box sx={{ gridColumn: { xs: '1', lg: '1 / -1' } }}>
          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.95rem' }}>
                Quick Actions
              </Typography>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' },
                gap: 1
              }}>
                <Button
                  variant="outlined"
                  startIcon={<Assignment />}
                  size="small"
                  sx={{ 
                    py: 1,
                    px: 1.5,
                    minHeight: 'auto',
                    fontSize: '0.8rem',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { 
                      borderColor: 'primary.main',
                      bgcolor: 'primary.50'
                    }
                  }}
                >
                  New Task
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  size="small"
                  sx={{ 
                    py: 1,
                    px: 1.5,
                    minHeight: 'auto',
                    fontSize: '0.8rem',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { 
                      borderColor: 'primary.main',
                      bgcolor: 'primary.50'
                    }
                  }}
                >
                  Upload
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Analytics />}
                  size="small"
                  sx={{ 
                    py: 1,
                    px: 1.5,
                    minHeight: 'auto',
                    fontSize: '0.8rem',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { 
                      borderColor: 'primary.main',
                      bgcolor: 'primary.50'
                    }
                  }}
                >
                  Analytics
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Settings />}
                  size="small"
                  sx={{ 
                    py: 1,
                    px: 1.5,
                    minHeight: 'auto',
                    fontSize: '0.8rem',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { 
                      borderColor: 'primary.main',
                      bgcolor: 'primary.50'
                    }
                  }}
                >
                  Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}