import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMessagesForConversation, createMessageInConversation, Message, ConversationDetails } from '../../services/messageService';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Lock, Archive, Clock, AlertCircle, Users, Briefcase, Building2, MessageSquare, Send } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminConversationPage: React.FC = () => {
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
          setError('Failed to load messages.');
          setLoading(false);
        });
    }
  }, [conversationId]);

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
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const getContextIcon = (context?: string) => {
    switch (context) {
      case 'ADOPTION_REQUEST':
        return <Users className="h-5 w-5" />;
      case 'OFFER':
        return <Briefcase className="h-5 w-5" />;
      case 'ADMIN_MESSAGE':
        return <MessageSquare className="h-5 w-5" />;
      case 'BROADCAST':
        return <Building2 className="h-5 w-5" />;
      default:
        return <MessageSquare className="h-5 w-5" />;
    }
  };

  const getStatusBadge = () => {
    if (!conversation) return null;

    if (conversation.isReadOnly) {
      return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
          <Lock className="mr-1 h-4 w-4" />
          Lecture seule
        </span>
      );
    }

    if (conversation.status === 'ARCHIVED') {
      return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
          <Archive className="mr-1 h-4 w-4" />
          Archivée
        </span>
      );
    }

    if (conversation.status === 'EXPIRED') {
      return (
        <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
          <Clock className="mr-1 h-4 w-4" />
          Expirée
        </span>
      );
    }

    if (conversation.status === 'PENDING_APPROVAL') {
      return (
        <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
          <AlertCircle className="mr-1 h-4 w-4" />
          En attente
        </span>
      );
    }

    return null;
  };

  const getContextInfo = () => {
    if (!conversation?.contextDetails) return null;

    const { contextDetails } = conversation;
    
    switch (contextDetails.type) {
      case 'adoption_request':
        return (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-2 font-semibold text-blue-900">
              Demande d'adoption - {contextDetails.companyName}
            </h3>
            <p className="mb-2 text-sm text-blue-700">
              Statut: {contextDetails.status === 'PENDING' ? 'En attente de réponse' : 
                       contextDetails.status === 'ACCEPTED' ? 'Acceptée' : 
                       contextDetails.status === 'REJECTED' ? 'Rejetée' : contextDetails.status}
            </p>
            {contextDetails.initialMessage && (
              <div className="text-sm text-blue-600">
                <strong>Message initial:</strong> {contextDetails.initialMessage}
              </div>
            )}
          </div>
        );
      case 'offer':
        return (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
            <h3 className="mb-2 font-semibold text-green-900">
              Candidature - {contextDetails.offerTitle}
            </h3>
            <p className="mb-2 text-sm text-green-700">
              Entreprise: {contextDetails.companyName}
            </p>
            <p className="text-sm text-green-700">
              Statut: {contextDetails.status === 'NEW' ? 'Nouvelle' : 
                       contextDetails.status === 'SEEN' ? 'Vue' : 
                       contextDetails.status === 'INTERVIEW' ? 'Entretien' : 
                       contextDetails.status === 'REJECTED' ? 'Rejetée' : 
                       contextDetails.status === 'HIRED' ? 'Embauchée' : contextDetails.status}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const canSendMessage = () => {
    if (!conversation) return false;
    // Admins can always send messages, even in read-only conversations
    if (conversation.status === 'ARCHIVED' || conversation.status === 'EXPIRED') return false;
    if (conversation.expiresAt && new Date() > new Date(conversation.expiresAt)) return false;
    return true;
  };

  const getParticipantName = (participant: any) => {
    try {
      // Handle anonymous participants in broadcast conversations
      if (participant?.id === 'anonymous' || participant?.userId === 'anonymous') {
        return 'Administrateur';
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
      return 'Utilisateur inconnu';
    } catch (error) {
      console.error('Error getting participant name:', error, participant);
      return 'Utilisateur inconnu';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <AdminLayout title="Conversation" subtitle="Chargement...">
        <div className="p-6">
          <div className="flex h-64 items-center justify-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Chargement de la conversation...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Erreur" subtitle="Impossible de charger la conversation">
        <div className="p-6">
          <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            <strong>Erreur:</strong> {error}
            <div className="mt-2">
              <button
                onClick={() => window.location.reload()}
                className="text-red-600 underline hover:text-red-800"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Conversation"
      subtitle={conversation?.topic || 'Détails de la conversation'}
    >
      <div className="flex min-h-[100dvh] min-h-[100svh] flex-col p-6 pb-[env(safe-area-inset-bottom)]">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/messages"
              className="rounded-lg p-2 transition-colors hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              {getContextIcon(conversation?.context)}
              <h1 className="text-2xl font-bold">
                {conversation?.topic || 'Conversation'}
              </h1>
              {getStatusBadge()}
            </div>
          </div>
          
          {/* Participants */}
          <div className="text-sm text-gray-600">
            <span className="font-medium">Participants:</span>{' '}
            {conversation?.participants.map((participant, index) => (
              <span key={participant.id}>
                {getParticipantName(participant)}
                {index < (conversation?.participants.length || 0) - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        </div>

        {/* Context Information */}
        {getContextInfo()}

        {/* Expiration Warning */}
        {conversation?.expiresAt && (
          <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-3">
            <div className="flex items-center text-orange-800">
              <Clock className="mr-2 h-4 w-4" />
              <span className="text-sm">
                Cette conversation expire le {formatDate(conversation.expiresAt)}
              </span>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain rounded-lg bg-gray-50 p-4">
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
                  className={`max-w-lg rounded-lg px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-blue-500 text-white'
                      : 'border border-gray-200 bg-white text-gray-800'
                  }`}
                >
                  <p className="text-sm">{msg.content || 'No content'}</p>
                  <p className={`mt-1 text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                    {msg.createdAt ? formatDate(msg.createdAt) : 'Unknown time'}
                  </p>
                </div>
              </div>
            );
          }) : (
            <div className="py-8 text-center text-gray-500">
              Aucun message dans cette conversation.
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="mt-4 border-t pt-4">
          {!canSendMessage() ? (
            <div className="rounded-lg bg-gray-50 p-4 text-center italic text-gray-500">
              {conversation?.status === 'ARCHIVED' || conversation?.status === 'EXPIRED' 
                ? 'Cette conversation a été fermée et est maintenant en lecture seule.'
                : 'Vous ne pouvez pas envoyer de messages dans cette conversation.'
              }
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-grow rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tapez votre message..."
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {sending ? 'Envoi...' : 'Envoyer'}
              </button>
            </form>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminConversationPage; 