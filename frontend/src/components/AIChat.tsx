import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { apiService } from '../services/api';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Avatar,
  Divider,
  CircularProgress,
  Chip,
  IconButton,
  Card,
  CardContent,
  Stack,
  Fade,
  Tooltip,
  useTheme,
  alpha,
  Badge,
} from '@mui/material';
import {
  Send,
  Person,
  SmartToy,
  ContentCopy,
  ThumbUp,
  ThumbDown,
  AttachFile,
  MoreVert,
  CheckCircle,
  Schedule,
  Lightbulb,
  TrendingUp,
  Close,
} from '@mui/icons-material';

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  sources?: string[];
  tools_used?: string[];
  timestamp: string;
  confidence?: 'high' | 'medium' | 'low';
  isLoading?: boolean;
  messageType?: 'question' | 'summary' | 'analysis';
}

const QUICK_ACTIONS = [
  { icon: <Schedule />, label: "My Tasks", query: "What assignments do I have?" },
  { icon: <TrendingUp />, label: "Progress", query: "Show my team's progress" },
  { icon: <Lightbulb />, label: "Insights", query: "Give me project insights" },
  { icon: <CheckCircle />, label: "Recent Work", query: "Show me recent documents" },
];

const SUGGESTED_PROMPTS = [
  "What assignments do I have due this week?",
  "Search for API documentation",
  "Show me recent uploads",
  "What's blocking our project?",
  "Summarize today's activities",
  "Find security-related documents"
];


