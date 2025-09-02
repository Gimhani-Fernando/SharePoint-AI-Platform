import * as React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  LinearProgress,
  IconButton,
  Stack,
  Alert,
  Fab,
  Avatar,
} from '@mui/material';
import {
  Add,
  Edit,
  PlayArrow,
  CheckCircle,
  Schedule,
  PriorityHigh,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  progress: number;
  assignee_id: string | null;
  project_id: string | null;
  created_at: string;
  projects?: { name: string };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface FormData {
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  progress: number;
  assignee_id: string;
}

const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'Project Manager',
    avatar: 'JD'
  },
  {
    id: 'user-2', 
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    role: 'Developer',
    avatar: 'JS'
  },
  {
    id: 'user-3',
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com', 
    role: 'Designer',
    avatar: 'MJ'
  },
  {
    id: 'user-4',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@company.com',
    role: 'QA Engineer',
    avatar: 'SW'
  }
];

const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: '1',
    title: 'Complete SharePoint API Integration',
    description: 'Integrate Microsoft Graph API with our SharePoint document management system to enable seamless file operations.',
    status: 'in-progress',
    priority: 'high',
    due_date: '2024-12-30',
    progress: 75,
    assignee_id: 'user-1',
    project_id: 'proj-1',
    created_at: '2024-12-15T10:00:00Z',
    projects: { name: 'SharePoint Integration' }
  },
  {
    id: '2',
    title: 'Implement Document Search with AI',
    description: 'Build intelligent document search using vector embeddings and semantic search capabilities.',
    status: 'todo',
    priority: 'high',
    due_date: '2025-01-15',
    progress: 0,
    assignee_id: 'user-1',
    project_id: 'proj-2',
    created_at: '2024-12-20T14:30:00Z',
    projects: { name: 'AI Enhancement' }
  },
  {
    id: '3',
    title: 'User Authentication & Role Management',
    description: 'Set up Azure AD integration for secure user authentication and implement role-based access control.',
    status: 'completed',
    priority: 'medium',
    due_date: '2024-12-25',
    progress: 100,
    assignee_id: 'user-1',
    project_id: 'proj-1',
    created_at: '2024-12-10T09:15:00Z',
    projects: { name: 'SharePoint Integration' }
  },
  {
    id: '4',
    title: 'Database Schema Optimization',
    description: 'Optimize Supabase database schema for better performance and add proper indexing for vector search.',
    status: 'in-progress',
    priority: 'medium',
    due_date: '2024-12-28',
    progress: 45,
    assignee_id: 'user-1',
    project_id: 'proj-3',
    created_at: '2024-12-18T11:20:00Z',
    projects: { name: 'Backend Optimization' }
  },
  {
    id: '5',
    title: 'Frontend UI/UX Improvements',
    description: 'Enhance the user interface with better responsive design and implement Material-UI best practices.',
    status: 'completed',
    priority: 'low',
    due_date: '2024-12-22',
    progress: 100,
    assignee_id: 'user-1',
    project_id: 'proj-4',
    created_at: '2024-12-12T16:45:00Z',
    projects: { name: 'UI Enhancement' }
  },
  {
    id: '6',
    title: 'API Documentation & Testing',
    description: 'Create comprehensive API documentation and implement automated testing suite for all endpoints.',
    status: 'todo',
    priority: 'low',
    due_date: '2025-01-05',
    progress: 0,
    assignee_id: 'user-1',
    project_id: 'proj-3',
    created_at: '2024-12-21T13:10:00Z',
    projects: { name: 'Backend Optimization' }
  },
  {
    id: '7',
    title: 'Real-time Collaboration Features',
    description: 'Implement real-time document collaboration using Supabase real-time subscriptions.',
    status: 'in-progress',
    priority: 'high',
    due_date: '2025-01-10',
    progress: 30,
    assignee_id: 'user-1',
    project_id: 'proj-2',
    created_at: '2024-12-19T08:30:00Z',
    projects: { name: 'AI Enhancement' }
  },
  {
    id: '8',
    title: 'Mobile Responsiveness',
    description: 'Ensure the application works seamlessly on mobile devices and tablets with proper responsive design.',
    status: 'todo',
    priority: 'medium',
    due_date: '2025-01-20',
    progress: 0,
    assignee_id: 'user-1',
    project_id: 'proj-4',
    created_at: '2024-12-22T12:00:00Z',
    projects: { name: 'UI Enhancement' }
  }
];

