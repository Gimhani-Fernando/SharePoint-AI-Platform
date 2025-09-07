import * as React from 'react';
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
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

interface Document {
  id: string;
  name?: string;
  title?: string;
  file_type?: string;
  file_size: number;
  uploaded_by?: string;
  uploaded_at: string;
  created_at?: string;
  project_id?: string;
  status: string;
  tags?: string[];
  description?: string;
  metadata?: any;
}

interface DocumentStats {
  total_documents: number;
  processed_documents: number;
  processing_documents: number;
  failed_documents: number;
  storage_used: string;
  storage_limit: string;
}

export default function DocumentManager() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentStats, setDocumentStats] = useState<DocumentStats | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewFilter, setViewFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadDocuments();
    loadDocumentStats();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDocuments();
      setDocuments(response.documents || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDocumentStats = async () => {
    try {
      // For now using mock stats - you can implement a real API endpoint later
      setDocumentStats({
        total_documents: 0,
        processed_documents: 0,
        processing_documents: 0,
        failed_documents: 0,
        storage_used: '0 GB',
        storage_limit: '10 GB'
      });
    } catch (error) {
      console.error('Error loading document stats:', error);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    // Check if user is authenticated using development mode
    const userEmail = localStorage.getItem('user_email');
    if (!userEmail) {
      alert('Please log in to upload documents');
      return;
    }

    setUploading(true);
    const results = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const result = await apiService.uploadDocument(file);
          results.push({ 
            file: file.name, 
            success: true, 
            message: result.message || 'Upload successful',
            processed: result.processed || false,
            chunks: result.chunks_created || 0
          });
          console.log(`✅ Uploaded ${file.name}:`, result);
        } catch (fileError) {
          results.push({ 
            file: file.name, 
            success: false, 
            message: fileError instanceof Error ? fileError.message : 'Upload failed' 
          });
          console.error(`❌ Failed to upload ${file.name}:`, fileError);
        }
      }
      
      // Show detailed results
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      let alertMessage = `Upload Summary:\n`;
      if (successful.length > 0) {
        alertMessage += `✅ ${successful.length} files uploaded successfully\n`;
        successful.forEach(r => {
          if (r.processed) {
            alertMessage += `   • ${r.file} - AI processed (${r.chunks} chunks created)\n`;
          } else {
            alertMessage += `   • ${r.file} - uploaded\n`;
          }
        });
      }
      if (failed.length > 0) {
        alertMessage += `❌ ${failed.length} files failed\n`;
        failed.forEach(r => alertMessage += `   • ${r.file} - ${r.message}\n`);
      }
      
      alert(alertMessage);
      
      // Reload documents after upload
      await loadDocuments();
      await loadDocumentStats();
      setUploadOpen(false);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Upload process encountered an error. Check console for details.');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <Description />;
    
    if (mimeType.includes('pdf')) return <PictureAsPdf color="error" />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <Description color="primary" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <TableChart color="success" />;
    if (mimeType.includes('image')) return <Image color="warning" />;
    if (mimeType.includes('video')) return <VideoFile color="secondary" />;
    if (mimeType.includes('text') || mimeType.includes('code')) return <TextSnippet color="info" />;
    
    return <Description />;
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
    if (!documentStats) return 0;
    const used = parseFloat(documentStats.storage_used.split(' ')[0]);
    const limit = parseFloat(documentStats.storage_limit.split(' ')[0]);
    return (used / limit) * 100;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter(doc => {
    if (viewFilter !== 'all' && doc.status !== viewFilter) return false;
    if (searchQuery) {
      const docName = (doc.name || doc.title || '').toLowerCase();
      if (!docName.includes(searchQuery.toLowerCase())) return false;
    }
    return true;
  });

  // Update stats based on actual documents
  const actualStats = React.useMemo(() => {
    const total = documents.length;
    const processed = documents.filter(d => d.status === 'processed').length;
    const processing = documents.filter(d => d.status === 'processing').length;
    const failed = documents.filter(d => d.status === 'failed').length;
    const totalSize = documents.reduce((acc, doc) => acc + (doc.file_size || 0), 0);
    
    return {
      total_documents: total,
      processed_documents: processed,
      processing_documents: processing,
      failed_documents: failed,
      storage_used: formatFileSize(totalSize),
      storage_limit: '10 GB'
    };
  }, [documents]);

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
                    {actualStats.total_documents}
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
                    {actualStats.processed_documents}
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
                    {actualStats.processing_documents}
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
                    {actualStats.storage_used}
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
                  <Typography variant="body2">Used: {actualStats.storage_used}</Typography>
                  <Typography variant="body2">Limit: {actualStats.storage_limit}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getStoragePercentage()}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {loading ? 'Loading...' : 'Storage info'}
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
                      {getFileIcon(document.file_type)}
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
                          {document.name || document.title || 'Unknown Document'}
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
                          {document.description || `Document: ${document.name || document.title || 'Unknown file'}`}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            📁 Size: {formatFileSize(document.file_size || 0)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            📄 Type: {document.file_type || 'Unknown'}
                          </Typography>
                          {document.project_id && (
                            <Typography variant="caption" color="text.secondary">
                              🏷️ Project: {document.project_id}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            📅 {new Date(document.uploaded_at || document.created_at || Date.now()).toLocaleDateString()}
                          </Typography>
                        </Box>
                        {/* AI Processing Status */}
                        {document.status === 'processed' && (
                          <Box sx={{ mt: 1, p: 1, bgcolor: 'success.light', borderRadius: 1, opacity: 0.8 }}>
                            <Typography variant="caption" sx={{ color: 'success.dark', fontWeight: 500 }}>
                              ✅ AI Processed - Ready for intelligent search
                            </Typography>
                          </Box>
                        )}
                        {document.status === 'processing' && (
                          <Box sx={{ mt: 1, p: 1, bgcolor: 'warning.light', borderRadius: 1, opacity: 0.8 }}>
                            <Typography variant="caption" sx={{ color: 'warning.dark', fontWeight: 500 }}>
                              ⏳ AI Processing - Document is being analyzed...
                            </Typography>
                          </Box>
                        )}
                        {document.status === 'failed' && (
                          <Box sx={{ mt: 1, p: 1, bgcolor: 'error.light', borderRadius: 1, opacity: 0.8 }}>
                            <Typography variant="caption" sx={{ color: 'error.dark', fontWeight: 500 }}>
                              ❌ Processing Failed - Document may need manual review
                            </Typography>
                          </Box>
                        )}
                        {document.tags && document.tags.length > 0 && (
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
                        )}
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
              <Button variant="contained" component="label" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Choose Files'}
                <input 
                  type="file" 
                  hidden 
                  multiple 
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                />
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
          <Button onClick={() => setUploadOpen(false)} variant="outlined" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Cancel'}
          </Button>
          <Button 
            variant="contained" 
            onClick={() => setUploadOpen(false)}
            disabled={uploading}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}