export default function AIChat() {
  const theme = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const sendMessage = async (messageText?: string) => {
    const messageToSend = messageText || input;
    if (!messageToSend.trim() || loading) return;

    setShowQuickActions(false);

    const tempMessage: ChatMessage = {
      id: Date.now().toString(),
      message: messageToSend,
      response: '',
      timestamp: new Date().toISOString(),
      isLoading: true
    };

    setMessages(prev => [...prev, tempMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await apiService.sendChatMessage({
        message: messageToSend
      });
      
      const newMessage: ChatMessage = {
        id: tempMessage.id,
        message: messageToSend,
        response: response.response,
        tools_used: response.tools_used || [],
        confidence: response.confidence || 'medium',
        messageType: response.message_type || 'question',
        timestamp: new Date().toISOString(),
        isLoading: false
      };

      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id ? newMessage : msg
      ));
    } catch (error) {
      console.error('Error sending chat message:', error);
      
      // Show error message to user
      const errorMessage: ChatMessage = {
        id: tempMessage.id,
        message: messageToSend,
        response: "I'm sorry, I'm having trouble connecting to the server right now. Please try again in a moment.",
        tools_used: ["error_handler"],
        confidence: 'low',
        messageType: 'question',
        timestamp: new Date().toISOString(),
        isLoading: false
      };

      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id ? errorMessage : msg
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const msgTime = new Date(timestamp);
    const diffMs = now.getTime() - msgTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    return msgTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getMessageTypeIcon = (type?: string) => {
    switch (type) {
      case 'summary': return '📊';
      case 'analysis': return '🔍';
      case 'question': return '💭';
      default: return '🤖';
    }
  };

  return (
    <Box 
      sx={{ 
        height: 'calc(100vh - 80px)', 
        display: 'flex', 
        flexDirection: 'column',
        maxWidth: 1200,
        mx: 'auto',
        p: { xs: 1, sm: 1.5 }
      }}
    >
      {/* Compact Header */}
      <Paper 
        elevation={0}
        sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          mb: 1,
          borderRadius: 2
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar 
              sx={{ 
                bgcolor: alpha(theme.palette.common.white, 0.2), 
                width: 36, 
                height: 36
              }}
            >
              <SmartToy sx={{ fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0, lineHeight: 1.2 }}>
                AI Assistant
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                Ready to help
              </Typography>
            </Box>
          </Box>
          <Chip 
            label="Online" 
            size="small" 
            sx={{ 
              bgcolor: alpha(theme.palette.success.main, 0.8), 
              color: 'white',
              fontSize: '0.7rem',
              height: 20
            }} 
          />
        </Box>
      </Paper>

      {/* Messages Container */}
      <Card 
        elevation={1}
        sx={{ 
          flex: 1, 
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: alpha(theme.palette.background.paper, 0.7),
          backdropFilter: 'blur(10px)'
        }}
      >
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {messages.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'flex-start',
              height: '100%',
              textAlign: 'center',
              py: 3,
              px: 2
            }}>
              {/* Welcome State */}
              <Avatar 
                sx={{ 
                  width: 48, 
                  height: 48, 
                  mb: 1.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main
                }}
              >
                <SmartToy sx={{ fontSize: 24 }} />
              </Avatar>
              
              <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 600, color: 'text.primary' }}>
                How can I help you today?
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', maxWidth: 500, lineHeight: 1.5 }}>
                I can assist with assignments, document search, project insights, and workflow optimization.
              </Typography>

              {/* Quick Actions */}
              {showQuickActions && (
                <Fade in timeout={800}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', fontWeight: 600 }}>
                      Quick Actions
                    </Typography>
                    <Box
                      sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: 1.5,
                        mb: 3,
                        maxWidth: 500,
                        width: '100%'
                      }}
                    >
                      {QUICK_ACTIONS.map((action, index) => (
                        <Card
                          key={index}
                          sx={{
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.05)
                            }
                          }}
                          onClick={() => sendMessage(action.query)}
                        >
                          <CardContent sx={{ textAlign: 'center', py: 1, px: 0.5, '&:last-child': { pb: 1 } }}>
                            <Avatar sx={{ 
                              mx: 'auto', 
                              mb: 0.5, 
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              width: 28,
                              height: 28
                            }}>
                              {React.cloneElement(action.icon, { sx: { fontSize: 16 } })}
                            </Avatar>
                            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', lineHeight: 1.2 }}>
                              {action.label}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>

                    <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary', fontWeight: 600 }}>
                      Or try asking
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.8, maxWidth: 600 }}>
                      {SUGGESTED_PROMPTS.slice(0, 4).map((suggestion, index) => (
                        <Chip
                          key={index}
                          label={suggestion}
                          variant="outlined"
                          size="small"
                          onClick={() => sendMessage(suggestion)}
                          sx={{ 
                            borderRadius: 4,
                            fontSize: '0.7rem',
                            height: 28,
                            '&:hover': { 
                              bgcolor: theme.palette.primary.main,
                              color: 'white',
                              borderColor: theme.palette.primary.main,
                              transform: 'translateY(-1px)',
                              boxShadow: 1
                            },
                            transition: 'all 0.2s ease'
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Fade>
              )}
            </Box>
          ) : (
            <Box>
              {messages.map((msg, index) => (
                <Fade in key={msg.id} timeout={500}>
                  <Box sx={{ mb: 3 }}>
                    {/* User Message */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', maxWidth: '75%' }}>
                        <Card sx={{ 
                          bgcolor: theme.palette.primary.main,
                          color: 'white',
                          mr: 1.5,
                          borderRadius: '20px 20px 4px 20px',
                          maxWidth: '100%'
                        }}>
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Typography sx={{ wordBreak: 'break-word', fontWeight: 500 }}>
                              {msg.message}
                            </Typography>
                          </CardContent>
                        </Card>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 36, height: 36 }}>
                          <Person sx={{ fontSize: 20 }} />
                        </Avatar>
                      </Box>
                    </Box>

                    {/* AI Response */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', maxWidth: '85%' }}>
                        <Avatar sx={{ 
                          bgcolor: theme.palette.secondary.main, 
                          mr: 1.5,
                          width: 36, 
                          height: 36,
                          boxShadow: 2
                        }}>
                          <SmartToy sx={{ fontSize: 20 }} />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Card sx={{ 
                            bgcolor: theme.palette.background.paper,
                            borderRadius: '20px 20px 20px 4px',
                            boxShadow: 1,
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                          }}>
                            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                              {msg.isLoading ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                                  <CircularProgress size={20} />
                                  <Typography color="text.secondary">Analyzing your request...</Typography>
                                </Box>
                              ) : (
                                <>
                                  {/* Message Type Indicator */}
                                  {msg.messageType && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                      <Typography variant="body2" sx={{ 
                                        color: 'text.secondary',
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: 3,
                                        fontSize: '0.75rem',
                                        fontWeight: 600
                                      }}>
                                        {getMessageTypeIcon(msg.messageType)} {msg.messageType.toUpperCase()}
                                      </Typography>
                                    </Box>
                                  )}

                                  <ReactMarkdown
                                    components={{
                                      p: ({ children }) => (
                                        <Typography paragraph sx={{ mb: 1, lineHeight: 1.6, color: 'text.primary' }}>
                                          {children}
                                        </Typography>
                                      ),
                                      strong: ({ children }) => (
                                        <Typography component="span" sx={{ fontWeight: 700 }}>
                                          {children}
                                        </Typography>
                                      ),
                                      ul: ({ children }) => (
                                        <Box component="ul" sx={{ pl: 2, mb: 1 }}>
                                          {children}
                                        </Box>
                                      ),
                                      li: ({ children }) => (
                                        <Typography component="li" sx={{ mb: 0.5, lineHeight: 1.5 }}>
                                          {children}
                                        </Typography>
                                      ),
                                      h1: ({ children }) => (
                                        <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                                          {children}
                                        </Typography>
                                      ),
                                      h2: ({ children }) => (
                                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                                          {children}
                                        </Typography>
                                      ),
                                      h3: ({ children }) => (
                                        <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: 600 }}>
                                          {children}
                                        </Typography>
                                      ),
                                      code: ({ children }) => (
                                        <Box
                                          component="code"
                                          sx={{
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            px: 0.5,
                                            py: 0.25,
                                            borderRadius: 0.5,
                                            fontSize: '0.85em',
                                            fontFamily: 'monospace'
                                          }}
                                        >
                                          {children}
                                        </Box>
                                      ),
                                      pre: ({ children }) => (
                                        <Box
                                          component="pre"
                                          sx={{
                                            bgcolor: alpha(theme.palette.background.default, 0.8),
                                            p: 1.5,
                                            borderRadius: 1,
                                            overflow: 'auto',
                                            fontSize: '0.85em',
                                            fontFamily: 'monospace',
                                            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
                                          }}
                                        >
                                          {children}
                                        </Box>
                                      )
                                    }}
                                  >
                                    {msg.response}
                                  </ReactMarkdown>
                                  
                                  {/* Action Buttons */}
                                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 2, pt: 1.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', flex: 1 }}>
                                      {formatTimestamp(msg.timestamp)}
                                    </Typography>
                                    {msg.confidence && (
                                      <Chip 
                                        label={msg.confidence}
                                        size="small"
                                        color={msg.confidence === 'high' ? 'success' : 'default'}
                                        sx={{ fontSize: '0.7rem', height: 20 }}
                                      />
                                    )}
                                    <Tooltip title="Copy response">
                                      <IconButton size="small" onClick={() => copyToClipboard(msg.response)}>
                                        <ContentCopy sx={{ fontSize: 16 }} />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Helpful">
                                      <IconButton size="small" color="success">
                                        <ThumbUp sx={{ fontSize: 16 }} />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Not helpful">
                                      <IconButton size="small">
                                        <ThumbDown sx={{ fontSize: 16 }} />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>

                                  {/* Tools Used */}
                                  {msg.tools_used && msg.tools_used.length > 0 && (
                                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                                      <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                                        Tools used:
                                      </Typography>
                                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                        {msg.tools_used.map((tool, idx) => (
                                          <Chip 
                                            key={idx} 
                                            label={tool} 
                                            size="small" 
                                            variant="outlined"
                                            sx={{ fontSize: '0.7rem', height: 20 }}
                                          />
                                        ))}
                                      </Stack>
                                    </Box>
                                  )}
                                </>
                              )}
                            </CardContent>
                          </Card>
                        </Box>
                      </Box>
                    </Box>
                    
                    {index < messages.length - 1 && (
                      <Divider sx={{ mt: 3, opacity: 0.3 }} />
                    )}
                  </Box>
                </Fade>
              ))}
              <div ref={messagesEndRef} />
            </Box>
          )}
        </Box>

        {/* Compact Input Area */}
        <Box sx={{ 
          p: 1.5, 
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          bgcolor: theme.palette.background.paper
        }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your work..."
              disabled={loading}
              ref={inputRef}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.background.default, 0.5),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.background.default, 0.7),
                  },
                  '&.Mui-focused': {
                    bgcolor: theme.palette.background.default,
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
                  }
                },
                '& .MuiOutlinedInput-input': {
                  py: 1
                }
              }}
            />
            
            <Tooltip title="Attach file">
              <IconButton 
                size="small"
                sx={{ 
                  bgcolor: alpha(theme.palette.action.hover, 0.5),
                  '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.8) }
                }}
              >
                <AttachFile sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            
            <Button 
              variant="contained"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              size="small"
              sx={{ 
                minWidth: 40, 
                height: 40, 
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: 2
                },
                '&:disabled': {
                  background: alpha(theme.palette.action.disabled, 0.3)
                },
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Send sx={{ fontSize: 16 }} />
              )}
            </Button>
          </Box>
          
          {loading && (
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block', textAlign: 'center' }}>
              AI is thinking...
            </Typography>
          )}
        </Box>
      </Card>
    </Box>
  );
}