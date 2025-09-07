import * as React from 'react';
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
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
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add,
  Edit,
  PlayArrow,
  CheckCircle,
  Schedule,
  PriorityHigh,
  Assignment as AssignmentIcon,
  ExpandMore,
  FolderOpen,
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

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  manager_id: string | null;
}

interface FormData {
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  progress: number;
  assignee_id: string;
  project_id: string;
}


interface User {
  id: string;
  name: string;
  email: string;
}

export default function AssignmentManager() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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
    assignee_id: '',
    project_id: ''
  });

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
    fetchProjects();
    fetchAssignments();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await apiService.getCurrentUser();
      setCurrentUser(response);
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      // Fetch real users from the database
      const allUsers = await apiService.getUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to empty array if API fails
      setUsers([]);
    }
  };

  const fetchProjects = async () => {
    try {
      // Fetch projects from the database
      const allProjects = await apiService.getProjects();
      setProjects(allProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Fallback to empty array if API fails
      setProjects([]);
    }
  };

  const fetchAssignments = async () => {
    const userEmail = localStorage.getItem('user_email');
    if (!userEmail) {
      setAssignments([]);
      return;
    }
    
    try {
      setLoading(true);
      const data = await apiService.getAssignments();
      console.log('Fetched assignments data:', data); // Debug log
      console.log('Current user email:', userEmail); // Debug log
      console.log('Current user:', currentUser); // Debug log
      
      // Show ALL assignments for now to debug the issue
      // Later we can add filtering back if needed
      setAssignments(data || []);
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching assignments:', err);
      setError('Failed to load assignments. Please check your connection.');
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
      
      // Check if user is authenticated
      const userEmail = localStorage.getItem('user_email');
      if (!userEmail) {
        setError('Please log in to create assignments');
        return;
      }

      if (editingAssignment) {
        // Update existing assignment
        await apiService.updateAssignment(editingAssignment.id, {
          title: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          due_date: formData.due_date || undefined,
          progress: formData.progress
        });
      } else {
        // Create new assignment
        await apiService.createAssignment({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          due_date: formData.due_date || undefined,
          assignee_id: formData.assignee_id || currentUser?.email || localStorage.getItem('user_email') || undefined,
          project_id: formData.project_id || undefined
        });
      }
      
      // Refresh assignments list
      await fetchAssignments();
      handleCloseDialog();
    } catch (err: any) {
      console.error('Error saving assignment:', err);
      setError(err.message || 'Failed to save assignment');
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
      assignee_id: '',
      project_id: ''
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
      assignee_id: assignment.assignee_id || '',
      project_id: assignment.project_id || ''
    });
    setOpen(true);
  };

  const updateAssignmentStatus = async (id: string, newStatus: Assignment['status'], newProgress?: number) => {
    try {
      await apiService.updateAssignmentStatus(id, newStatus, newProgress);
      // Refresh assignments list
      await fetchAssignments();
    } catch (err: any) {
      console.error('Error updating assignment:', err);
      setError(err.message || 'Failed to update assignment');
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

  // Group assignments by project
  const groupAssignmentsByProject = () => {
    const grouped: { [key: string]: { project: Project | null, assignments: Assignment[] } } = {};
    
    assignments.forEach(assignment => {
      const projectId = assignment.project_id || 'no-project';
      const project = assignment.project_id ? projects.find(p => p.id === assignment.project_id) || null : null;
      
      if (!grouped[projectId]) {
        grouped[projectId] = {
          project,
          assignments: []
        };
      }
      
      grouped[projectId].assignments.push(assignment);
    });
    
    return grouped;
  };

  // Render individual assignment card
  const renderAssignmentCard = (assignment: Assignment) => (
    <Card 
      key={assignment.id} 
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

        {assignment.assignee_id && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Avatar sx={{ width: 20, height: 20, bgcolor: 'secondary.main', fontSize: '0.75rem' }}>
              {(() => {
                const assignedUser = users.find(u => u.email === assignment.assignee_id || u.id === assignment.assignee_id);
                return assignedUser ? assignedUser.name.charAt(0).toUpperCase() : assignment.assignee_id?.charAt(0).toUpperCase() || 'U';
              })()}
            </Avatar>
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              {(() => {
                const assignedUser = users.find(u => u.email === assignment.assignee_id || u.id === assignment.assignee_id);
                const userEmail = localStorage.getItem('user_email');
                if (assignment.assignee_id === userEmail || assignment.assignee_id === currentUser?.email) {
                  return 'Me';
                }
                return assignedUser ? assignedUser.name : assignment.assignee_id;
              })()}
            </Typography>
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
  );

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

      {/* Assignments Grouped by Projects */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {Object.entries(groupAssignmentsByProject()).map(([projectId, { project, assignments: projectAssignments }]) => (
          <Box key={projectId}>
            <Accordion 
              defaultExpanded 
              sx={{ 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '&:before': { display: 'none' },
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMore />}
                sx={{ 
                  bgcolor: project ? 'primary.main' : 'grey.100',
                  color: project ? 'white' : 'text.primary',
                  minHeight: 60,
                  '&.Mui-expanded': { minHeight: 60 }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FolderOpen />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {project?.name || 'No Project'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
                    <Chip
                      label={`${projectAssignments.length} assignment${projectAssignments.length !== 1 ? 's' : ''}`}
                      size="small"
                      sx={{
                        bgcolor: project ? 'rgba(255,255,255,0.2)' : 'primary.main',
                        color: project ? 'white' : 'white'
                      }}
                    />
                    <Chip
                      label={`${projectAssignments.filter(a => a.status === 'completed').length} completed`}
                      size="small"
                      sx={{
                        bgcolor: project ? 'rgba(255,255,255,0.2)' : 'success.main',
                        color: project ? 'white' : 'white'
                      }}
                    />
                  </Box>
                </Box>
              </AccordionSummary>
              
              <AccordionDetails sx={{ p: 3, bgcolor: 'background.paper' }}>
                {project?.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {project.description}
                  </Typography>
                )}
                
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, 
                  gap: 3 
                }}>
                  {projectAssignments.map((assignment) => renderAssignmentCard(assignment))}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
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
        <DialogTitle sx={{ pb: 1, fontWeight: 600 }}>
          {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
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
                  <MenuItem value="">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                        Me
                      </Avatar>
                      <span>Assign to myself</span>
                    </Box>
                  </MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.email}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: 'secondary.main' }}>
                          {user.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">{user.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <FormControl fullWidth>
                <InputLabel>Project</InputLabel>
                <Select
                  value={formData.project_id}
                  label="Project"
                  onChange={(e) => setFormData({...formData, project_id: e.target.value})}
                >
                  <MenuItem value="">
                    <span>No Project</span>
                  </MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      <Box>
                        <Typography variant="body2">{project.name}</Typography>
                        {project.description && (
                          <Typography variant="caption" color="text.secondary">
                            {project.description.substring(0, 50)}{project.description.length > 50 ? '...' : ''}
                          </Typography>
                        )}
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