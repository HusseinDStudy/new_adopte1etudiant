import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Clock, Lock, Archive, AlertCircle, Building2, Briefcase, Users, Filter } from 'lucide-react';
import { useConversations, useBroadcastConversations } from '../hooks/useConversations';
import { useAuth } from '../context/AuthContext';
import SidebarLayout from '../components/layout/SidebarLayout';
import { Conversation, ConversationContext } from '../services/messageService';

const MyConversationsPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'conversations' | 'broadcasts'>('conversations');
  const [contextFilter, setContextFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { user } = useAuth();

  const { conversations, loading, error, pagination } = useConversations({
    context: contextFilter || undefined,
    status: statusFilter || undefined,
    limit: 20
  });

  const { conversations: broadcastConversations, loading: broadcastLoading, error: broadcastError, pagination: broadcastPagination } = useBroadcastConversations({
    limit: 20
  });

  const getContextIcon = (context?: string) => {
    switch (context) {
      case 'ADOPTION_REQUEST':
        return <Users className="w-4 h-4" />;
      case 'OFFER':
        return <Briefcase className="w-4 h-4" />;
      case 'ADMIN_MESSAGE':
        return <MessageSquare className="w-4 h-4" />;
      case 'BROADCAST':
        return <Building2 className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (conversation: Conversation) => {
    if (conversation.isReadOnly) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <Lock className="w-3 h-3 mr-1" />
          {t('conversations.status.readOnly')}
        </span>
      );
    }

    if (conversation.status === 'ARCHIVED') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <Archive className="w-3 h-3 mr-1" />
          {t('conversations.status.archived')}
        </span>
      );
    }

    if (conversation.status === 'EXPIRED') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <Clock className="w-3 h-3 mr-1" />
          {t('conversations.status.expired')}
        </span>
      );
    }

    if (conversation.status === 'PENDING_APPROVAL') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          {t('conversations.status.pendingApproval')}
        </span>
      );
    }

    return null;
  };

  const getContextLabel = (contextDetails?: ConversationContext) => {
    if (!contextDetails) return t('conversations.context.conversation');
    
    switch (contextDetails.type) {
      case 'adoption_request':
        return `${t('conversations.context.adoptionRequest')} - ${contextDetails.companyName}`;
      case 'offer':
        return `${t('conversations.context.application')} - ${contextDetails.offerTitle}`;
      case 'admin_message':
        return t('conversations.context.adminMessage');
      case 'broadcast':
        return t('conversations.context.broadcast');
      default:
        return t('conversations.context.conversation');
    }
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



  return (
    <SidebarLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{t('conversations.title')}</h1>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('conversations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'conversations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              {t('conversations.conversationsTab')}
            </button>
            <button
              onClick={() => setActiveTab('broadcasts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'broadcasts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building2 className="w-4 h-4 inline mr-2" />
              {t('conversations.broadcastsTab')}
            </button>
          </nav>
        </div>

        {activeTab === 'conversations' && (
          <>
            {/* Filters */}
            <div className="flex gap-4 items-center mb-6">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={contextFilter}
                  onChange={(e) => setContextFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{t('conversations.filters.allContexts')}</option>
                  <option value="ADOPTION_REQUEST">{t('conversations.filters.adoptionRequests')}</option>
                  <option value="OFFER">{t('conversations.filters.applications')}</option>
                  <option value="ADMIN_MESSAGE">{t('conversations.filters.adminMessages')}</option>
                  <option value="BROADCAST">{t('conversations.filters.broadcasts')}</option>
                </select>
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{t('conversations.filters.allStatuses')}</option>
                <option value="ACTIVE">{t('conversations.filters.active')}</option>
                <option value="PENDING_APPROVAL">{t('conversations.filters.pending')}</option>
                <option value="ARCHIVED">{t('conversations.filters.archived')}</option>
                <option value="EXPIRED">{t('conversations.filters.expired')}</option>
              </select>
            </div>
          </>
        )}

        {activeTab === 'conversations' && (
          <>
            <div className="bg-white shadow rounded-lg">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">{t('conversations.loading')}</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600">{error}</p>
                </div>
              ) : conversations.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {conversations.map(conversation => (
                    <li key={conversation.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <Link to={`/conversations/${conversation.id}`} className="block">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getContextIcon(conversation.context)}
                              <h3 className="font-semibold text-lg text-gray-900">
                                {getContextLabel(conversation.contextDetails)}
                              </h3>
                              {getStatusBadge(conversation)}
                            </div>
                            
                            {/* Participants or Broadcast Target */}
                            <div className="text-sm text-gray-600 mb-2">
                              {conversation.isBroadcast ? (
                                <>
                                  <span className="font-medium">{t('conversations.recipients')}:</span>{' '}
                                  {conversation.broadcastTarget === 'ALL' ? t('conversations.allUsers') :
                                   conversation.broadcastTarget === 'STUDENTS' ? t('conversations.studentsOnly') :
                                   conversation.broadcastTarget === 'COMPANIES' ? t('conversations.companiesOnly') : t('conversations.users')}
                                </>
                              ) : (
                                <>
                                  <span className="font-medium">{t('conversations.participants')}:</span>{' '}
                                  {conversation.participants.map((participant, index) => (
                                    <span key={participant.id}>
                                      {getParticipantName(participant)}
                                      {index < conversation.participants.length - 1 ? ', ' : ''}
                                    </span>
                                  ))}
                                </>
                              )}
                            </div>

                            {/* Last Message */}
                            {conversation.lastMessage && (
                              <p className="text-gray-600 text-sm mb-2">
                                {conversation.lastMessage.content}
                              </p>
                            )}

                            {/* Expiration Warning */}
                            {conversation.expiresAt && (
                              <div className="text-xs text-orange-600 mb-2">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {t('conversations.expiresOn')} {formatDate(conversation.expiresAt)}
                              </div>
                            )}

                            <div className="text-xs text-gray-500">
                              {t('conversations.lastActivity')}: {formatDate(conversation.updatedAt)}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {contextFilter || statusFilter 
                      ? t('conversations.noConversationsWithFilters')
                      : t('conversations.noConversations')
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <nav className="flex items-center space-x-2">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`px-3 py-2 rounded-lg ${
                        page === pagination.page
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            )}
          </>
        )}

        {activeTab === 'broadcasts' && (
          <>
            <div className="bg-white shadow rounded-lg">
              {broadcastLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">{t('conversations.loadingBroadcasts')}</p>
                </div>
              ) : broadcastError ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600">{broadcastError}</p>
                </div>
              ) : broadcastConversations.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {broadcastConversations.map(conversation => (
                    <li key={conversation.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <Link to={`/conversations/${conversation.id}`} className="block">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Building2 className="w-4 h-4" />
                              <h3 className="font-semibold text-lg text-gray-900">
                                {t('conversations.broadcastMessage')}
                              </h3>
                              {getStatusBadge(conversation)}
                            </div>
                            
                            {/* Broadcast Target */}
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">{t('conversations.recipients')}:</span>{' '}
                              {conversation.broadcastTarget === 'ALL' ? t('conversations.allUsers') :
                               conversation.broadcastTarget === 'STUDENTS' ? t('conversations.studentsOnly') :
                               conversation.broadcastTarget === 'COMPANIES' ? t('conversations.companiesOnly') : t('conversations.users')}
                            </div>

                            {/* Last Message */}
                            {conversation.lastMessage && (
                              <p className="text-gray-600 text-sm mb-2">
                                {conversation.lastMessage.content}
                              </p>
                            )}

                            <div className="text-xs text-gray-500">
                              {t('conversations.lastActivity')}: {formatDate(conversation.updatedAt)}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-12">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {t('conversations.noBroadcasts')}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {broadcastPagination && broadcastPagination.totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <nav className="flex items-center space-x-2">
                  {Array.from({ length: broadcastPagination.totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`px-3 py-2 rounded-lg ${
                        page === broadcastPagination.page
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </SidebarLayout>
  );
};

export default MyConversationsPage; 