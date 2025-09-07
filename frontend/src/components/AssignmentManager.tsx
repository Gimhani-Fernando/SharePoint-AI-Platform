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
  Psychology,
  Close,
  Description,
  LightbulbOutlined,
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


interface AIInsights {
  analysis: string;
  timeline: { step: string; estimated_hours: number; priority: string }[];
  document_suggestions: { document_id: string; title: string; relevance_score: number; reason: string }[];
  recommendations: string[];
  assignmentDueDate?: string | null;
  assignmentTitle?: string;
}

interface Document {
  document_id: string;
  title: string;
  file_type: string;
  upload_date: string;
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
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [currentInsights, setCurrentInsights] = useState<AIInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
    fetchProjects();
    fetchAssignments();
    fetchDocuments();
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

  const fetchDocuments = async () => {
    try {
      const allDocuments = await apiService.getDocuments();
      setDocuments(allDocuments);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
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

  const handleGetInsights = async (assignment: Assignment) => {
    try {
      setInsightsLoading(true);
      setInsightsOpen(true);
      setCurrentInsights(null);
      
      const insights = await apiService.getAssignmentInsights(assignment.id);
      
      // Add assignment context for date calculations
      const insightsWithContext = {
        ...insights.insights,
        assignmentDueDate: assignment.due_date,
        assignmentTitle: assignment.title
      };
      
      setCurrentInsights(insightsWithContext);
    } catch (err: any) {
      console.error('Error getting AI insights:', err);
      setError(err.message || 'Failed to generate AI insights');
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleCloseInsights = () => {
    setInsightsOpen(false);
    setCurrentInsights(null);
  };

  const calculateTimelineDates = (timeline: any[], dueDate: string | null) => {
    if (!dueDate || !timeline.length) return timeline;

    const due = new Date(dueDate);
    const today = new Date();
    const totalDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (totalDays <= 0) {
      // If assignment is overdue, spread over next 7 days
      return timeline.map((step, index) => ({
        ...step,
        date: new Date(today.getTime() + (index + 1) * 24 * 60 * 60 * 1000)
      }));
    }

    // Distribute steps evenly across available time
    const stepInterval = Math.floor(totalDays / timeline.length);
    
    return timeline.map((step, index) => {
      const stepDate = new Date(today.getTime() + (index * stepInterval + 1) * 24 * 60 * 60 * 1000);
      return {
        ...step,
        date: stepDate
      };
    });
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
            
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              startIcon={<Psychology />}
              onClick={() => handleGetInsights(assignment)}
              sx={{ borderColor: 'secondary.main', color: 'secondary.main' }}
            >
              AI Insights
            </Button>
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

      {/* AI Insights Dialog */}
      <Dialog 
        open={insightsOpen} 
        onClose={handleCloseInsights} 
        maxWidth="md" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': { minHeight: '80vh', maxHeight: '90vh' }
        }}
      >
        <DialogTitle sx={{ pb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Psychology color="secondary" />
            <span>AI Assignment Insights</span>
          </Box>
          <IconButton onClick={handleCloseInsights} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          {insightsLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <LinearProgress sx={{ width: '100%', mb: 2 }} />
              <Typography>Generating AI insights...</Typography>
            </Box>
          ) : currentInsights ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Analysis Section */}
              <Card sx={{ p: 3, bgcolor: 'background.default' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <LightbulbOutlined color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Analysis</Typography>
                </Box>
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                  {typeof currentInsights.analysis === 'string' && currentInsights.analysis.startsWith('```json') 
                    ? currentInsights.analysis.replace(/```json|```/g, '').trim()
                    : currentInsights.analysis}
                </Typography>
              </Card>

              {/* Timeline Section */}
              {currentInsights.timeline && currentInsights.timeline.length > 0 && (
                <Card sx={{ p: 4, bgcolor: '#f8fafc', border: 'none', boxShadow: 'none' }}>
                  {/* Header */}
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      color: '#1e293b',
                      mb: 1,
                      fontSize: '1.75rem'
                    }}>
                      Suggested Timeline
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1rem' }}>
                      Step-by-step breakdown to complete your assignment
                    </Typography>
                  </Box>
                  
                  {/* Timeline Content */}
                  <Box sx={{ position: 'relative', maxWidth: 900, mx: 'auto' }}>
                    {/* Connecting Line */}
                    <Box sx={{
                      position: 'absolute',
                      left: '50%',
                      transform: 'translateX(-1px)', // Center the line exactly
                      top: 28, // Start from first circle
                      bottom: 28, // End at last circle
                      width: 2,
                      background: 'linear-gradient(to bottom, #e2e8f0, #cbd5e1)',
                      zIndex: 0
                    }} />
                    
                    {(() => {
                      const timelineWithDates = calculateTimelineDates(currentInsights.timeline, currentInsights.assignmentDueDate || null);
                      return timelineWithDates.map((step, index) => (
                        <Box key={index} sx={{ 
                          display: 'grid',
                          gridTemplateColumns: '1fr auto 1fr',
                          alignItems: 'center',
                          gap: 0,
                          minHeight: 120,
                          mb: index === timelineWithDates.length - 1 ? 0 : 3,
                          position: 'relative'
                        }}>
                          {/* Left Content (even indexes) */}
                          <Box sx={{ 
                            display: 'flex',
                            justifyContent: 'flex-end',
                            pr: 2
                          }}>
                            {index % 2 === 0 && (
                              <Box sx={{
                                bgcolor: 'white',
                                p: 3,
                                borderRadius: 3,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                border: '1px solid #e2e8f0',
                                maxWidth: 320,
                                position: 'relative',
                                '&::after': {
                                  content: '""',
                                  position: 'absolute',
                                  right: -8,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  width: 0,
                                  height: 0,
                                  borderTop: '8px solid transparent',
                                  borderBottom: '8px solid transparent',
                                  borderLeft: '8px solid white'
                                }
                              }}>
                                <Typography variant="h6" sx={{ 
                                  fontWeight: 600, 
                                  color: '#1e293b',
                                  mb: 1,
                                  fontSize: '1rem',
                                  lineHeight: 1.3
                                }}>
                                  {step.step}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap', mb: 1 }}>
                                  <Box sx={{
                                    px: 2,
                                    py: 0.5,
                                    borderRadius: 2,
                                    bgcolor: '#3b82f6',
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    fontWeight: 500
                                  }}>
                                    {step.estimated_hours}h
                                  </Box>
                                  <Box sx={{
                                    px: 2,
                                    py: 0.5,
                                    borderRadius: 2,
                                    bgcolor: step.priority === 'high' ? '#ef4444' : 
                                           step.priority === 'medium' ? '#f59e0b' : '#10b981',
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    textTransform: 'capitalize'
                                  }}>
                                    {step.priority}
                                  </Box>
                                </Box>
                                {step.date && (
                                  <Typography variant="caption" sx={{ 
                                    color: '#64748b', 
                                    fontWeight: 500, 
                                    textAlign: 'right', 
                                    display: 'block' 
                                  }}>
                                    {step.date.toLocaleDateString('en-US', { 
                                      weekday: 'short',
                                      month: 'short', 
                                      day: 'numeric' 
                                    })}
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </Box>

                          {/* Center Circle - Always Present */}
                          <Box sx={{ 
                            display: 'flex',
                            justifyContent: 'center',
                            zIndex: 2
                          }}>
                            <Box sx={{ 
                              width: 56, 
                              height: 56, 
                              borderRadius: '50%',
                              background: step.priority === 'high' 
                                ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
                                : step.priority === 'medium' 
                                ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                                : 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 700,
                              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                              border: '4px solid white'
                            }}>
                              <Typography sx={{ fontSize: '0.7rem', lineHeight: 1 }}>
                                {step.date ? step.date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : 'TBD'}
                              </Typography>
                              <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1 }}>
                                {step.date ? step.date.getDate() : index + 1}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Right Content (odd indexes) */}
                          <Box sx={{ 
                            display: 'flex',
                            justifyContent: 'flex-start',
                            pl: 2
                          }}>
                            {index % 2 === 1 && (
                              <Box sx={{
                                bgcolor: 'white',
                                p: 3,
                                borderRadius: 3,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                border: '1px solid #e2e8f0',
                                maxWidth: 320,
                                position: 'relative',
                                '&::after': {
                                  content: '""',
                                  position: 'absolute',
                                  left: -8,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  width: 0,
                                  height: 0,
                                  borderTop: '8px solid transparent',
                                  borderBottom: '8px solid transparent',
                                  borderRight: '8px solid white'
                                }
                              }}>
                                <Typography variant="h6" sx={{ 
                                  fontWeight: 600, 
                                  color: '#1e293b',
                                  mb: 1,
                                  fontSize: '1rem',
                                  lineHeight: 1.3
                                }}>
                                  {step.step}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                  <Box sx={{
                                    px: 2,
                                    py: 0.5,
                                    borderRadius: 2,
                                    bgcolor: '#3b82f6',
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    fontWeight: 500
                                  }}>
                                    {step.estimated_hours}h
                                  </Box>
                                  <Box sx={{
                                    px: 2,
                                    py: 0.5,
                                    borderRadius: 2,
                                    bgcolor: step.priority === 'high' ? '#ef4444' : 
                                           step.priority === 'medium' ? '#f59e0b' : '#10b981',
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    textTransform: 'capitalize'
                                  }}>
                                    {step.priority}
                                  </Box>
                                </Box>
                                {step.date && (
                                  <Typography variant="caption" sx={{ 
                                    color: '#64748b', 
                                    fontWeight: 500 
                                  }}>
                                    {step.date.toLocaleDateString('en-US', { 
                                      weekday: 'short',
                                      month: 'short', 
                                      day: 'numeric' 
                                    })}
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </Box>
                        </Box>
                      ));
                    })()}
                  </Box>
                </Card>
              )}

              {/* Document Suggestions */}
              {currentInsights.document_suggestions && currentInsights.document_suggestions.length > 0 && (
                <Card sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Description color="success" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Suggested Documents</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {currentInsights.document_suggestions.map((doc, index) => {
                      const documentInfo = Array.isArray(documents) ? documents.find(d => d.document_id === doc.document_id) : null;
                      return (
                        <Box key={index} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {doc.title}
                            </Typography>
                            <Chip 
                              size="small" 
                              label={`${Math.round(doc.relevance_score * 100)}% match`}
                              color={doc.relevance_score > 0.8 ? 'success' : doc.relevance_score > 0.6 ? 'warning' : 'default'}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {doc.reason}
                          </Typography>
                          {documentInfo && (
                            <Typography variant="caption" color="text.secondary">
                              {documentInfo.file_type} • Uploaded {new Date(documentInfo.upload_date).toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Card>
              )}

              {/* Recommendations */}
              {currentInsights.recommendations && currentInsights.recommendations.length > 0 && (
                <Card sx={{ p: 3, bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <LightbulbOutlined />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Recommendations</Typography>
                  </Box>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {currentInsights.recommendations.map((rec, index) => (
                      <Typography key={index} component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.6 }}>
                        {rec}
                      </Typography>
                    ))}
                  </Box>
                </Card>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <Psychology sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Failed to generate insights
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please try again later
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseInsights} variant="outlined" sx={{ minWidth: 100 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

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
                slotProps={{ inputLabel: { shrink: true } }}
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