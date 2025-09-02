import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Paper,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Stack,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Badge,
  Breadcrumbs,
  Menu,
  MenuItem as MenuItemComponent
} from '@mui/material';
import {
  CloudSync,
  Description,
  CheckCircle,
  Error,
  Info,
  Warning,
  Sync,
  Settings,
  Add,
  Refresh,
  Download,
  Upload,
  Folder,
  InsertDriveFile,
  Schedule,
  Speed,
  Storage,
  Security,
  Link,
  Visibility,
  Edit,
  Delete,
  MoreVert,
  FolderOpen,
  PictureAsPdf,
  TableChart,
  Image,
  VideoFile,
  TextSnippet,
  QuestionAnswer,
  Summarize,
  SmartToy,
  ChevronRight,
  Home,
  Share,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';

interface SyncStatus {
  status: 'idle' | 'syncing' | 'completed' | 'error' | 'paused';
  message: string;
  progress: number;
  syncedFiles: number;
  totalFiles: number;
  lastSyncTime?: string;
  errors?: string[];
}

interface SharePointSite {
  id: string;
  name: string;
  url: string;
  lastSync?: string;
  status: 'connected' | 'disconnected' | 'syncing';
  documentCount: number;
  totalSize: string;
}

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modified: string;
  path: string;
  parentId?: string;
  fileType?: string;
  url?: string;
  summary?: string;
  processed?: boolean;
  children?: FileItem[];
}

interface BreadcrumbItem {
  id: string;
  name: string;
  path: string;
}

