import CircularProgress from '@mui/material/CircularProgress';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
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

interface Assignment {
  id: string;
  title: string;
  status: string;
  priority: string;
  progress: number;
  due_date: string | null;
  projects?: { name: string };
  assignee_id?: string;
}

interface Stats {
  total_assignments: number;
  completed_assignments: number;
  in_progress_assignments: number;
  pending_assignments: number;
  high_priority_assignments: number;
  completion_rate: number;
}

export default function DashboardHome() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [assignmentsData, statsData] = await Promise.all([
        apiService.getAssignments(),
        apiService.getAssignmentStats()
      ]);
      
      setAssignments(assignmentsData.slice(0, 5)); // Show only recent 5
      setStats(statsData);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getCompletionRate = () => {
    return stats?.completion_rate || 0;
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Button variant="outlined" onClick={loadDashboardData}>
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
          Good morning! 👋
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
                  {stats?.total_assignments || 0}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                  Total Assignments
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <ArrowUpward sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="caption">Updated in real-time</Typography>
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
                  {stats?.in_progress_assignments || 0}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                  In Progress
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <ArrowUpward sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="caption">Active work</Typography>
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
                  {stats?.completed_assignments || 0}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                  Completed
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <ArrowUpward sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="caption">{getCompletionRate().toFixed(1)}% complete</Typography>
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
                {assignments.map((assignment, index) => (
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
                          <React.Fragment>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                              <Chip 
                                label={assignment.status.replace('-', ' ')}
                                color={getStatusColor(assignment.status) as any}
                                size="small"
                                sx={{ textTransform: 'capitalize', fontSize: '0.75rem' }}
                              />
                              <Typography component="span" variant="caption" color="text.secondary">
                                Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}
                              </Typography>
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Typography component="span" variant="caption" color="text.secondary" sx={{ minWidth: 60 }}>
                                {assignment.projects?.name || 'No Project'}
                              </Typography>
                              <Typography component="span" variant="caption" color="text.secondary">
                                • {assignment.assignee_id || 'Unassigned'}
                              </Typography>
                            </span>
                          </React.Fragment>
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
                    {index < assignments.length - 1 && <Divider />}
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
                        {stats?.completed_assignments || 0}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats ? (stats.completed_assignments / stats.total_assignments) * 100 : 0}
                      color="success"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>In Progress</Typography>
                      <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                        {stats?.in_progress_assignments || 0}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats ? (stats.in_progress_assignments / stats.total_assignments) * 100 : 0}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>Pending</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {stats?.pending_assignments || 0}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats ? (stats.pending_assignments / stats.total_assignments) * 100 : 0}
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
                  {assignments.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No recent activity yet.
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Create your first assignment to get started!
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Check your assignments above for recent activity
                      </Typography>
                    </Box>
                  )}
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