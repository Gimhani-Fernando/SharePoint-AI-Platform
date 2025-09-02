import * as React from 'react';
import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Stack,
  Divider,
  Alert,
  Paper,
} from '@mui/material';
import {
  CloudUpload,
  Description,
  PictureAsPdf,
  TableChart,
  TextSnippet,
  Image,
  VideoFile,
  Download,
  Delete,
  Edit,
  Visibility,
  Share,
  FolderOpen,
  Search,
  FilterList,
  MoreVert,
  Add,
} from '@mui/icons-material';

// Mock data
const MOCK_DOCUMENTS = [
  {
    id: '1',
    name: 'SharePoint API Documentation.pdf',
    type: 'pdf',
    size: '2.4 MB',
    uploadedBy: 'John Doe',
    uploadedAt: '2024-12-20T10:30:00Z',
    project: 'SharePoint Integration',
    status: 'processed',
    tags: ['documentation', 'api', 'technical'],
    description: 'Comprehensive API documentation for SharePoint integration'
  },
  {
    id: '2',
    name: 'Security Guidelines.docx',
    type: 'document',
    size: '1.8 MB',
    uploadedBy: 'Sarah Wilson',
    uploadedAt: '2024-12-19T14:15:00Z',
    project: 'Security Enhancement',
    status: 'processing',
    tags: ['security', 'guidelines', 'policy'],
    description: 'Security best practices and implementation guidelines'
  },
  {
    id: '3',
    name: 'Project Timeline.xlsx',
    type: 'spreadsheet',
    size: '856 KB',
    uploadedBy: 'Mike Johnson',
    uploadedAt: '2024-12-18T09:45:00Z',
    project: 'UI/UX Overhaul',
    status: 'processed',
    tags: ['timeline', 'project-management', 'planning'],
    description: 'Detailed project timeline with milestones and deliverables'
  },
  {
    id: '4',
    name: 'User Interface Mockups.zip',
    type: 'archive',
    size: '15.2 MB',
    uploadedBy: 'Lisa Chen',
    uploadedAt: '2024-12-17T16:20:00Z',
    project: 'UI/UX Overhaul',
    status: 'processed',
    tags: ['design', 'mockups', 'ui-ux'],
    description: 'High-fidelity mockups for the new user interface design'
  },
  {
    id: '5',
    name: 'Database Schema.sql',
    type: 'code',
    size: '124 KB',
    uploadedBy: 'David Brown',
    uploadedAt: '2024-12-16T11:10:00Z',
    project: 'Performance Boost',
    status: 'processed',
    tags: ['database', 'schema', 'sql'],
    description: 'Updated database schema with performance optimizations'
  },
  {
    id: '6',
    name: 'Training Video.mp4',
    type: 'video',
    size: '45.7 MB',
    uploadedBy: 'Emma Davis',
    uploadedAt: '2024-12-15T13:30:00Z',
    project: 'Training Program',
    status: 'processed',
    tags: ['training', 'video', 'tutorial'],
    description: 'Comprehensive training video for new team members'
  }
];

const MOCK_STATS = {
  total_documents: 156,
  processed_documents: 142,
  processing_documents: 8,
  failed_documents: 6,
  storage_used: '2.3 GB',
  storage_limit: '10 GB'
};