interface SyncedDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  syncStatus: 'synced' | 'pending' | 'error';
  sharepointUrl: string;
  localPath: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`sharepoint-tabpanel-${index}`}
      aria-labelledby={`sharepoint-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const MOCK_SHAREPOINT_SITES: SharePointSite[] = [
  {
    id: 'site-1',
    name: 'SharePoint AI Platform',
    url: 'https://company.sharepoint.com/sites/ai-platform',
    lastSync: '2024-12-22T10:30:00Z',
    status: 'connected',
    documentCount: 156,
    totalSize: '2.4 GB'
  },
  {
    id: 'site-2', 
    name: 'Technical Documentation',
    url: 'https://company.sharepoint.com/sites/tech-docs',
    lastSync: '2024-12-22T09:15:00Z',
    status: 'connected',
    documentCount: 89,
    totalSize: '1.8 GB'
  },
  {
    id: 'site-3',
    name: 'Project Management',
    url: 'https://company.sharepoint.com/sites/project-mgmt',
    status: 'disconnected',
    documentCount: 0,
    totalSize: '0 MB'
  }
];

const MOCK_SYNCED_DOCUMENTS: SyncedDocument[] = [
  {
    id: '1',
    name: 'SharePoint API Documentation.pdf',
    type: 'pdf',
    size: '2.4 MB',
    lastModified: '2024-12-22T10:30:00Z',
    syncStatus: 'synced',
    sharepointUrl: 'https://company.sharepoint.com/sites/ai-platform/documents/SharePoint_API_Documentation.pdf',
    localPath: '/documents/sharepoint-api-docs.pdf'
  },
  {
    id: '2',
    name: 'Technical Specifications.docx',
    type: 'docx',
    size: '1.8 MB',
    lastModified: '2024-12-22T09:45:00Z',
    syncStatus: 'synced',
    sharepointUrl: 'https://company.sharepoint.com/sites/tech-docs/Technical_Specifications.docx',
    localPath: '/documents/technical-specs.docx'
  },
  {
    id: '3',
    name: 'Database Migration Scripts.sql',
    type: 'sql',
    size: '856 KB',
    lastModified: '2024-12-22T14:20:00Z',
    syncStatus: 'pending',
    sharepointUrl: 'https://company.sharepoint.com/sites/ai-platform/scripts/migration.sql',
    localPath: '/documents/migration-scripts.sql'
  },
  {
    id: '4',
    name: 'UI Design System.figma',
    type: 'figma',
    size: '12.3 MB',
    lastModified: '2024-12-22T16:10:00Z',
    syncStatus: 'error',
    sharepointUrl: 'https://company.sharepoint.com/sites/tech-docs/UI_Design_System.figma',
    localPath: '/documents/design-system.figma'
  }
];

// Mock file structure data organized by site
const MOCK_SHAREPOINT_FILE_STRUCTURE: { [siteId: string]: FileItem[] } = {
  'site-1': [
    {
      id: 'site-1-root',
      name: 'SharePoint AI Platform',
      type: 'folder',
      modified: '2024-12-22T10:30:00Z',
      path: '/',
      children: [
      {
        id: 'documents',
        name: 'Documents',
        type: 'folder',
        modified: '2024-12-22T09:15:00Z',
        path: '/Documents',
        parentId: 'root',
        children: [
          {
            id: 'api-docs',
            name: 'SharePoint_API_Documentation.pdf',
            type: 'file',
            size: 2456789,
            modified: '2024-12-22T08:30:00Z',
            path: '/Documents/SharePoint_API_Documentation.pdf',
            parentId: 'documents',
            fileType: 'pdf',
            url: 'https://company.sharepoint.com/sites/ai-platform/documents/SharePoint_API_Documentation.pdf',
            summary: 'Comprehensive documentation for SharePoint API integration including authentication, endpoints, and best practices.',
            processed: true
          },
          {
            id: 'tech-specs',
            name: 'Technical_Specifications.docx',
            type: 'file',
            size: 1887436,
            modified: '2024-12-22T09:45:00Z',
            path: '/Documents/Technical_Specifications.docx',
            parentId: 'documents',
            fileType: 'docx',
            url: 'https://company.sharepoint.com/sites/tech-docs/Technical_Specifications.docx',
            summary: 'Detailed technical specifications for the AI platform including system architecture, database schema, and API design.',
            processed: true
          },
          {
            id: 'user-guide',
            name: 'User_Guide.pdf',
            type: 'file',
            size: 3245678,
            modified: '2024-12-21T14:20:00Z',
            path: '/Documents/User_Guide.pdf',
            parentId: 'documents',
            fileType: 'pdf',
            url: 'https://company.sharepoint.com/sites/ai-platform/documents/User_Guide.pdf',
            summary: 'Complete user guide covering all features of the SharePoint AI platform with step-by-step instructions.',
            processed: true
          }
        ]
      },
      {
        id: 'templates',
        name: 'Templates',
        type: 'folder',
        modified: '2024-12-20T15:30:00Z',
        path: '/Templates',
        parentId: 'root',
        children: [
          {
            id: 'project-template',
            name: 'Project_Template.docx',
            type: 'file',
            size: 456789,
            modified: '2024-12-20T15:30:00Z',
            path: '/Templates/Project_Template.docx',
            parentId: 'templates',
            fileType: 'docx',
            url: 'https://company.sharepoint.com/sites/ai-platform/templates/Project_Template.docx',
            summary: 'Standard project template including sections for goals, timeline, resources, and deliverables.',
            processed: true
          },
          {
            id: 'meeting-notes',
            name: 'Meeting_Notes_Template.docx',
            type: 'file',
            size: 234567,
            modified: '2024-12-19T11:15:00Z',
            path: '/Templates/Meeting_Notes_Template.docx',
            parentId: 'templates',
            fileType: 'docx',
            url: 'https://company.sharepoint.com/sites/ai-platform/templates/Meeting_Notes_Template.docx',
            summary: 'Meeting notes template with agenda, attendees, discussion points, and action items.',
            processed: true
          }
        ]
      },
      {
        id: 'reports',
        name: 'Reports',
        type: 'folder',
        modified: '2024-12-22T16:45:00Z',
        path: '/Reports',
        parentId: 'root',
        children: [
          {
            id: 'monthly-report',
            name: 'Monthly_Analytics_Report.xlsx',
            type: 'file',
            size: 1234567,
            modified: '2024-12-22T16:45:00Z',
            path: '/Reports/Monthly_Analytics_Report.xlsx',
            parentId: 'reports',
            fileType: 'xlsx',
            url: 'https://company.sharepoint.com/sites/ai-platform/reports/Monthly_Analytics_Report.xlsx',
            summary: 'Monthly analytics report showing platform usage, performance metrics, and user engagement statistics.',
            processed: true
          },
          {
            id: 'security-audit',
            name: 'Security_Audit_Report.pdf',
            type: 'file',
            size: 2345678,
            modified: '2024-12-21T13:20:00Z',
            path: '/Reports/Security_Audit_Report.pdf',
            parentId: 'reports',
            fileType: 'pdf',
            url: 'https://company.sharepoint.com/sites/ai-platform/reports/Security_Audit_Report.pdf',
            summary: 'Comprehensive security audit report identifying vulnerabilities, compliance status, and recommended actions.',
            processed: false
          }
        ]
      }
    ]
  }
  ],
  'site-2': [
    {
      id: 'site-2-root',
      name: 'Technical Documentation',
      type: 'folder',
      modified: '2024-12-22T09:15:00Z',
      path: '/',
      children: [
        {
          id: 'api-docs-folder',
          name: 'API Documentation',
          type: 'folder',
          modified: '2024-12-21T16:30:00Z',
          path: '/API Documentation',
          parentId: 'site-2-root',
          children: [
            {
              id: 'rest-api-guide',
              name: 'REST_API_Guide.pdf',
              type: 'file',
              size: 3456789,
              modified: '2024-12-21T16:30:00Z',
              path: '/API Documentation/REST_API_Guide.pdf',
              parentId: 'api-docs-folder',
              fileType: 'pdf',
              url: 'https://company.sharepoint.com/sites/tech-docs/api/REST_API_Guide.pdf',
              summary: 'Complete REST API guide with endpoints, authentication methods, and example requests.',
              processed: true
            },
            {
              id: 'graphql-schema',
              name: 'GraphQL_Schema.json',
              type: 'file',
              size: 234567,
              modified: '2024-12-21T15:20:00Z',
              path: '/API Documentation/GraphQL_Schema.json',
              parentId: 'api-docs-folder',
              fileType: 'json',
              url: 'https://company.sharepoint.com/sites/tech-docs/api/GraphQL_Schema.json',
              summary: 'GraphQL schema definitions for all available queries and mutations.',
              processed: true
            }
          ]
        },
        {
          id: 'architecture-folder',
          name: 'System Architecture',
          type: 'folder',
          modified: '2024-12-20T14:45:00Z',
          path: '/System Architecture',
          parentId: 'site-2-root',
          children: [
            {
              id: 'system-design',
              name: 'System_Design_Document.docx',
              type: 'file',
              size: 4567890,
              modified: '2024-12-20T14:45:00Z',
              path: '/System Architecture/System_Design_Document.docx',
              parentId: 'architecture-folder',
              fileType: 'docx',
              url: 'https://company.sharepoint.com/sites/tech-docs/architecture/System_Design_Document.docx',
              summary: 'Comprehensive system design document covering microservices architecture, data flow, and security considerations.',
              processed: true
            },
            {
              id: 'db-schema',
              name: 'Database_Schema.sql',
              type: 'file',
              size: 123456,
              modified: '2024-12-19T11:30:00Z',
              path: '/System Architecture/Database_Schema.sql',
              parentId: 'architecture-folder',
              fileType: 'sql',
              url: 'https://company.sharepoint.com/sites/tech-docs/architecture/Database_Schema.sql',
              summary: 'Complete database schema with tables, relationships, indexes, and stored procedures.',
              processed: true
            }
          ]
        }
      ]
    }
  ],
  'site-3': []
};

export default function SharePointSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    status: 'idle',
    message: 'Ready to sync',
    progress: 0,
    syncedFiles: 156,
    totalFiles: 156,
    lastSyncTime: '2024-12-22T10:30:00Z'
  });
  
  const [sites, setSites] = useState<SharePointSite[]>(MOCK_SHAREPOINT_SITES);
  const [documents, setDocuments] = useState<SyncedDocument[]>(MOCK_SYNCED_DOCUMENTS);
  const [tabValue, setTabValue] = useState(0);
  const [addSiteDialog, setAddSiteDialog] = useState(false);
  const [newSiteUrl, setNewSiteUrl] = useState('');
  
  // File browser state
  const [selectedSite, setSelectedSite] = useState<SharePointSite | null>(null);
  const [currentFolder, setCurrentFolder] = useState<FileItem | null>(null);
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [currentItems, setCurrentItems] = useState<FileItem[]>([]);

  // Helper functions for file browser
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf': return <PictureAsPdf sx={{ color: '#d32f2f' }} />;
      case 'docx': return <TextSnippet sx={{ color: '#2196f3' }} />;
      case 'xlsx': return <TableChart sx={{ color: '#4caf50' }} />;
      case 'jpg': case 'jpeg': case 'png': return <Image sx={{ color: '#ff9800' }} />;
      case 'mp4': case 'avi': return <VideoFile sx={{ color: '#9c27b0' }} />;
      default: return <InsertDriveFile sx={{ color: '#757575' }} />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const findItemById = (items: FileItem[], id: string): FileItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItemById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleItemClick = (item: FileItem) => {
    if (item.type === 'file') {
      setSelectedFile(item);
      setFileDialogOpen(true);
    } else {
      // Navigate into folder
      navigateToFolder(item);
    }
  };

  const navigateToFolder = (folder: FileItem) => {
    setCurrentFolder(folder);
    setCurrentPath(folder.path);
    setCurrentItems(folder.children || []);
    
    // Update breadcrumbs
    const pathParts = folder.path.split('/').filter(part => part);
    const newBreadcrumbs: BreadcrumbItem[] = [
      { id: selectedSite?.id || '', name: selectedSite?.name || '', path: '/' }
    ];
    
    let currentPath = '';
    pathParts.forEach(part => {
      currentPath += '/' + part;
      newBreadcrumbs.push({
        id: `breadcrumb-${part}`,
        name: part,
        path: currentPath
      });
    });
    
    setBreadcrumbs(newBreadcrumbs);
  };

  const handleSiteClick = (site: SharePointSite) => {
    if (site.status !== 'connected') {
      alert('This site is not connected. Please connect it first.');
      return;
    }
    
    setSelectedSite(site);
    const siteStructure = MOCK_SHAREPOINT_FILE_STRUCTURE[site.id] || [];
    const rootFolder = siteStructure[0];
    
    if (rootFolder) {
      setCurrentFolder(rootFolder);
      setCurrentPath('/');
      setCurrentItems(rootFolder.children || []);
      setBreadcrumbs([{ id: site.id, name: site.name, path: '/' }]);
      setTabValue(1); // Switch to File Browser tab
    }
  };

  const navigateToBreadcrumb = (breadcrumb: BreadcrumbItem) => {
    if (breadcrumb.path === '/') {
      // Go back to site root
      const siteStructure = MOCK_SHAREPOINT_FILE_STRUCTURE[selectedSite?.id || ''] || [];
      const rootFolder = siteStructure[0];
      if (rootFolder) {
        setCurrentFolder(rootFolder);
        setCurrentPath('/');
        setCurrentItems(rootFolder.children || []);
        setBreadcrumbs([{ id: selectedSite?.id || '', name: selectedSite?.name || '', path: '/' }]);
      }
    } else {
      // Find and navigate to the specific folder
      const folder = findFolderByPath(MOCK_SHAREPOINT_FILE_STRUCTURE[selectedSite?.id || ''] || [], breadcrumb.path);
      if (folder) {
        navigateToFolder(folder);
      }
    }
  };

  const findFolderByPath = (items: FileItem[], path: string): FileItem | null => {
    for (const item of items) {
      if (item.path === path && item.type === 'folder') {
        return item;
      }
      if (item.children) {
        const found = findFolderByPath(item.children, path);
        if (found) return found;
      }
    }
    return null;
  };

  const generateSummary = async (file: FileItem) => {
    // Simulate API call to generate summary
    const mockSummaries = [
      "This document contains important technical information about API integrations and best practices for implementation.",
      "A comprehensive guide covering system architecture, database design, and security considerations.",
      "Monthly report showing key performance indicators, user engagement metrics, and growth trends.",
      "Template document with predefined sections for project planning and resource allocation.",
      "Security audit findings with recommendations for improving system vulnerabilities."
    ];
    
    return mockSummaries[Math.floor(Math.random() * mockSummaries.length)];
  };

  const askQuestion = async (file: FileItem, question: string) => {
    // Simulate AI question answering
    const mockAnswers = [
      `Based on ${file.name}, the answer to your question "${question}" is: This relates to the key concepts outlined in the document regarding system integration and workflow optimization.`,
      `According to the content in ${file.name}, regarding "${question}": The document explains that this depends on several factors including user requirements and system constraints.`,
      `From ${file.name}, in response to "${question}": The documentation suggests following the established best practices and consulting the technical specifications.`
    ];
    
    return mockAnswers[Math.floor(Math.random() * mockAnswers.length)];
  };

  const startSync = async () => {
    setSyncStatus({
      status: 'syncing',
      message: 'Connecting to SharePoint...',
      progress: 10,
      syncedFiles: 0,
      totalFiles: 200
    });

    // Simulate sync progress
    const progressSteps = [
      { progress: 25, message: 'Scanning for new documents...' },
      { progress: 50, message: 'Processing document metadata...' },
      { progress: 75, message: 'Updating AI embeddings...' },
      { progress: 90, message: 'Finalizing sync...' },
      { progress: 100, message: 'Sync completed successfully!' }
    ];

    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSyncStatus(prev => ({
        ...prev,
        progress: step.progress,
        message: step.message,
        syncedFiles: Math.floor((step.progress / 100) * 200)
      }));
    }

    setSyncStatus({
      status: 'completed',
      message: 'All documents synced successfully',
      progress: 100,
      syncedFiles: 200,
      totalFiles: 200,
      lastSyncTime: new Date().toISOString()
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getSeverity = (status: SyncStatus['status']) => {
    switch (status) {
      case 'completed': return 'success';
      case 'error': return 'error';
      case 'syncing': return 'info';
      case 'paused': return 'warning';
      default: return 'info';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle color="success" />;
      case 'disconnected': return <Error color="error" />;
      case 'syncing': return <Sync color="primary" />;
      default: return <Info />;
    }
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'synced': return <CheckCircle color="success" fontSize="small" />;
      case 'pending': return <Schedule color="warning" fontSize="small" />;
      case 'error': return <Error color="error" fontSize="small" />;
      default: return <Info fontSize="small" />;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
            SharePoint Integration
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sync and manage your SharePoint documents with AI-powered search
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAddSiteDialog(true)}
          sx={{ height: 'fit-content' }}
        >
          Add Site
        </Button>
      </Box>

      {/* Sync Status Card */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                <CloudSync sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Sync Status
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {syncStatus.message}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {syncStatus.syncedFiles}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Documents Synced
              </Typography>
            </Box>
          </Box>

          {syncStatus.status === 'syncing' && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={syncStatus.progress} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'white'
                  }
                }}
              />
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                {syncStatus.progress}% ({syncStatus.syncedFiles}/{syncStatus.totalFiles} files)
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={syncStatus.status === 'syncing' ? <Refresh /> : <CloudSync />}
              onClick={startSync}
              disabled={syncStatus.status === 'syncing'}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              {syncStatus.status === 'syncing' ? 'Syncing...' : 'Start Sync'}
            </Button>
            {syncStatus.lastSyncTime && (
              <Typography variant="body2" sx={{ alignSelf: 'center', opacity: 0.9 }}>
                Last sync: {formatDateTime(syncStatus.lastSyncTime)}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ px: 2 }}>
          <Tab label="SharePoint Sites" />
          <Tab label="File Browser" />
          <Tab label="Synced Documents" />
          <Tab label="Sync Settings" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      {/* SharePoint Sites Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: "grid", gap: 3 }}>
          {sites.map((site) => (
            <Box key={site.id}>
              <Card sx={{ 
                height: '100%',
                transition: 'all 0.3s ease',
                cursor: site.status === 'connected' ? 'pointer' : 'default',
                '&:hover': {
                  transform: site.status === 'connected' ? 'translateY(-4px)' : 'none',
                  boxShadow: site.status === 'connected' ? '0 8px 25px rgba(0,0,0,0.15)' : 'initial',
                }
              }}
              onClick={() => handleSiteClick(site)}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {getStatusIcon(site.status)}
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {site.name}
                        </Typography>
                        <Chip 
                          label={site.status} 
                          size="small"
                          color={site.status === 'connected' ? 'success' : site.status === 'syncing' ? 'primary' : 'error'}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </Box>
                    </Box>
                    <IconButton size="small">
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, wordBreak: 'break-all' }}>
                    {site.url}
                  </Typography>

                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: 2, 
                    mb: 2 
                  }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Documents
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {site.documentCount.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Size
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {site.totalSize}
                      </Typography>
                    </Box>
                  </Box>

                  {site.lastSync && (
                    <Typography variant="caption" color="text.secondary">
                      Last synced: {formatDateTime(site.lastSync)}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<FolderOpen />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSiteClick(site);
                    }}
                    disabled={site.status !== 'connected'}
                  >
                    Browse Files
                  </Button>
                  <Button size="small" startIcon={<Sync />}>
                    Sync Now
                  </Button>
                  <Button size="small" startIcon={<Settings />}>
                    Settings
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      </TabPanel>

      {/* File Browser Tab - Enhanced */}
      <TabPanel value={tabValue} index={1}>
        {!selectedSite ? (
          <Card sx={{ textAlign: 'center', py: 8 }}>
            <CardContent>
              <FolderOpen sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" gutterBottom color="text.secondary">
                Select a SharePoint Site
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Choose a SharePoint site from the Sites tab to browse its folder structure
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => setTabValue(0)}
                startIcon={<ChevronRight />}
              >
                Go to Sites
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Box>
            {/* Breadcrumb Navigation */}
            <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ mr: 2, color: 'text.secondary' }}>
                    Browsing:
                  </Typography>
                  <Chip 
                    label={selectedSite.name} 
                    color="primary" 
                    variant="outlined"
                    size="small"
                  />
                </Box>
                <Breadcrumbs 
                  separator={<ChevronRightIcon fontSize="small" />} 
                  sx={{ fontSize: '0.875rem' }}
                >
                  {breadcrumbs.map((crumb, index) => (
                    <Box 
                      key={crumb.id}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        cursor: index < breadcrumbs.length - 1 ? 'pointer' : 'default',
                        color: index < breadcrumbs.length - 1 ? 'primary.main' : 'text.primary',
                        '&:hover': index < breadcrumbs.length - 1 ? { textDecoration: 'underline' } : {}
                      }}
                      onClick={() => {
                        if (index < breadcrumbs.length - 1) {
                          navigateToBreadcrumb(crumb);
                        }
                      }}
                    >
                      {index === 0 && <Home sx={{ mr: 0.5, fontSize: 16 }} />}
                      <Typography variant="body2" sx={{ fontWeight: index === breadcrumbs.length - 1 ? 600 : 400 }}>
                        {crumb.name}
                      </Typography>
                    </Box>
                  ))}
                </Breadcrumbs>
              </CardContent>
            </Card>

            {/* File/Folder List */}
            <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: 0 }}>
                {currentItems.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      This folder is empty
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      No files or folders found in this location
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {currentItems.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ListItem disablePadding>
                      {item.type === 'file' ? (
                        <ListItemButton 
                          onClick={() => handleItemClick(item)}
                          sx={{ py: 2, display: 'flex', alignItems: 'flex-start' }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            {getFileIcon(item.fileType || '')}
                          </ListItemIcon>
                          
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 500, flex: 1 }}>
                                  {item.name}
                                </Typography>
                                {item.processed && (
                                  <Chip 
                                    label="AI Ready" 
                                    size="small" 
                                    color="success"
                                    sx={{ fontSize: '0.75rem' }}
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box sx={{ mt: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Modified: {new Date(item.modified).toLocaleString()}
                                </Typography>
                                {item.size && (
                                  <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                                    Size: {formatFileSize(item.size)}
                                  </Typography>
                                )}
                                {item.summary && (
                                  <Typography variant="caption" display="block" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                                    {item.summary.substring(0, 100)}...
                                  </Typography>
                                )}
                              </Box>
                            }
                          />

                          <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                            {item.processed && (
                              <>
                                <Tooltip title="Generate Summary">
                                  <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleItemClick(item);
                                    }}
                                  >
                                    <Summarize fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Ask Questions">
                                  <IconButton 
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleItemClick(item);
                                    }}
                                  >
                                    <QuestionAnswer fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            <Tooltip title="Download">
                              <IconButton size="small">
                                <Download fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </ListItemButton>
                      ) : (
                        <ListItemButton 
                          onClick={() => handleItemClick(item)}
                          sx={{ py: 2, display: 'flex', alignItems: 'flex-start' }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <FolderOpen sx={{ color: '#ff9800', fontSize: 28 }} />
                          </ListItemIcon>
                          
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 500, flex: 1 }}>
                                  {item.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {item.children?.length || 0} items
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                Modified: {new Date(item.modified).toLocaleString()}
                              </Typography>
                            }
                          />
                          <ChevronRight sx={{ color: 'text.secondary' }} />
                        </ListItemButton>
                      )}
                    </ListItem>
                      {index < currentItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Box>
        )}
      </TabPanel>

      {/* Synced Documents Tab */}
      <TabPanel value={tabValue} index={2}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Document</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Last Modified</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        <InsertDriveFile sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {doc.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {doc.localPath}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={doc.type.toUpperCase()} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{doc.size}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDateTime(doc.lastModified)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getSyncStatusIcon(doc.syncStatus)}
                      <Chip 
                        label={doc.syncStatus}
                        size="small"
                        color={doc.syncStatus === 'synced' ? 'success' : doc.syncStatus === 'pending' ? 'warning' : 'error'}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View in SharePoint">
                        <IconButton size="small" onClick={() => window.open(doc.sharepointUrl, '_blank')}>
                          <Link fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download">
                        <IconButton size="small">
                          <Download fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Re-sync">
                        <IconButton size="small">
                          <Refresh fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Sync Settings Tab */}
      <TabPanel value={tabValue} index={3}>
        <Box sx={{ display: "grid", gap: 3 }}>
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Sync Preferences
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><Schedule /></ListItemIcon>
                    <ListItemText 
                      primary="Auto Sync Interval"
                      secondary="Sync every 30 minutes"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Storage /></ListItemIcon>
                    <ListItemText 
                      primary="Max File Size"
                      secondary="100 MB per file"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Security /></ListItemIcon>
                    <ListItemText 
                      primary="Encryption"
                      secondary="AES-256 enabled"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Integration Status
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Microsoft Graph API"
                      secondary="Connected and authenticated"
                    />
                    <Chip label="Active" color="success" size="small" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Azure AD Authentication"
                      secondary="SSO enabled for your organization"
                    />
                    <Chip label="Enabled" color="success" size="small" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Speed color="info" /></ListItemIcon>
                    <ListItemText 
                      primary="AI Processing"
                      secondary="Vector embeddings and search ready"
                    />
                    <Chip label="Ready" color="info" size="small" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      {/* Add Site Dialog */}
      <Dialog open={addSiteDialog} onClose={() => setAddSiteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Connect SharePoint Site
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter the SharePoint site URL to connect and start syncing documents.
          </Typography>
          <TextField
            fullWidth
            label="SharePoint Site URL"
            value={newSiteUrl}
            onChange={(e) => setNewSiteUrl(e.target.value)}
            placeholder="https://company.sharepoint.com/sites/your-site"
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Alert severity="info" sx={{ mb: 2 }}>
            Make sure you have the necessary permissions to access this SharePoint site.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setAddSiteDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={() => {
              setAddSiteDialog(false);
              setNewSiteUrl('');
            }} 
            variant="contained"
            disabled={!newSiteUrl.trim()}
          >
            Connect Site
          </Button>
        </DialogActions>
      </Dialog>

      {/* File AI Interaction Dialog */}
      <Dialog 
        open={fileDialogOpen} 
        onClose={() => setFileDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {selectedFile && getFileIcon(selectedFile.fileType || '')}
            <Box>
              <Typography variant="h6" component="div">
                {selectedFile?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                AI-Powered Document Analysis
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pb: 1 }}>
          {selectedFile && (
            <Box sx={{ display: 'grid', gap: 3 }}>
              {/* File Information */}
              <Card variant="outlined">
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>File Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 1 }}>
                    <Typography variant="body2">
                      <strong>Size:</strong> {selectedFile.size ? formatFileSize(selectedFile.size) : 'Unknown'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Modified:</strong> {new Date(selectedFile.modified).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Type:</strong> {selectedFile.fileType?.toUpperCase()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Status:</strong> 
                      <Chip 
                        label={selectedFile.processed ? "AI Ready" : "Processing"} 
                        size="small" 
                        color={selectedFile.processed ? "success" : "warning"}
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Document Summary */}
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Summarize color="primary" />
                    <Typography variant="subtitle2">AI Summary</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ lineHeight: 1.6, color: 'text.secondary' }}>
                    {selectedFile.summary || 'No summary available. Click "Generate Summary" to create one.'}
                  </Typography>
                  <Button 
                    startIcon={<SmartToy />}
                    variant="outlined" 
                    size="small" 
                    sx={{ mt: 2 }}
                    onClick={async () => {
                      const summary = await generateSummary(selectedFile);
                      // Update the current items and selected file with the new summary
                      setCurrentItems(prev => prev.map(item => 
                        item.id === selectedFile.id ? { ...item, summary } : item
                      ));
                      setSelectedFile(prev => prev ? { ...prev, summary } : null);
                    }}
                  >
                    Generate Summary
                  </Button>
                </CardContent>
              </Card>

              {/* AI Questions */}
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <QuestionAnswer color="primary" />
                    <Typography variant="subtitle2">Ask Questions</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Ask specific questions about this document and get AI-powered answers.
                  </Typography>
                  
                  {/* Sample Questions */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {[
                      "What are the main topics?",
                      "Key technical requirements?",
                      "Important dates mentioned?",
                      "Action items listed?"
                    ].map((question) => (
                      <Chip
                        key={question}
                        label={question}
                        variant="outlined"
                        size="small"
                        onClick={async () => {
                          const answer = await askQuestion(selectedFile, question);
                          // Here you could show the answer in a dialog or expand the card
                          alert(`Q: ${question}\n\nA: ${answer}`);
                        }}
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>

                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Ask your own question..."
                    variant="outlined"
                    onKeyPress={async (e) => {
                      if (e.key === 'Enter') {
                        const question = (e.target as HTMLInputElement).value;
                        if (question.trim()) {
                          const answer = await askQuestion(selectedFile, question);
                          alert(`Q: ${question}\n\nA: ${answer}`);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  startIcon={<Download />} 
                  variant="outlined"
                  onClick={() => window.open(selectedFile.url, '_blank')}
                >
                  Download
                </Button>
                <Button 
                  startIcon={<Share />} 
                  variant="outlined"
                >
                  Share
                </Button>
                <Button 
                  startIcon={<Visibility />} 
                  variant="contained"
                  onClick={() => window.open(selectedFile.url, '_blank')}
                >
                  Open in SharePoint
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setFileDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}