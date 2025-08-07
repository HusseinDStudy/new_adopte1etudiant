import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Users, Building2, Globe, Plus, MessageSquare, Search, Lock, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdminMessaging, useAdminUsers, useAdminConversations } from '../../hooks/useAdmin';
import { useLocalizedDate } from '../../hooks/useLocalizedDate';

const AdminMessagesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'send' | 'broadcast' | 'conversations'>('send');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [searchUsers, setSearchUsers] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [broadcastRole, setBroadcastRole] = useState<'STUDENT' | 'COMPANY' | 'ALL' | undefined>(undefined);
  const [searchConversations, setSearchConversations] = useState('');

  const { t, i18n } = useTranslation();
  const { formatDateTime } = useLocalizedDate();
  
  const { sendMessage, sendBroadcast, loading: messagingLoading } = useAdminMessaging();
  const { users } = useAdminUsers({ search: searchUsers, limit: 50 });
  const { conversations, loading: conversationsLoading } = useAdminConversations({ 
    limit: 20, 
    search: searchConversations 
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser || !subject || !content) {
      alert(t('errors.fillRequiredFields'));
      return;
    }

    try {
      await sendMessage({
        recipientId: selectedUser,
        subject,
        content,
        isReadOnly,
      });
      
      // Reset form
      setSelectedUser('');
      setSubject('');
      setContent('');
      setIsReadOnly(false);
      alert(t('success.messageSent'));
    } catch (error) {
      console.error('Error sending message:', error);
      alert(t('errors.sendingMessageError'));
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject || !content) {
      alert(t('errors.fillRequiredFields'));
      return;
    }

    try {
      const result = await sendBroadcast({
        ...(broadcastRole && { targetRole: broadcastRole }),
        subject,
        content,
      });
      
      // Reset form
      setSubject('');
      setContent('');
      setBroadcastRole(undefined);
      alert(t('success.messageSentToUsers', { count: result.sentTo }));
    } catch (error) {
      console.error('Error sending broadcast:', error);
      alert(t('errors.broadcastingMessageError'));
    }
  };

  const formatDate = (dateString: string) => {
    return formatDateTime(dateString);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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

  interface ConversationParticipant {
    id: string;
    user: {
      id: string;
      email: string;
      role: string;
      studentProfile?: {
        firstName: string;
        lastName: string;
      };
      companyProfile?: {
        name: string;
      };
    };
  }

  return (
    <AdminLayout
      title="Gestion des messages"
      subtitle="Envoyez des messages aux utilisateurs ou diffusez des annonces"
    >
      <div className="p-6">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('send')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'send'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Send className="w-4 h-4 inline mr-2" />
              Envoyer un message
            </button>
            <button
              onClick={() => setActiveTab('broadcast')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'broadcast'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Globe className="w-4 h-4 inline mr-2" />
              Diffusion
            </button>
            <button
              onClick={() => setActiveTab('conversations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'conversations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Conversations
            </button>
          </nav>
        </div>

        {/* Send Message Tab */}
        {activeTab === 'send' && (
          <div className="max-w-2xl">
            <form onSubmit={handleSendMessage} className="space-y-6">
              {/* Recipient Selection */}
              <div>
                <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-2">
                  Destinataire *
                </label>
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Rechercher un utilisateur..."
                      value={searchUsers}
                      onChange={(e) => setSearchUsers(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <select
                    id="recipient"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Sélectionner un utilisateur</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.profile?.firstName && user.profile?.lastName
                          ? `${user.profile.firstName} ${user.profile.lastName}`
                          : user.profile?.companyName || user.email.split('@')[0]
                        } ({user.email}) - {user.role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Sujet *
                </label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Sujet du message"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="content"
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contenu du message"
                  required
                />
              </div>

              {/* Read-only Option */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isReadOnly"
                  checked={isReadOnly}
                  onChange={(e) => setIsReadOnly(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isReadOnly" className="ml-2 block text-sm text-gray-700">
                  <div className="flex items-center">
                    <Lock className="w-4 h-4 mr-1" />
                    Conversation en lecture seule (le destinataire ne pourra pas répondre)
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={messagingLoading}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                {messagingLoading ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>
            </form>
          </div>
        )}

        {/* Broadcast Tab */}
        {activeTab === 'broadcast' && (
          <div className="max-w-2xl">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                Message de diffusion
              </h3>
              <p className="text-sm text-yellow-700">
                Ce message sera envoyé à tous les utilisateurs du groupe sélectionné en lecture seule. Utilisez cette fonctionnalité avec prudence.
              </p>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-6">
              {/* Target Group */}
              <div>
                <label htmlFor="targetGroup" className="block text-sm font-medium text-gray-700 mb-2">
                  Groupe cible
                </label>
                <select
                  id="targetGroup"
                  value={broadcastRole || ''}
                  onChange={(e) => setBroadcastRole(e.target.value as 'STUDENT' | 'COMPANY' | 'ALL' | undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALL">Tous les utilisateurs</option>
                  <option value="STUDENT">Étudiants uniquement</option>
                  <option value="COMPANY">Entreprises uniquement</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="broadcastSubject" className="block text-sm font-medium text-gray-700 mb-2">
                  Sujet *
                </label>
                <input
                  type="text"
                  id="broadcastSubject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Sujet de l'annonce"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label htmlFor="broadcastContent" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="broadcastContent"
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contenu de l'annonce"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={messagingLoading}
                className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                <Globe className="w-4 h-4 mr-2" />
                {messagingLoading ? 'Diffusion en cours...' : 'Diffuser le message'}
              </button>
            </form>
          </div>
        )}

        {/* Conversations Tab */}
        {activeTab === 'conversations' && (
          <div>
            {/* Search Conversations */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher dans les conversations..."
                  value={searchConversations}
                  onChange={(e) => setSearchConversations(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {conversationsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des conversations...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucune conversation trouvée</p>
              </div>
            ) : (
              <div className="space-y-4">
                {conversations.map((conversation) => (
                  <Link
                    to={`/admin/conversations/${conversation.id}`}
                    key={conversation.id}
                    className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {conversation.topic}
                          </h3>
                          {conversation.isReadOnly && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <Lock className="w-3 h-3 mr-1" />
                              Lecture seule
                            </span>
                          )}
                          {conversation.isBroadcast && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              <Globe className="w-3 h-3 mr-1" />
                              Diffusion
                            </span>
                          )}
                        </div>
                        
                        {/* Participants */}
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Participants:</span>{' '}
                          {conversation.participants?.map((participant: ConversationParticipant, index: number) => (
                            <span key={participant.id}>
                              {getParticipantName(participant)}
                              {index < (conversation.participants?.length || 0) - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>

                        {conversation.lastMessage && (
                          <p className="text-gray-600 text-sm mb-2">
                            {typeof conversation.lastMessage === 'string' 
                              ? conversation.lastMessage 
                              : truncateText(conversation.lastMessage.content, 100)
                            }
                          </p>
                        )}
                        <div className="text-xs text-gray-500">
                          Dernière activité: {formatDate(conversation.updatedAt)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMessagesPage; 