export default function DocumentManager() {
  const [documents] = useState(MOCK_DOCUMENTS);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewFilter, setViewFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <PictureAsPdf color="error" />;
      case 'document': return <Description color="primary" />;
      case 'spreadsheet': return <TableChart color="success" />;
      case 'image': return <Image color="warning" />;
      case 'video': return <VideoFile color="secondary" />;
      case 'code': return <TextSnippet color="info" />;
      default: return <Description />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'success';
      case 'processing': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStoragePercentage = () => {
    return (2.3 / 10) * 100; // 2.3GB used out of 10GB
  };

  const filteredDocuments = documents.filter(doc => {
    if (viewFilter !== 'all' && doc.status !== viewFilter) return false;
    if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
          Document Manager 📁
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
          Manage, organize, and process your documents with AI-powered insights.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
        gap: 3, 
        mb: 4 
      }}>
        <Box>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            height: '120px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <CardContent sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {MOCK_STATS.total_documents}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Documents
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 50, height: 50 }}>
                  <Description sx={{ fontSize: 24 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            height: '120px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <CardContent sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {MOCK_STATS.processed_documents}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Processed
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 50, height: 50 }}>
                  <TextSnippet sx={{ fontSize: 24 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            height: '120px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <CardContent sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {MOCK_STATS.processing_documents}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Processing
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 50, height: 50 }}>
                  <CloudUpload sx={{ fontSize: 24 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white',
            height: '120px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <CardContent sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {MOCK_STATS.storage_used}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Storage Used
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 50, height: 50 }}>
                  <FolderOpen sx={{ fontSize: 24 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Storage Usage */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
        gap: 3, 
        mb: 4 
      }}>
        <Box>
          <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Storage Usage
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Used: {MOCK_STATS.storage_used}</Typography>
                  <Typography variant="body2">Limit: {MOCK_STATS.storage_limit}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getStoragePercentage()}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {(10 - 2.3).toFixed(1)} GB remaining
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Upload New Document
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Drag and drop files or click to browse
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setUploadOpen(true)}
                sx={{ borderRadius: 2 }}
              >
                Choose Files
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Controls */}
      <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
            gap: 3, 
            alignItems: 'center' 
          }}>
            <Box>
              <TextField
                fullWidth
                size="small"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Box>
            <Box>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={viewFilter}
                  label="Filter by Status"
                  onChange={(e) => setViewFilter(e.target.value)}
                  startAdornment={<FilterList sx={{ mr: 1, color: 'text.secondary' }} />}
                >
                  <MenuItem value="all">All Documents</MenuItem>
                  <MenuItem value="processed">Processed</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button variant="outlined" startIcon={<Download />}>
                  Export List
                </Button>
                <Button variant="contained" startIcon={<CloudUpload />} onClick={() => setUploadOpen(true)}>
                  Upload Files
                </Button>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 0 }}>
          <List>
            {filteredDocuments.map((document, index) => (
              <React.Fragment key={document.id}>
                <ListItem sx={{ px: 3, py: 2 }}>
                  <ListItemIcon>
                    <Box sx={{ position: 'relative' }}>
                      {getFileIcon(document.type)}
                      {document.status === 'processing' && (
                        <Box sx={{
                          position: 'absolute',
                          top: -4,
                          right: -4,
                          width: 12,
                          height: 12,
                          bgcolor: 'warning.main',
                          borderRadius: '50%',
                          animation: 'pulse 2s infinite'
                        }} />
                      )}
                    </Box>
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, flex: 1 }}>
                          {document.name}
                        </Typography>
                        <Chip
                          label={document.status}
                          color={getStatusColor(document.status) as any}
                          size="small"
                          sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
                          {document.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Size: {document.size}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Project: {document.project}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            By: {document.uploadedBy}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(document.uploadedAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={0.5}>
                          {document.tags.map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: '20px' }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    }
                  />

                  <ListItemSecondaryAction>
                    <Stack direction="row" spacing={1}>
                      <IconButton size="small" title="View">
                        <Visibility />
                      </IconButton>
                      <IconButton size="small" title="Download">
                        <Download />
                      </IconButton>
                      <IconButton size="small" title="Share">
                        <Share />
                      </IconButton>
                      <IconButton size="small" title="More options">
                        <MoreVert />
                      </IconButton>
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < filteredDocuments.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>

          {filteredDocuments.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Description sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No documents found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery ? 'Try adjusting your search terms' : 'Upload your first document to get started'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Upload Documents
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Paper
              sx={{
                p: 4,
                border: '2px dashed',
                borderColor: 'primary.main',
                bgcolor: 'primary.50',
                borderRadius: 2,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'primary.100' }
              }}
            >
              <CloudUpload sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Drag and drop files here
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                or click to browse your computer
              </Typography>
              <Button variant="contained" component="label">
                Choose Files
                <input type="file" hidden multiple />
              </Button>
            </Paper>
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, ZIP
            <br />
            Maximum file size: 100 MB per file
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setUploadOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button variant="contained" onClick={() => setUploadOpen(false)}>
            Start Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}