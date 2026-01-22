import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/userSlice';
import axiosInstance from '../api/config/axiosInstance';
import { API_ENDPOINTS } from '../api/config/apiConfig';
import { ChatInterface } from '../Components/ChatAI/ChatInterface';
import { Sidebar } from '../Components/ChatAI/Sidebar';
import { CitationModal } from '../Components/ChatAI/CitationModal';

const ChatAi1 = () => {
  const user = useSelector(selectUser);
  const [conversations, setConversations] = useState({});
  const [currentConvId, setCurrentConvId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [citationModal, setCitationModal] = useState({ isOpen: false, citations: [] });

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load conversations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chatai_conversations');
    if (saved) {
      const parsed = JSON.parse(saved);
      setConversations(parsed);
      // Set the most recent conversation as current
      const sortedIds = Object.keys(parsed).sort((a, b) =>
        new Date(parsed[b].updatedAt) - new Date(parsed[a].updatedAt)
      );
      if (sortedIds.length > 0) {
        setCurrentConvId(sortedIds[0]);
      }
    } else {
      // Create initial conversation
      handleNewChat();
    }
  }, []);

  // Save conversations to localStorage
  useEffect(() => {
    if (Object.keys(conversations).length > 0) {
      localStorage.setItem('chatai_conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newConv = {
      id: newId,
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setConversations(prev => ({ ...prev, [newId]: newConv }));
    setCurrentConvId(newId);
    if (isMobile) setSidebarOpen(false);
  };

  const handleSelectConversation = (id) => {
    setCurrentConvId(id);
    if (isMobile) setSidebarOpen(false);
  };

  const handleDeleteConversation = (id) => {
    const newConvs = { ...conversations };
    delete newConvs[id];
    setConversations(newConvs);

    if (currentConvId === id) {
      const remaining = Object.keys(newConvs);
      if (remaining.length > 0) {
        setCurrentConvId(remaining[0]);
      } else {
        handleNewChat();
      }
    }
  };

  const handleSendMessage = async (query) => {
    if (!currentConvId || !query.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };

    // Add user message to conversation
    setConversations(prev => ({
      ...prev,
      [currentConvId]: {
        ...prev[currentConvId],
        messages: [...prev[currentConvId].messages, userMessage],
        title: prev[currentConvId].messages.length === 0 ? query.substring(0, 50) : prev[currentConvId].title,
        updatedAt: new Date().toISOString()
      }
    }));

    setIsLoading(true);

    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.CHAT_QUERY,
        {
          query: query
        },
        {
          headers: {
            'x-session-id': '3543a943-8043-4dcc-8cf9-db6f3168ad12',
            'x-tenant-id': 'money_compound'
          }
        }
      );

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response || 'I apologize, but I couldn\'t generate a response.',
        meta: {
          intent: response.data.intent,
          citations: response.data.citations || [],
          is_fallback: response.data.is_fallback || false,
          active_client: response.data.active_client
        },
        timestamp: new Date().toISOString()
      };

      setConversations(prev => ({
        ...prev,
        [currentConvId]: {
          ...prev[currentConvId],
          messages: [...prev[currentConvId].messages, assistantMessage],
          updatedAt: new Date().toISOString()
        }
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        meta: {
          intent: 'error',
          citations: [],
          is_fallback: true
        },
        timestamp: new Date().toISOString()
      };

      setConversations(prev => ({
        ...prev,
        [currentConvId]: {
          ...prev[currentConvId],
          messages: [...prev[currentConvId].messages, errorMessage],
          updatedAt: new Date().toISOString()
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowCitations = (citations) => {
    setCitationModal({ isOpen: true, citations });
  };

  const currentConversation = currentConvId ? conversations[currentConvId] : null;

  return (
    <div className="h-full flex bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar
        conversations={conversations}
        currentId={currentConvId}
        onSelect={handleSelectConversation}
        onDelete={handleDeleteConversation}
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isMobile={isMobile}
      />

      <ChatInterface
        messages={currentConversation?.messages || []}
        isLoading={isLoading}
        onSend={handleSendMessage}
        activeClient={user?.email}
        onShowCitations={handleShowCitations}
      />

      <CitationModal
        isOpen={citationModal.isOpen}
        onClose={() => setCitationModal({ isOpen: false, citations: [] })}
        citations={citationModal.citations}
      />
    </div>
  );
};

export default ChatAi1;