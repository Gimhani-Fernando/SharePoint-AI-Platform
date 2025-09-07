import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Fab,
  Menu,
  MenuItem,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  CloudSync,
  CheckCircle,
  Error,
  Info,
  Refresh,
  FolderOpen,
  Description,
  Close,
  CloudUpload,
  Download,
  CreateNewFolder,
  MoreVert,
  Folder,
  InsertDriveFile,
  NavigateNext,
} from '@mui/icons-material';
import { useOneDrive } from '../contexts/OneDriveContext';

interface OneDriveFile {
  id: string;
  name: string;
  size: number;
  webUrl: string;
  downloadUrl?: string;
  lastModifiedDateTime: string;
  folder?: any;
  file?: any;
}

const OneDriveIntegration: React.FC = () => {
  const {
    isAuthenticated,
    account,
    signIn,
    signOut,
    listFiles,
    uploadFile,
    downloadFile,
    createFolder,
    loading,
    error,
    clearError,
  } = useOneDrive();

  const [files, setFiles] = useState<OneDriveFile[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([
    { id: 'root', name: 'OneDrive' }
  ]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<OneDriveFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load files when folder changes or after authentication
  useEffect(() => {
    if (isAuthenticated) {
      loadFiles();
    }
  }, [isAuthenticated, currentFolderId]);

  // Clear errors after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const loadFiles = async () => {
    try {
      const fileList = await listFiles(currentFolderId);
      setFiles(fileList);
    } catch (err) {
      console.error('Error loading files:', err);
    }
  };

  const handleConnect = async () => {
    try {
      await signIn();
    } catch (err) {
      console.error('Connection error:', err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await signOut();
      setFiles([]);
      setCurrentFolderId('root');
      setFolderPath([{ id: 'root', name: 'OneDrive' }]);
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadFile(selectedFile, currentFolderId);
      setShowUploadDialog(false);
      setSelectedFile(null);
      await loadFiles(); // Refresh file list
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await createFolder(newFolderName, currentFolderId);
      setShowCreateFolderDialog(false);
      setNewFolderName('');
      await loadFiles(); // Refresh file list
    } catch (err) {
      console.error('Create folder error:', err);
    }
  };

  const handleItemClick = (item: OneDriveFile) => {
    if (item.folder) {
      // Navigate to folder
      setCurrentFolderId(item.id);
      setFolderPath(prev => [...prev, { id: item.id, name: item.name }]);
    }
  };

  const handleBreadcrumbClick = (folderId: string, index: number) => {
    setCurrentFolderId(folderId);
    setFolderPath(prev => prev.slice(0, index + 1));
  };

  const handleDownload = async (item: OneDriveFile) => {
    try {
      const blob = await downloadFile(item.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: OneDriveFile) => {
    setMenuAnchor(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedItem(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSeverity = () => {
    if (error) return 'error';
    if (loading) return 'info';
    if (isAuthenticated) return 'success';
    return 'info';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        OneDrive Integration
      </Typography>

      {/* Connection Status Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CloudSync sx={{ mr: 1 }} />
            <Typography variant="h6">OneDrive Connection</Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Connect your Microsoft OneDrive account to access and manage your files.
          </Typography>

          {/* Connection Status */}
          <Box sx={{ mb: 2 }}>
            <Chip
              icon={isAuthenticated ? <CheckCircle /> : <Error />}
              label={isAuthenticated ? `Connected as ${account?.name || account?.username}` : 'Not Connected'}
              color={isAuthenticated ? 'success' : 'error'}
              sx={{ mb: 2 }}
            />
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {!isAuthenticated ? (
              <Button
                variant="contained"
                startIcon={<CloudSync />}
                onClick={handleConnect}
                disabled={loading}
              >
                {loading ? 'Connecting...' : 'Connect to OneDrive'}
              </Button>
            ) : (
              <Button
                variant="outlined"
                startIcon={<Close />}
                onClick={handleDisconnect}
                disabled={loading}
              >
                Disconnect
              </Button>
            )}

            {isAuthenticated && (
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadFiles}
                disabled={loading}
              >
                Refresh
              </Button>
            )}
          </Box>

          {/* Loading Indicator */}
          {loading && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Please wait...
              </Typography>
            </Box>
          )}

          {/* Error/Status Messages */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
              {error}
            </Alert>
          )}

          {isAuthenticated && !loading && !error && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Successfully connected to OneDrive! You can now browse and manage your files.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* File Browser */}
      {isAuthenticated && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Your Files</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CloudUpload />}
                  onClick={() => setShowUploadDialog(true)}
                >
                  Upload
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CreateNewFolder />}
                  onClick={() => setShowCreateFolderDialog(true)}
                >
                  New Folder
                </Button>
              </Box>
            </Box>

            {/* Breadcrumb Navigation */}
            <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2 }}>
              {folderPath.map((folder, index) => (
                <Link
                  key={folder.id}
                  underline="hover"
                  color={index === folderPath.length - 1 ? "textPrimary" : "inherit"}
                  onClick={() => handleBreadcrumbClick(folder.id, index)}
                  sx={{ cursor: 'pointer' }}
                >
                  {folder.name}
                </Link>
              ))}
            </Breadcrumbs>

            {/* File List */}
            {files.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <FolderOpen sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  This folder is empty
                </Typography>
              </Box>
            ) : (
              <List>
                {files.map((item) => (
                  <ListItem
                    key={item.id}
                    divider
                    sx={{ cursor: item.folder ? 'pointer' : 'default' }}
                    onClick={() => handleItemClick(item)}
                  >
                    <ListItemIcon>
                      {item.folder ? <Folder color="primary" /> : <InsertDriveFile />}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.name}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {item.folder ? 'Folder' : `Size: ${formatFileSize(item.size)}`}
                          </Typography>
                          <Typography variant="caption" display="block">
                            Modified: {formatDate(item.lastModifiedDateTime)}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={(e) => handleMenuOpen(e, item)}
                      >
                        <MoreVert />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onClose={() => setShowUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload File to OneDrive</DialogTitle>
        <DialogContent>
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          />
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => fileInputRef.current?.click()}
              sx={{ mb: 2 }}
            >
              {selectedFile ? selectedFile.name : 'Choose File'}
            </Button>
            {selectedFile && (
              <Typography variant="body2" color="text.secondary">
                Size: {formatFileSize(selectedFile.size)}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadDialog(false)}>Cancel</Button>
          <Button
            onClick={handleFileUpload}
            variant="contained"
            disabled={!selectedFile || loading}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Folder Dialog */}
      <Dialog open={showCreateFolderDialog} onClose={() => setShowCreateFolderDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            variant="outlined"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateFolderDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateFolder}
            variant="contained"
            disabled={!newFolderName.trim() || loading}
          >
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        {selectedItem && !selectedItem.folder && (
          <MenuItem onClick={() => { handleDownload(selectedItem); handleMenuClose(); }}>
            <Download sx={{ mr: 1 }} />
            Download
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            if (selectedItem) window.open(selectedItem.webUrl, '_blank');
            handleMenuClose();
          }}
        >
          <FolderOpen sx={{ mr: 1 }} />
          Open in OneDrive
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default OneDriveIntegration;