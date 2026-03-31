import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/userSlice';
import axiosInstance from '../api/config/axiosInstance';
import { API_ENDPOINTS } from '../api/config/apiConfig';
import { ChatInterface } from '../Components/ChatAI/ChatInterface';
import { Sidebar } from '../Components/ChatAI/Sidebar';
import { CitationModal } from '../Components/ChatAI/CitationModal';
import FileManagerPanel from '../Components/ChatAI/FileManagerPanel';
import TenantAccessPanel from '../Components/ChatAI/TenantAccessPanel';
import MFDSettingsPanel from '../Components/ChatAI/MFDSettingsPanel';

const ChatAi1 = () => {
  const user = useSelector(selectUser);
  const [conversations, setConversations] = useState({});
  const [currentConvId, setCurrentConvId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [citationModal, setCitationModal] = useState({ isOpen: false, citations: [] });

  // Admin panel state
  const [fileManagerOpen, setFileManagerOpen] = useState(false);
  const [tenantAccessOpen, setTenantAccessOpen] = useState(false);
  const [mfdSettingsOpen, setMFDSettingsOpen] = useState(false);
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem('chatai_admin_key') || '');
  const [showAdminKeyPrompt, setShowAdminKeyPrompt] = useState(false);
  const [pendingPanel, setPendingPanel] = useState(null);

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
            'x-tenant-id': user?.email || 'money_compound'
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
          active_client: response.data.active_client,
          follow_ups: response.data.follow_ups || []
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

  // Admin panel open handlers
  const openAdminPanel = (panelType) => {
    if (!adminKey) {
      setPendingPanel(panelType);
      setShowAdminKeyPrompt(true);
      return;
    }
    if (panelType === 'files') setFileManagerOpen(true);
    else if (panelType === 'access') setTenantAccessOpen(true);
  };

  // Called by admin panels when they get a 401 — clears bad key and re-prompts
  const handleAdminAuthError = (panelType) => {
    setAdminKey('');
    localStorage.removeItem('chatai_admin_key');
    setFileManagerOpen(false);
    setTenantAccessOpen(false);
    setPendingPanel(panelType);
    setShowAdminKeyPrompt(true);
  };

  const handleAdminKeySubmit = () => {
    if (!adminKey.trim()) return;
    localStorage.setItem('chatai_admin_key', adminKey);
    setShowAdminKeyPrompt(false);
    if (pendingPanel === 'files') setFileManagerOpen(true);
    else if (pendingPanel === 'access') setTenantAccessOpen(true);
    setPendingPanel(null);
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
        userEmail={user?.email}
        onOpenFileManager={() => openAdminPanel('files')}
        onOpenTenantAccess={() => openAdminPanel('access')}
        onOpenMFDSettings={() => setMFDSettingsOpen(true)}
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

      <FileManagerPanel
        isOpen={fileManagerOpen}
        onClose={() => setFileManagerOpen(false)}
        adminKey={adminKey}
        onAuthError={() => handleAdminAuthError('files')}
      />

      <TenantAccessPanel
        isOpen={tenantAccessOpen}
        onClose={() => setTenantAccessOpen(false)}
        adminKey={adminKey}
        onAuthError={() => handleAdminAuthError('access')}
      />

      <MFDSettingsPanel
        isOpen={mfdSettingsOpen}
        onClose={() => setMFDSettingsOpen(false)}
        userEmail={user?.email}
      />

      {/* Admin Key Prompt Modal */}
      {showAdminKeyPrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-[#0d2626] border border-[#1a4040] shadow-2xl mx-4">
            <h3 className="text-white font-bold text-lg mb-1">Admin Key Required</h3>
            <p className="text-gray-400 text-xs mb-4">Enter your admin key to access management panels.</p>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdminKeySubmit()}
              placeholder="Admin API Key"
              autoFocus
              className="w-full px-3 py-2.5 bg-[#0a1a1a] border border-[#1a4040] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#e6ae5b] transition-colors mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setShowAdminKeyPrompt(false); setPendingPanel(null); setAdminKey(''); }}
                className="flex-1 py-2 bg-[#1a3535] border border-[#2a5050] rounded-lg text-gray-300 text-sm hover:bg-[#1f4040]"
              >
                Cancel
              </button>
              <button
                onClick={handleAdminKeySubmit}
                className="flex-1 py-2 bg-gradient-to-r from-[#e6ae5b] to-[#c4912e] text-[#0d2626] font-bold text-sm rounded-lg hover:opacity-90"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatAi1;