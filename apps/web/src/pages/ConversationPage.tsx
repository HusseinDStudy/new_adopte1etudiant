import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getMessagesForConversation, createMessageInConversation, Message, ConversationDetails } from '../services/messageService';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Lock, Archive, Clock, AlertCircle, Users, Briefcase, Building2, MessageSquare, Send } from 'lucide-react';
import SidebarLayout from '../components/layout/SidebarLayout';

const ConversationPage: React.FC = () => {
  const { t } = useTranslation();
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<ConversationDetails | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (conversationId) {
      getMessagesForConversation(conversationId)
        .then((data) => {
          const validMessages = Array.isArray(data.messages)
            ? data.messages.filter(msg => msg && msg.id && msg.sender && msg.sender.id)
            : [];
          setMessages(validMessages);
          setConversation(data.conversation);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError(t('conversationDetail.failedToLoad'));
          setLoading(false);
        });
    }
  }, [conversationId, t]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversationId || !newMessage.trim() || sending) return;

    try {
      setSending(true);
      const sentMessage = await createMessageInConversation(conversationId, newMessage);
      setMessages((prevMessages) => [...prevMessages, sentMessage]);
      setNewMessage('');
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.response?.data?.message || t('conversationDetail.failedToSend'));
    } finally {
      setSending(false);
    }
  };

  const getContextIcon = (context?: string) => {
    switch (context) {
      case 'ADOPTION_REQUEST':
        return <Users className="w-5 h-5" />;
      case 'OFFER':
        return <Briefcase className="w-5 h-5" />;
      case 'ADMIN_MESSAGE':
        return <MessageSquare className="w-5 h-5" />;
      case 'BROADCAST':
        return <Building2 className="w-5 h-5" />;
      default:
        return <MessageSquare className="w-5 h-5" />;
    }
  };

  const getStatusBadge = () => {
    if (!conversation) return null;

    if (conversation.isReadOnly) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
          <Lock className="w-4 h-4 mr-1" />
          {t('conversationDetail.status.readOnly')}
        </span>
      );
    }

    if (conversation.status === 'ARCHIVED') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
          <Archive className="w-4 h-4 mr-1" />
          {t('conversationDetail.status.archived')}
        </span>
      );
    }

    if (conversation.status === 'EXPIRED') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <Clock className="w-4 h-4 mr-1" />
          {t('conversationDetail.status.expired')}
        </span>
      );
    }

    if (conversation.status === 'PENDING_APPROVAL') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          <AlertCircle className="w-4 h-4 mr-1" />
          {t('conversationDetail.status.pendingApproval')}
        </span>
      );
    }

    return null;
  };

  const renderTargetLabel = (target?: 'ALL' | 'STUDENTS' | 'COMPANIES') => {
    if (target === 'ALL') return t('conversations.allUsers');
    if (target === 'STUDENTS') return t('conversations.studentsOnly');
    if (target === 'COMPANIES') return t('conversations.companiesOnly');
    return t('conversations.users');
  };

  const getContextInfo = () => {
    if (!conversation?.contextDetails) return null;

    const { contextDetails } = conversation;
    
    switch (contextDetails.type) {
      case 'adoption_request':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              {t('conversationDetail.context.adoptionRequest')} - {contextDetails.companyName}
            </h3>
            <p className="text-blue-700 text-sm mb-2">
              {t('conversationDetail.context.status')}: {contextDetails.status === 'PENDING' ? t('conversationDetail.context.pendingResponse') : 
                       contextDetails.status === 'ACCEPTED' ? t('conversationDetail.context.accepted') : 
                       contextDetails.status === 'REJECTED' ? t('conversationDetail.context.rejected') : contextDetails.status}
            </p>
            {contextDetails.initialMessage && (
              <div className="text-blue-600 text-sm">
                <strong>{t('conversationDetail.context.initialMessage')}:</strong> {contextDetails.initialMessage}
              </div>
            )}
          </div>
        );
      case 'offer':
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-green-900 mb-2">
              {t('conversationDetail.context.application')} - {contextDetails.offerTitle}
            </h3>
            <p className="text-green-700 text-sm mb-2">
              {t('conversationDetail.context.company')}: {contextDetails.companyName}
            </p>
            <p className="text-green-700 text-sm">
              {t('conversationDetail.context.status')}: {contextDetails.status === 'NEW' ? t('conversationDetail.context.new') : 
                       contextDetails.status === 'SEEN' ? t('conversationDetail.context.seen') : 
                       contextDetails.status === 'INTERVIEW' ? t('conversationDetail.context.interview') : 
                       contextDetails.status === 'REJECTED' ? t('conversationDetail.context.rejected') : 
                       contextDetails.status === 'HIRED' ? t('conversationDetail.context.hired') : contextDetails.status}
            </p>
          </div>
        );
      case 'broadcast':
        return (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-orange-900 mb-2">
              {t('conversationDetail.context.broadcast')}
            </h3>
            <p className="text-orange-700 text-sm">
              {t('conversationDetail.context.targetedTo')}: {contextDetails.target === 'ALL' ? t('conversationDetail.context.allUsers') : 
                          contextDetails.target === 'STUDENTS' ? t('conversationDetail.context.studentsOnly') : 
                          contextDetails.target === 'COMPANIES' ? t('conversationDetail.context.companiesOnly') : t('conversationDetail.context.users')}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const canSendMessage = () => {
    if (!conversation) return false;
    if (conversation.status === 'ARCHIVED' || conversation.status === 'EXPIRED') return false;
    if (conversation.expiresAt && new Date() > new Date(conversation.expiresAt)) return false;
    if (conversation.isReadOnly) return false;
    return true;
  };

  const getParticipantName = (participant: any) => {
    try {
      // Handle anonymous participants in broadcast conversations
      if (participant?.id === 'anonymous' || participant?.userId === 'anonymous') {
        return t('conversations.admin');
      }

      // Handle different possible data structures
      if (participant?.user?.studentProfile?.firstName && participant?.user?.studentProfile?.lastName) {
        return `${participant.user.studentProfile.firstName} ${participant.user.studentProfile.lastName}`;
      } else if (participant?.user?.companyProfile?.name) {
        return participant.user.companyProfile.name;
      } else if (participant?.user?.email) {
        return participant.user.email.split('@')[0];
      } else if (participant?.email) {
        return participant.email.split('@')[0];
      } else if (participant?.firstName && participant?.lastName) {
        return `${participant.firstName} ${participant.lastName}`;
      } else if (participant?.name) {
        return participant.name;
      }
      
      // Fallback
      return t('conversations.unknownUser');
    } catch (error) {
      console.error('Error getting participant name:', error, participant);
      return t('conversations.unknownUser');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="container mx-auto p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('conversationDetail.loading')}</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (error) {
    return (
      <SidebarLayout>
        <div className="container mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>{t('conversationDetail.error')}:</strong> {error}
            <div className="mt-2">
              <button
                onClick={() => window.location.reload()}
                className="text-red-600 hover:text-red-800 underline"
              >
                {t('conversationDetail.tryAgain')}
              </button>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="container mx-auto p-6 flex flex-col h-[calc(100vh-120px)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <div className="flex items-center gap-4">
            <Link
              to="/conversations"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              {getContextIcon(conversation?.context)}
              <h1 className="text-2xl font-bold">
                {conversation?.topic || t('conversationDetail.conversation')}
              </h1>
              {getStatusBadge()}
            </div>
          </div>
          
          {/* Participants or Broadcast Target */}
          <div className="text-sm text-gray-600">
            {conversation?.isBroadcast ? (
              <>
                <span className="font-medium">{t('conversations.recipients')}:</span>{' '}
                {renderTargetLabel(conversation?.contextDetails?.target || conversation?.broadcastTarget)}
              </>
            ) : (
              <>
                <span className="font-medium">{t('conversationDetail.participants')}:</span>{' '}
                {conversation?.participants.map((participant, index) => (
                  <span key={participant.id}>
                    {getParticipantName(participant)}
                    {index < (conversation?.participants.length || 0) - 1 ? ', ' : ''}
                  </span>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Context Information */}
        {getContextInfo()}

        {/* Expiration Warning */}
        {conversation?.expiresAt && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
            <div className="flex items-center text-orange-800">
              <Clock className="w-4 h-4 mr-2" />
              <span className="text-sm">
                {t('conversationDetail.expiresOn')} {formatDate(conversation.expiresAt)}
              </span>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg">
          {Array.isArray(messages) ? messages.map((msg, index) => {
            if (!msg || !msg.id || !msg.sender || !msg.sender.id) {
              return null;
            }

            const isOwnMessage = msg.sender.id === user?.id;

            return (
              <div
                key={msg.id || `msg-${index}`}
                className={`flex items-end gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-lg ${
                    isOwnMessage
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm">{msg.content || t('conversationDetail.noContent')}</p>
                  <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                    {msg.createdAt ? formatDate(msg.createdAt) : t('conversationDetail.unknownTime')}
                  </p>
                </div>
              </div>
            );
          }) : (
            <div className="text-center text-gray-500 py-8">
              {t('conversationDetail.noMessages')}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="mt-4 border-t pt-4">
          {!canSendMessage() ? (
            <div className="text-center text-gray-500 italic p-4 bg-gray-50 rounded-lg">
              {conversation?.status === 'ARCHIVED' || conversation?.status === 'EXPIRED' 
                ? t('conversationDetail.conversationClosed')
                : conversation?.isReadOnly 
                ? t('conversationDetail.readOnly')
                : t('conversationDetail.cannotSend')
              }
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('conversationDetail.typeMessage')}
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {sending ? t('conversationDetail.sending') : t('conversationDetail.send')}
              </button>
            </form>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
};

export default ConversationPage;