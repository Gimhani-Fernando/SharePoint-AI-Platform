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
  const [viewDocument, setViewDocument] = useState<any>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

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

  const handleViewDocument = async (document: any) => {
    try {
      const response = await apiService.viewDocument(document.id);
      setViewDocument(response);
      setViewerOpen(true);
    } catch (error) {
      console.error('Error viewing document:', error);
      alert('Failed to load document content');
    }
  };

  const handleDownloadDocument = async (document: any) => {
    try {
      const blob = await apiService.downloadDocument(document.id);
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.title || document.name || 'document';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document');
    }
  };

  const handleShareDocument = async (document: any) => {
    const shareData = {
      title: document.title || document.name,
      text: `Check out this document: ${document.title || document.name}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        // Share completed successfully
      } catch (error: any) {
        // Handle share cancellation or other errors
        if (error.name !== 'AbortError') {
          // Only show error if it's not a user cancellation
          console.error('Error sharing:', error);
        }
        // User cancelled share or share failed - do nothing
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.url}`);
        alert('Document link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        alert('Failed to copy link to clipboard');
      }
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
          <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', height: '100%' }}>
            <CardContent sx={{ 
              p: 3, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              textAlign: 'center'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2
                }}>
                  <FolderOpen sx={{ fontSize: 24, color: 'white' }} />
                </Box>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Storage Usage
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Track your storage consumption
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mb: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Used: {actualStats.storage_used}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Limit: {actualStats.storage_limit}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getStoragePercentage()}
                  sx={{ 
                    height: 12, 
                    borderRadius: 6,
                    mb: 2,
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 6,
                    }
                  }}
                />
                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                  {Math.round(getStoragePercentage())}% Used
                </Typography>
              </Box>
              
              <Typography variant="caption" color="text.secondary">
                {loading ? 'Loading storage info...' : `${actualStats.total_documents || 0} documents stored`}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', height: '100%' }}>
            <CardContent sx={{ 
              p: 3, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                width: '100%',
                mb: 2
              }}>
                <CloudUpload sx={{ fontSize: 64, color: 'primary.main' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Upload New Document
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Drag and drop files or click to browse
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setUploadOpen(true)}
                sx={{ 
                  borderRadius: 2,
                  py: 1.5,
                  px: 3,
                  fontSize: '1rem',
                  fontWeight: 600
                }}
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
                      <IconButton 
                        size="small" 
                        title="View" 
                        onClick={() => handleViewDocument(document)}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        title="Download"
                        onClick={() => handleDownloadDocument(document)}
                      >
                        <Download />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        title="Share"
                        onClick={() => handleShareDocument(document)}
                      >
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

      {/* Document Viewer Dialog */}
      <Dialog 
        open={viewerOpen} 
        onClose={() => setViewerOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { height: '80vh' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Description />
            <Typography variant="h6">
              {viewDocument?.title || 'Document Viewer'}
            </Typography>
          </Box>
          <Box>
            {viewDocument && (
              <>
                <IconButton 
                  onClick={() => handleDownloadDocument({ id: viewDocument.document_id, title: viewDocument.title })}
                  title="Download"
                >
                  <Download />
                </IconButton>
                <IconButton 
                  onClick={() => setViewerOpen(false)}
                  title="Close"
                >
                  <MoreVert />
                </IconButton>
              </>
            )}
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {viewDocument ? (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Document Info Header */}
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">
                  📄 {viewDocument.file_type} • 📊 {formatFileSize(viewDocument.file_size)} • 📅 {new Date(viewDocument.created_at).toLocaleDateString()}
                </Typography>
              </Box>
              
              {/* Document Content */}
              <Box sx={{ flex: 1, overflow: 'hidden', bgcolor: 'white' }}>
                {viewDocument.has_file ? (
                  <Box sx={{ height: '100%', width: '100%' }}>
                    {viewDocument.file_type === 'application/pdf' ? (
                      /* PDF Viewer */
                      <iframe
                        src={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/documents/${viewDocument.document_id}/serve?user_email=${encodeURIComponent(localStorage.getItem('user_email') || '')}`}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          border: 'none' 
                        }}
                        title={viewDocument.title}
                      />
                    ) : viewDocument.file_type?.startsWith('image/') ? (
                      /* Image Viewer */
                      <Box sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        bgcolor: '#f5f5f5'
                      }}>
                        <img
                          src={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/documents/${viewDocument.document_id}/serve?user_email=${encodeURIComponent(localStorage.getItem('user_email') || '')}`}
                          alt={viewDocument.title}
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '100%', 
                            objectFit: 'contain' 
                          }}
                        />
                      </Box>
                    ) : viewDocument.file_type?.startsWith('text/') || 
                          viewDocument.file_type === 'application/json' ||
                          viewDocument.file_type === 'text/csv' ? (
                      /* Text file viewer */
                      <Box sx={{ height: '100%', overflow: 'auto', p: 2 }}>
                        <Box sx={{ 
                          fontFamily: 'monospace', 
                          fontSize: '0.9rem',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap',
                          bgcolor: '#f8f9fa',
                          p: 2,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}>
                          {viewDocument.content || 'Loading content...'}
                        </Box>
                      </Box>
                    ) : (
                      /* Unsupported file type - show download option */
                      <Box sx={{ 
                        height: '100%',
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'text.secondary',
                        p: 4
                      }}>
                        <Description sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                        <Typography variant="h6" gutterBottom>
                          Preview not available
                        </Typography>
                        <Typography variant="body2" textAlign="center" sx={{ mb: 3 }}>
                          This file type ({viewDocument.file_type}) cannot be previewed in the browser.
                          <br />
                          Please download the file to view its contents.
                        </Typography>
                        <Button 
                          variant="contained" 
                          startIcon={<Download />}
                          onClick={() => handleDownloadDocument({ id: viewDocument.document_id, title: viewDocument.title })}
                        >
                          Download File
                        </Button>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ 
                    height: '100%',
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'text.secondary',
                    p: 4
                  }}>
                    <Description sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" gutterBottom>
                      File not available
                    </Typography>
                    <Typography variant="body2" textAlign="center">
                      The original file is not available for viewing.
                      <br />
                      Only extracted text content is stored.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <LinearProgress />
              <Typography variant="body2" sx={{ mt: 2 }}>
                Loading document...
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={() => setViewerOpen(false)} variant="outlined">
            Close
          </Button>
          {viewDocument && (
            <Button 
              onClick={() => handleDownloadDocument({ id: viewDocument.document_id, title: viewDocument.title })}
              variant="contained"
              startIcon={<Download />}
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}