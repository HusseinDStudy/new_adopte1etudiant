import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Clock, Lock, Archive, AlertCircle, Building2, Briefcase, Users, Filter } from 'lucide-react';
import { useConversations, useBroadcastConversations } from '../hooks/useConversations';
import { useAuth } from '../context/AuthContext';
import SidebarLayout from '../components/layout/SidebarLayout';
import { Conversation, ConversationContext } from '../services/messageService';

const MyConversationsPage = () => {
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
          Lecture seule
        </span>
      );
    }

    if (conversation.status === 'ARCHIVED') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <Archive className="w-3 h-3 mr-1" />
          Archivée
        </span>
      );
    }

    if (conversation.status === 'EXPIRED') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <Clock className="w-3 h-3 mr-1" />
          Expirée
        </span>
      );
    }

    if (conversation.status === 'PENDING_APPROVAL') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          En attente
        </span>
      );
    }

    return null;
  };

  const getContextLabel = (contextDetails?: ConversationContext) => {
    if (!contextDetails) return 'Conversation';
    
    switch (contextDetails.type) {
      case 'adoption_request':
        return `Demande d'adoption - ${contextDetails.companyName}`;
      case 'offer':
        return `Candidature - ${contextDetails.offerTitle}`;
      case 'admin_message':
        return 'Message administrateur';
      case 'broadcast':
        return 'Message de diffusion';
      default:
        return 'Conversation';
    }
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



  return (
    <SidebarLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Mes Conversations</h1>
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
              Conversations
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
              Messages de diffusion
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
                  <option value="">Tous les contextes</option>
                  <option value="ADOPTION_REQUEST">Demandes d'adoption</option>
                  <option value="OFFER">Candidatures</option>
                  <option value="ADMIN_MESSAGE">Messages admin</option>
                  <option value="BROADCAST">Diffusions</option>
                </select>
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="ACTIVE">Actives</option>
                <option value="PENDING_APPROVAL">En attente</option>
                <option value="ARCHIVED">Archivées</option>
                <option value="EXPIRED">Expirées</option>
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
                  <p className="text-gray-600">Chargement des conversations...</p>
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
                            
                            {/* Participants */}
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Participants:</span>{' '}
                              {conversation.participants.map((participant, index) => (
                                <span key={participant.id}>
                                  {getParticipantName(participant)}
                                  {index < conversation.participants.length - 1 ? ', ' : ''}
                                </span>
                              ))}
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
                                Expire le {formatDate(conversation.expiresAt)}
                              </div>
                            )}

                            <div className="text-xs text-gray-500">
                              Dernière activité: {formatDate(conversation.updatedAt)}
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
                      ? 'Aucune conversation trouvée avec les filtres actuels.'
                      : 'Vous n\'avez pas encore de conversations.'
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
                  <p className="text-gray-600">Chargement des messages de diffusion...</p>
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
                                Message de diffusion
                              </h3>
                              {getStatusBadge(conversation)}
                            </div>
                            
                            {/* Broadcast Target */}
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Destinataires:</span>{' '}
                              {conversation.broadcastTarget === 'ALL' ? 'Tous les utilisateurs' :
                               conversation.broadcastTarget === 'STUDENTS' ? 'Étudiants uniquement' :
                               conversation.broadcastTarget === 'COMPANIES' ? 'Entreprises uniquement' : 'Utilisateurs'}
                            </div>

                            {/* Last Message */}
                            {conversation.lastMessage && (
                              <p className="text-gray-600 text-sm mb-2">
                                {conversation.lastMessage.content}
                              </p>
                            )}

                            <div className="text-xs text-gray-500">
                              Dernière activité: {formatDate(conversation.updatedAt)}
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
                    Aucun message de diffusion reçu.
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