export default function AssignmentManager() {
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [open, setOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
    progress: 0,
    assignee_id: ''
  });

  const getUserById = (userId: string | null): User | undefined => {
    return MOCK_USERS.find(user => user.id === userId);
  };

  useEffect(() => {
    fetchAssignments();
    
    // Real-time subscription for assignments
    const subscription = supabase
      .channel('assignment-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'assignments' 
        }, 
        (payload) => {
          console.log('Assignment updated:', payload);
          fetchAssignments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      // For demo purposes, use mock data
      // In production, uncomment the Supabase call below
      /*
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          projects (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
      */
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAssignments(MOCK_ASSIGNMENTS);
      setError(null);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.title.trim()) {
        setError('Title is required');
        return;
      }

      if (editingAssignment) {
        // Update existing assignment in mock data
        const updatedAssignments = assignments.map(assignment => 
          assignment.id === editingAssignment.id 
            ? {
                ...assignment,
                title: formData.title,
                description: formData.description,
                status: formData.status,
                priority: formData.priority,
                due_date: formData.due_date || null,
                progress: formData.progress
              }
            : assignment
        );
        setAssignments(updatedAssignments);
      } else {
        // Create new assignment in mock data
        const newAssignment: Assignment = {
          id: (assignments.length + 1).toString(),
          title: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          due_date: formData.due_date || null,
          progress: formData.progress,
          assignee_id: formData.assignee_id || 'user-1',
          project_id: 'demo-project-id',
          created_at: new Date().toISOString(),
          projects: { name: 'Demo Project' }
        };
        setAssignments([newAssignment, ...assignments]);
      }
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving assignment:', err);
      setError('Failed to save assignment');
    }
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingAssignment(null);
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      due_date: '',
      progress: 0,
      assignee_id: ''
    });
    setError(null);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description || '',
      status: assignment.status,
      priority: assignment.priority,
      due_date: assignment.due_date || '',
      progress: assignment.progress,
      assignee_id: assignment.assignee_id || ''
    });
    setOpen(true);
  };

  const updateAssignmentStatus = async (id: string, newStatus: Assignment['status'], newProgress?: number) => {
    try {
      // Update assignment in mock data
      const updatedAssignments = assignments.map(assignment => 
        assignment.id === id 
          ? {
              ...assignment,
              status: newStatus,
              progress: newProgress !== undefined ? newProgress : assignment.progress
            }
          : assignment
      );
      setAssignments(updatedAssignments);
    } catch (err) {
      console.error('Error updating assignment:', err);
      setError('Failed to update assignment');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'todo': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'in-progress': return <PlayArrow />;
      default: return <Schedule />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <LinearProgress sx={{ width: 200 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
            Assignment Manager
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track your assignments with real-time updates
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
        gap: 3, 
        mb: 4 
      }}>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                  {assignments.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Assignments
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                <AssignmentIcon />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
        
        <Card sx={{ 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                  {assignments.filter(a => a.status === 'in-progress').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  In Progress
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                <PlayArrow />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
        
        <Card sx={{ 
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                  {assignments.filter(a => a.status === 'completed').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Completed
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                <CheckCircle />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
        
        <Card sx={{ 
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          color: 'white'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                  {assignments.filter(a => a.priority === 'high').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  High Priority
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                <PriorityHigh />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Assignments Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
        gap: 3 
      }}>
        {assignments.map((assignment) => (
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Chip 
                    label={assignment.priority} 
                    color={getPriorityColor(assignment.priority) as any}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                  <Chip 
                    icon={getStatusIcon(assignment.status)}
                    label={assignment.status.replace('-', ' ')}
                    color={getStatusColor(assignment.status) as any}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>

                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {assignment.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                  {assignment.description || 'No description provided'}
                </Typography>

                {assignment.projects && (
                  <Typography variant="caption" display="block" sx={{ mb: 1, fontWeight: 500 }}>
                    Project: {assignment.projects.name}
                  </Typography>
                )}

                {assignment.assignee_id && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 500 }}>
                      Assigned to:
                    </Typography>
                    {(() => {
                      const assignedUser = getUserById(assignment.assignee_id);
                      return assignedUser ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Avatar sx={{ width: 16, height: 16, fontSize: '0.65rem' }}>
                            {assignedUser.avatar}
                          </Avatar>
                          <Typography variant="caption">
                            {assignedUser.name}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption">Unknown User</Typography>
                      );
                    })()}
                  </Box>
                )}

                {assignment.due_date && (
                  <Typography variant="caption" display="block" sx={{ mb: 2, color: 'warning.main' }}>
                    Due: {new Date(assignment.due_date).toLocaleDateString()}
                  </Typography>
                )}

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Progress
                    </Typography>
                    <Typography variant="body2" color="primary">
                      {assignment.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={assignment.progress} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                      }
                    }}
                  />
                </Box>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Stack direction="row" spacing={1} sx={{ width: '100%', justifyContent: 'space-between' }}>
                  <Stack direction="row" spacing={1}>
                    {assignment.status === 'todo' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<PlayArrow />}
                        onClick={() => updateAssignmentStatus(assignment.id, 'in-progress', 10)}
                      >
                        Start
                      </Button>
                    )}
                    
                    {assignment.status === 'in-progress' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => updateAssignmentStatus(assignment.id, 'completed', 100)}
                      >
                        Complete
                      </Button>
                    )}
                  </Stack>

                  <IconButton
                    size="small"
                    onClick={() => handleEditAssignment(assignment)}
                    sx={{ color: 'primary.main' }}
                  >
                    <Edit />
                  </IconButton>
                </Stack>
              </CardActions>
            </Card>
        ))}
      </Box>

      {/* Empty State */}
      {assignments.length === 0 && (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: 300,
            textAlign: 'center',
            color: 'text.secondary'
          }}
        >
          <AssignmentIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            No assignments yet
          </Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Create your first assignment to get started
          </Typography>
        </Box>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add assignment"
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Add />
      </Fab>

      {/* Assignment Dialog */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
            gap: 2, 
            mt: 1 
          }}>
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                variant="outlined"
              />
            </Box>
            
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                variant="outlined"
              />
            </Box>

            <Box>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                >
                  <MenuItem value="todo">To Do</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <FormControl fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Select
                  value={formData.assignee_id}
                  label="Assign To"
                  onChange={(e) => setFormData({...formData, assignee_id: e.target.value})}
                >
                  {MOCK_USERS.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                          {user.avatar}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">{user.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.role}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <TextField
                fullWidth
                type="date"
                label="Due Date"
                value={formData.due_date}
                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Box>

            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <Typography gutterBottom>Progress: {formData.progress}%</Typography>
              <Box sx={{ px: 1 }}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData({...formData, progress: parseInt(e.target.value)})}
                  style={{ width: '100%' }}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" sx={{ minWidth: 100 }}>
            {editingAssignment ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}