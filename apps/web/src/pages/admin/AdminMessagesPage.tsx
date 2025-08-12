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
      title={t('admin.messages')}
      subtitle={t('admin.sendMessage') + ' / ' + t('admin.broadcastMessage')}
    >
      <div className="p-6">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('send')}
              className={`border-b-2 px-1 py-2 text-sm font-medium ${
                activeTab === 'send'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <Send className="mr-2 inline h-4 w-4" />
              {t('admin.sendMessage')}
            </button>
            <button
              onClick={() => setActiveTab('broadcast')}
              className={`border-b-2 px-1 py-2 text-sm font-medium ${
                activeTab === 'broadcast'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <Globe className="mr-2 inline h-4 w-4" />
              {t('admin.broadcastMessage')}
            </button>
            <button
              onClick={() => setActiveTab('conversations')}
              className={`border-b-2 px-1 py-2 text-sm font-medium ${
                activeTab === 'conversations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <MessageSquare className="mr-2 inline h-4 w-4" />
              {t('admin.conversations')}
            </button>
          </nav>
        </div>

        {/* Send Message Tab */}
        {activeTab === 'send' && (
          <div className="max-w-2xl">
            <form onSubmit={handleSendMessage} className="space-y-6">
              {/* Recipient Selection */}
              <div>
                <label htmlFor="recipient" className="mb-2 block text-sm font-medium text-gray-700">
                  {t('forms.recipient')} *
                </label>
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('adminUsers.searchPlaceholder')}
                      value={searchUsers}
                      onChange={(e) => setSearchUsers(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <select
                    id="recipient"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">{t('common.all')}</option>
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
                <label htmlFor="subject" className="mb-2 block text-sm font-medium text-gray-700">
                  {t('forms.subject')} *
                </label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder={t('forms.subject')}
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="mb-2 block text-sm font-medium text-gray-700">
                  {t('forms.message')} *
                </label>
                <textarea
                  id="content"
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder={t('forms.message')}
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
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isReadOnly" className="ml-2 block text-sm text-gray-700">
                  <div className="flex items-center">
                    <Lock className="mr-1 h-4 w-4" />
                    {t('forms.isReadOnly')}
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={messagingLoading}
                className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="mr-2 h-4 w-4" />
                {messagingLoading ? t('loading.loading') : t('forms.send')}
              </button>
            </form>
          </div>
        )}

        {/* Broadcast Tab */}
        {activeTab === 'broadcast' && (
          <div className="max-w-2xl">
            <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <h3 className="mb-2 text-sm font-medium text-yellow-800">{t('admin.broadcastMessage')}</h3>
              <p className="text-sm text-yellow-700">
                {t('conversations.broadcastMessage')}
              </p>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-6">
              {/* Target Group */}
              <div>
                <label htmlFor="targetGroup" className="mb-2 block text-sm font-medium text-gray-700">
                  {t('forms.targetRole')}
                </label>
                <select
                  id="targetGroup"
                  value={broadcastRole || ''}
                  onChange={(e) => setBroadcastRole(e.target.value as 'STUDENT' | 'COMPANY' | 'ALL' | undefined)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">{t('forms.allUsers')}</option>
                  <option value="STUDENT">{t('forms.students')}</option>
                  <option value="COMPANY">{t('forms.companies')}</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="broadcastSubject" className="mb-2 block text-sm font-medium text-gray-700">
                  {t('forms.subject')} *
                </label>
                <input
                  type="text"
                  id="broadcastSubject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder={t('forms.subject')}
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label htmlFor="broadcastContent" className="mb-2 block text-sm font-medium text-gray-700">
                  {t('forms.message')} *
                </label>
                <textarea
                  id="broadcastContent"
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder={t('forms.message')}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={messagingLoading}
                className="flex w-full items-center justify-center rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
              >
                <Globe className="mr-2 h-4 w-4" />
                {messagingLoading ? t('loading.loading') : t('forms.broadcast')}
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
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  placeholder={t('conversations.searchPosts') || t('common.search')}
                  value={searchConversations}
                  onChange={(e) => setSearchConversations(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {conversationsLoading ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="text-gray-600">{t('loading.loadingConversations')}</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="py-12 text-center">
                <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-gray-600">{t('noData.noResultsFound')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {conversations.map((conversation) => (
                  <Link
                    to={`/admin/conversations/${conversation.id}`}
                    key={conversation.id}
                    className="block rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {conversation.topic}
                          </h3>
                          {conversation.isReadOnly && (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                              <Lock className="mr-1 h-3 w-3" />
                              {t('conversations.status.readOnly')}
                            </span>
                          )}
                          {conversation.isBroadcast && (
                            <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
                              <Globe className="mr-1 h-3 w-3" />
                              {t('conversations.context.broadcast')}
                            </span>
                          )}
                        </div>
                        
                        {/* Participants */}
                        <div className="mb-2 text-sm text-gray-600">
                          <span className="font-medium">{t('conversationDetail.participants')}:</span>{' '}
                          {conversation.participants?.map((participant: ConversationParticipant, index: number) => (
                            <span key={participant.id}>
                              {getParticipantName(participant)}
                              {index < (conversation.participants?.length || 0) - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>

                        {conversation.lastMessage && (
                          <p className="mb-2 text-sm text-gray-600">
                            {typeof conversation.lastMessage === 'string' 
                              ? conversation.lastMessage 
                              : truncateText(conversation.lastMessage.content, 100)
                            }
                          </p>
                        )}
                        <div className="text-xs text-gray-500">
                          {t('conversations.lastActivity')}: {formatDate(conversation.updatedAt)}
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