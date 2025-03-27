import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography, ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios from 'axios';

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface EmbeddableChatProps {
  topic: string;
  apiUrl?: string;
  height?: string | number;
  width?: string | number;
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
  typography: {
    fontSize: 14,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          height: '100%',
          width: '100%',
        },
      },
    },
  },
});

const EmbeddableChat: React.FC<EmbeddableChatProps> = ({ 
  topic,
  apiUrl = 'https://chatbot.csc.edu.vn',
  height = '800px',
  width = '100%'
}) => {
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const startNewChat = async () => {
    if (!hasStarted) {
      try {
        const response = await api.post(`${apiUrl}/chatElearning`, {
          topic: topic,
          message: "Bắt đầu cuộc trò chuyện"
        }
      );
        
        setSessionId(response.data.session.id);
        const assistantMessage = {
          role: 'assistant' as const,
          content: response.data.output.output,
          timestamp: new Date().toISOString()
        };
        setMessages([assistantMessage]);
        setHasStarted(true);
      } catch (error) {
        console.error('Error starting chat:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    
    const userMessageObj = {
      role: 'user' as const,
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessageObj]);
    
    setIsLoading(true);

    try {
      const endpoint = `${apiUrl}/chatElearning`; 

      const response = await api.post(endpoint, {
        message: userMessage,
        session_id: sessionId,
        topic: topic
      });

      if (!sessionId && response.data.session.id) {
        setSessionId(response.data.session.id);
      }

      const assistantMessage = {
        role: 'assistant' as const,
        content: response.data.output.output,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Xin lỗi, có lỗi xảy ra khi xử lý tin nhắn của bạn.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          height, 
          width,
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 1,
          bgcolor: 'background.paper',
          cursor: !hasStarted ? 'pointer' : 'default'
        }}
        onClick={startNewChat}
      >
        {!hasStarted ? (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            p: 2,
            textAlign: 'center'
          }}>
            <Typography variant="h6" color="text.secondary">
              Click để bắt đầu trò chuyện về chủ đề: {topic}
            </Typography>
          </Box>
        ) : (
          <>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                borderRadius: 0,
                background: 'linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                  zIndex: 1
                }
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                  zIndex: 2
                }}
              >
                Chatbot Hỗ trợ học tập
              </Typography>
            </Paper>

            <Paper 
              elevation={0} 
              sx={{ 
                flex: 1, 
                p: 1.5, 
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                bgcolor: 'grey.50'
              }}
            >
              {messages.map((message, index) => (
                <Box
                  key={index}
                  sx={{
                    alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    backgroundColor: message.role === 'user' ? 'primary.main' : 'white',
                    color: message.role === 'user' ? 'white' : 'text.primary',
                    p: 1.5,
                    borderRadius: 2,
                    boxShadow: 1
                  }}
                >
                  {message.role === 'user' ? (
                    <Typography variant="body2">{message.content}</Typography>
                  ) : (
                    <Box sx={{ 
                      '& .markdown': { 
                        '& pre': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          padding: 1,
                          borderRadius: 1,
                          overflowX: 'auto'
                        },
                        '& code': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          padding: '2px 4px',
                          borderRadius: 1
                        },
                        '& a': {
                          color: 'primary.main'
                        }
                      }
                    }}>
                      <div className="markdown">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </Box>
                  )}
                  <Typography variant="caption" sx={{ 
                    opacity: 0.7,
                    display: 'block',
                    textAlign: message.role === 'user' ? 'right' : 'left',
                    mt: 0.5,
                    fontSize: '0.75rem'
                  }}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </Typography>
                </Box>
              ))}
              {isLoading && (
                <Box sx={{ alignSelf: 'flex-start', p: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">Đang trả lời...</Typography>
                </Box>
              )}
            </Paper>

            <Box 
              component="form" 
              onSubmit={handleSubmit} 
              sx={{ 
                display: 'flex', 
                gap: 1, 
                p: 1.5,
                borderTop: 1,
                borderColor: 'grey.200'
              }}
            >
              <TextField
                fullWidth
                size="small"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                disabled={isLoading}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
              <Button 
                type="submit" 
                variant="contained" 
                disabled={isLoading || !input.trim()}
                sx={{ borderRadius: 2, px: 3 }}
              >
                Gửi
              </Button>
            </Box>
          </>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default EmbeddableChat; 