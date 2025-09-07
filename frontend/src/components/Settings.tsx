import * as React from 'react';
import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Alert,
  Paper,
  Tabs,
  Tab,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  InputAdornment,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Person,
  Notifications,
  Security,
  Storage,
  Palette,
  Language,
  Schedule,
  CloudSync,
  SmartToy,
  Edit,
  Save,
  Cancel,
  Delete,
  Add,
  Info,
  Warning,
  CheckCircle,
  Email,
  Phone,
  Business,
  LocationOn,
  School,
  Work,
  LightMode,
  DarkMode,
  Contrast,
  VolumeUp,
  Download,
  Upload,
  Key,
  Shield,
  Lock,
  Visibility,
  VisibilityOff,
  Refresh
} from '@mui/icons-material';

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  title: string;
  department: string;
  location: string;
  phone: string;
  joinDate: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  assignmentReminders: boolean;
  documentUpdates: boolean;
  weeklyReports: boolean;
  securityAlerts: boolean;
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  showAvatars: boolean;
  animations: boolean;
}

interface PrivacySettings {
  dataSharing: boolean;
  analytics: boolean;
  activityTracking: boolean;
  profileVisibility: 'public' | 'team' | 'private';
}

export default function Settings() {
  const [tabValue, setTabValue] = useState(0);
  const [editProfile, setEditProfile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'user-1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    avatar: '/avatar.jpg',
    title: 'Senior Software Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    phone: '+1 (555) 123-4567',
    joinDate: '2023-01-15'
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    assignmentReminders: true,
    documentUpdates: false,
    weeklyReports: true,
    securityAlerts: true
  });

  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: 'light',
    primaryColor: '#667eea',
    fontSize: 'medium',
    compactMode: false,
    showAvatars: true,
    animations: true
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    dataSharing: false,
    analytics: true,
    activityTracking: true,
    profileVisibility: 'team'
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleAppearanceChange = (key: keyof AppearanceSettings, value: any) => {
    setAppearance(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePrivacyChange = (key: keyof PrivacySettings) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account preferences and application settings
        </Typography>
      </Box>

      {/* Settings Navigation */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2 }}
        >
          <Tab icon={<Person />} label="Profile" />
          <Tab icon={<Notifications />} label="Notifications" />
          <Tab icon={<Palette />} label="Appearance" />
          <Tab icon={<Security />} label="Security" />
          <Tab icon={<Shield />} label="Privacy" />
          <Tab icon={<CloudSync />} label="Integrations" />
        </Tabs>
      </Paper>

      {/* Profile Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: "grid", gap: 4 }}>
          <Box>
            <Card>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Avatar
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mx: 'auto', 
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: 48
                  }}
                >
                  {userProfile.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  {userProfile.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {userProfile.title}
                </Typography>
                <Chip 
                  label={userProfile.department} 
                  color="primary" 
                  variant="outlined"
                  sx={{ mb: 3 }}
                />
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => setEditProfile(true)}
                  fullWidth
                >
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Personal Information
                </Typography>
                
                <Box sx={{ display: "grid", gap: 3 }}>
                  <Box>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={userProfile.name}
                      disabled={!editProfile}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                  
                  <Box>
                    <TextField
                      fullWidth
                      label="Email Address"
                      value={userProfile.email}
                      disabled={!editProfile}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <Box>
                    <TextField
                      fullWidth
                      label="Job Title"
                      value={userProfile.title}
                      disabled={!editProfile}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Work color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <Box>
                    <TextField
                      fullWidth
                      label="Department"
                      value={userProfile.department}
                      disabled={!editProfile}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Business color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <Box>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={userProfile.phone}
                      disabled={!editProfile}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <Box>
                    <TextField
                      fullWidth
                      label="Location"
                      value={userProfile.location}
                      disabled={!editProfile}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOn color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                </Box>

                {editProfile && (
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={() => setEditProfile(false)}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={() => setEditProfile(false)}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      {/* Notifications Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: "grid", gap: 3 }}>
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Email Notifications
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><Email /></ListItemIcon>
                    <ListItemText 
                      primary="Email Notifications"
                      secondary="Receive notifications via email"
                    />
                    <Switch
                      checked={notifications.emailNotifications}
                      onChange={() => handleNotificationChange('emailNotifications')}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon><Schedule /></ListItemIcon>
                    <ListItemText 
                      primary="Assignment Reminders"
                      secondary="Get reminded about upcoming deadlines"
                    />
                    <Switch
                      checked={notifications.assignmentReminders}
                      onChange={() => handleNotificationChange('assignmentReminders')}
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon><Storage /></ListItemIcon>
                    <ListItemText 
                      primary="Document Updates"
                      secondary="Notifications when documents are modified"
                    />
                    <Switch
                      checked={notifications.documentUpdates}
                      onChange={() => handleNotificationChange('documentUpdates')}
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon><Download /></ListItemIcon>
                    <ListItemText 
                      primary="Weekly Reports"
                      secondary="Receive weekly activity summaries"
                    />
                    <Switch
                      checked={notifications.weeklyReports}
                      onChange={() => handleNotificationChange('weeklyReports')}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Push Notifications
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><Notifications /></ListItemIcon>
                    <ListItemText 
                      primary="Browser Notifications"
                      secondary="Show desktop notifications"
                    />
                    <Switch
                      checked={notifications.pushNotifications}
                      onChange={() => handleNotificationChange('pushNotifications')}
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon><Security /></ListItemIcon>
                    <ListItemText 
                      primary="Security Alerts"
                      secondary="Important security-related notifications"
                    />
                    <Switch
                      checked={notifications.securityAlerts}
                      onChange={() => handleNotificationChange('securityAlerts')}
                      color="error"
                    />
                  </ListItem>
                </List>

                <Alert severity="info" sx={{ mt: 2 }}>
                  Security alerts cannot be disabled for your safety.
                </Alert>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      {/* Appearance Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: "grid", gap: 3 }}>
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Theme Settings
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Theme Mode</InputLabel>
                  <Select
                    value={appearance.theme}
                    label="Theme Mode"
                    onChange={(e) => handleAppearanceChange('theme', e.target.value)}
                  >
                    <MenuItem value="light">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LightMode fontSize="small" />
                        Light Mode
                      </Box>
                    </MenuItem>
                    <MenuItem value="dark">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DarkMode fontSize="small" />
                        Dark Mode
                      </Box>
                    </MenuItem>
                    <MenuItem value="auto">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Contrast fontSize="small" />
                        Auto (System)
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Font Size</InputLabel>
                  <Select
                    value={appearance.fontSize}
                    label="Font Size"
                    onChange={(e) => handleAppearanceChange('fontSize', e.target.value)}
                  >
                    <MenuItem value="small">Small</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="large">Large</MenuItem>
                  </Select>
                </FormControl>

                <Typography gutterBottom sx={{ fontWeight: 500 }}>
                  Primary Color
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                  {['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'].map((color) => (
                    <Box
                      key={color}
                      onClick={() => handleAppearanceChange('primaryColor', color)}
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: color,
                        borderRadius: 1,
                        cursor: 'pointer',
                        border: appearance.primaryColor === color ? '3px solid #000' : '1px solid #ddd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {appearance.primaryColor === color && <CheckCircle sx={{ color: 'white', fontSize: 20 }} />}
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Display Preferences
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemIcon><Contrast /></ListItemIcon>
                    <ListItemText 
                      primary="Compact Mode"
                      secondary="Reduce spacing for more content"
                    />
                    <Switch
                      checked={appearance.compactMode}
                      onChange={() => handleAppearanceChange('compactMode', !appearance.compactMode)}
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon><Person /></ListItemIcon>
                    <ListItemText 
                      primary="Show Avatars"
                      secondary="Display user avatars in lists"
                    />
                    <Switch
                      checked={appearance.showAvatars}
                      onChange={() => handleAppearanceChange('showAvatars', !appearance.showAvatars)}
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon><VolumeUp /></ListItemIcon>
                    <ListItemText 
                      primary="Animations"
                      secondary="Enable smooth transitions and effects"
                    />
                    <Switch
                      checked={appearance.animations}
                      onChange={() => handleAppearanceChange('animations', !appearance.animations)}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      {/* Security Tab */}
      <TabPanel value={tabValue} index={3}>
        <Box sx={{ display: "grid", gap: 3 }}>
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Password & Authentication
                </Typography>
                
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  label="Current Password"
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  type="password"
                  label="New Password"
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Key color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  type="password"
                  label="Confirm New Password"
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Key color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button variant="contained" sx={{ mb: 3 }}>
                  Change Password
                </Button>

                <Alert severity="info">
                  Your password should be at least 8 characters long and include a mix of letters, numbers, and symbols.
                </Alert>
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Security Features
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Two-Factor Authentication"
                      secondary="Enabled with Microsoft Authenticator"
                    />
                    <Chip label="Active" color="success" size="small" />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Single Sign-On (SSO)"
                      secondary="Azure AD integration enabled"
                    />
                    <Chip label="Connected" color="success" size="small" />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon><Security /></ListItemIcon>
                    <ListItemText 
                      primary="Session Management"
                      secondary="Automatic logout after 8 hours of inactivity"
                    />
                    <Chip label="Configured" color="info" size="small" />
                  </ListItem>
                </List>

                <Typography variant="subtitle2" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
                  Recent Security Activity
                </Typography>

                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Login from Chrome on Windows"
                      secondary="Today at 9:30 AM from San Francisco, CA"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Password changed successfully"
                      secondary="3 days ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="New device authorized"
                      secondary="1 week ago - iPhone 15 Pro"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      {/* Privacy Tab */}
      <TabPanel value={tabValue} index={4}>
        <Box sx={{ display: "grid", gap: 3 }}>
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Privacy Controls
                </Typography>
                
                <Box sx={{ display: "grid", gap: 3 }}>
                  <Box>
                    <List>
                      <ListItem>
                        <ListItemIcon><Shield /></ListItemIcon>
                        <ListItemText 
                          primary="Data Sharing"
                          secondary="Share anonymized usage data to improve the service"
                        />
                        <Switch
                          checked={privacy.dataSharing}
                          onChange={() => handlePrivacyChange('dataSharing')}
                        />
                      </ListItem>

                      <ListItem>
                        <ListItemIcon><Info /></ListItemIcon>
                        <ListItemText 
                          primary="Analytics"
                          secondary="Help us improve by sharing anonymous usage statistics"
                        />
                        <Switch
                          checked={privacy.analytics}
                          onChange={() => handlePrivacyChange('analytics')}
                        />
                      </ListItem>

                      <ListItem>
                        <ListItemIcon><Schedule /></ListItemIcon>
                        <ListItemText 
                          primary="Activity Tracking"
                          secondary="Track your activity for productivity insights"
                        />
                        <Switch
                          checked={privacy.activityTracking}
                          onChange={() => handlePrivacyChange('activityTracking')}
                        />
                      </ListItem>
                    </List>
                  </Box>

                  <Box>
                    <Box sx={{ p: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                        Profile Visibility
                      </Typography>
                      <FormControl fullWidth>
                        <Select
                          value={privacy.profileVisibility}
                          onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value as any }))}
                        >
                          <MenuItem value="public">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Visibility fontSize="small" />
                              Public - Visible to everyone
                            </Box>
                          </MenuItem>
                          <MenuItem value="team">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Business fontSize="small" />
                              Team - Visible to team members only
                            </Box>
                          </MenuItem>
                          <MenuItem value="private">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Lock fontSize="small" />
                              Private - Only visible to you
                            </Box>
                          </MenuItem>
                        </Select>
                      </FormControl>

                      <Alert severity="info" sx={{ mt: 3 }}>
                        Your email address and sensitive personal information are always kept private regardless of this setting.
                      </Alert>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      {/* Integrations Tab */}
      <TabPanel value={tabValue} index={5}>
        <Box sx={{ display: "grid", gap: 3 }}>
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Connected Services
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: '#0078d4', width: 32, height: 32 }}>
                        <CloudSync fontSize="small" />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary="Microsoft SharePoint"
                      secondary="Full access to your organization's SharePoint sites"
                    />
                    <Chip label="Connected" color="success" size="small" />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: '#00a1f1', width: 32, height: 32 }}>
                        <Email fontSize="small" />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary="Microsoft Outlook"
                      secondary="Send notifications and calendar reminders"
                    />
                    <Chip label="Connected" color="success" size="small" />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: '#6264a7', width: 32, height: 32 }}>
                        <SmartToy fontSize="small" />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary="Microsoft Teams"
                      secondary="Integration with Teams channels and chats"
                    />
                    <Button size="small" variant="outlined">Connect</Button>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  API & Webhooks
                </Typography>
                
                <Alert severity="info" sx={{ mb: 3 }}>
                  API access is available for developers to build custom integrations.
                </Alert>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    API Key
                  </Typography>
                  <TextField
                    fullWidth
                    value="sk-..." 
                    type="password"
                    disabled
                    size="small"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Regenerate API Key">
                            <IconButton size="small">
                              <Refresh fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Button variant="outlined" startIcon={<Add />} fullWidth>
                  Create Webhook
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>
    </Box>
  );
}