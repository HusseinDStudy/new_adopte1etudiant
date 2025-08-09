import React, { useState } from 'react';
import { Search, Filter, Users, Building2, Shield, Ban, Trash2, MoreVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdminUsers, useAdminUserMutations } from '../../hooks/useAdmin';

const AdminUsersPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);

  const { users, pagination, loading, error, refetch } = useAdminUsers({
    search: searchTerm,
    role: roleFilter,
    isActive: statusFilter,
    page: currentPage,
    limit: 15,
  });

  const { updateStatus, updateRole, deleteUser } = useAdminUserMutations();

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateStatus(userId, !currentStatus);
      refetch();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (window.confirm(t('adminUsers.confirmChangeRole', { role: newRole }))) {
      try {
        await updateRole(userId, newRole);
        refetch();
      } catch (error) {
        console.error('Error updating user role:', error);
      }
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (window.confirm(t('adminUsers.confirmDeleteUser', { email: userEmail }))) {
      try {
        await deleteUser(userId);
        refetch();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'COMPANY':
        return 'bg-blue-100 text-blue-800';
      case 'STUDENT':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-4 h-4" />;
      case 'COMPANY':
        return <Building2 className="w-4 h-4" />;
      case 'STUDENT':
        return <Users className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  return (
    <AdminLayout
      title={t('adminUsers.title')}
      subtitle={t('adminUsers.subtitle')}
    >
      <div className="p-6">
        {/* Header with Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-6 gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 min-w-0">
            {/* Search */}
            <div className="relative min-w-0 sm:min-w-[16rem] flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t('adminUsers.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t('adminUsers.allRoles')}</option>
              <option value="STUDENT">{t('forms.students')}</option>
              <option value="COMPANY">{t('forms.companies')}</option>
              <option value="ADMIN">{t('adminUsers.admins')}</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter === undefined ? '' : statusFilter.toString()}
              onChange={(e) => setStatusFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t('adminUsers.allStatuses')}</option>
              <option value="true">{t('adminUsers.active')}</option>
              <option value="false">{t('adminUsers.inactive')}</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            {t('adminUsers.count', { count: pagination?.total || 0 })}
          </div>
        </div>

        {/* Users Table */}
          {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t('loading.loadingUsers')}</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
              <p className="text-red-600 mb-4">{t('errors.loadingUsersError')}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                {t('common.retry')}
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{t('noData.noResultsFound')}</p>
          </div>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Mobile stacked cards */}
              <div className="sm:hidden divide-y divide-gray-200">
                {users.map((u) => (
                  <div key={u.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        {getRoleIcon(u.role)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-sm font-medium text-gray-900 break-words">
                            {u.profile?.firstName && u.profile?.lastName
                              ? `${u.profile.firstName} ${u.profile.lastName}`
                              : u.profile?.companyName || u.email.split('@')[0]}
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(u.role)}`}>
                            {getRoleIcon(u.role)}
                            <span className="ml-1">{u.role}</span>
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {u.isActive ? t('adminUsers.active') : t('adminUsers.inactive')}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1 break-words">{u.email}</div>
                        <div className="mt-2 text-xs text-gray-600">
                          <span className="mr-2">{t('adminUsers.table.registeredAt')}: {formatDate(u.createdAt)}</span>
                          <span>{t('adminUsers.table.lastLogin')}: {u.lastLoginAt ? formatDate(u.lastLoginAt) : t('adminUsers.never')}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(u.id, u.isActive)}
                            className={`p-2 rounded-lg transition-colors ${
                              u.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={u.isActive ? t('adminUsers.deactivate') : t('adminUsers.activate')}
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                          <div className="relative group">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Shield className="w-4 h-4" />
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <div className="py-1">
                                <button onClick={() => handleRoleChange(u.id, 'STUDENT')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" disabled={u.role === 'STUDENT'}>
                                  {t('forms.students')}
                                </button>
                                <button onClick={() => handleRoleChange(u.id, 'COMPANY')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" disabled={u.role === 'COMPANY'}>
                                  {t('forms.companies')}
                                </button>
                                <button onClick={() => handleRoleChange(u.id, 'ADMIN')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" disabled={u.role === 'ADMIN'}>
                                  {t('adminUsers.admin')}
                                </button>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => handleDeleteUser(u.id, u.email)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title={t('common.delete')}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-[1000px] divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('adminUsers.table.user')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('adminUsers.table.role')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('adminUsers.table.status')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('adminUsers.table.registeredAt')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('adminUsers.table.lastLogin')}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('adminUsers.table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                {getRoleIcon(user.role)}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 break-words">
                                {user.profile?.firstName && user.profile?.lastName
                                  ? `${user.profile.firstName} ${user.profile.lastName}`
                                  : user.profile?.companyName || user.email.split('@')[0]
                                }
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                              {user.profile?.school && (
                                <div className="text-xs text-gray-400">{user.profile.school}</div>
                              )}
                              {user.profile?.sector && (
                                <div className="text-xs text-gray-400">{t('offers.requirements')}: {user.profile.sector}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                              {getRoleIcon(user.role)}
                              <span className="ml-1">{user.role}</span>
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                              {user.isActive ? t('adminUsers.active') : t('adminUsers.inactive')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {user.lastLoginAt ? formatDate(user.lastLoginAt) : t('adminUsers.never')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Toggle Status */}
                            <button
                              onClick={() => handleToggleStatus(user.id, user.isActive)}
                              className={`p-2 rounded-lg transition-colors ${
                                user.isActive
                                  ? 'text-red-600 hover:bg-red-50'
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                              title={user.isActive ? t('adminUsers.deactivate') : t('adminUsers.activate')}
                            >
                              <Ban className="w-4 h-4" />
                            </button>

                            {/* Role Dropdown */}
                            <div className="relative group">
                              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <Shield className="w-4 h-4" />
                              </button>
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                <div className="py-1">
                                  <button
                                    onClick={() => handleRoleChange(user.id, 'STUDENT')}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    disabled={user.role === 'STUDENT'}
                                  >
                                    {t('forms.students')}
                                  </button>
                                  <button
                                    onClick={() => handleRoleChange(user.id, 'COMPANY')}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    disabled={user.role === 'COMPANY'}
                                  >
                                    {t('forms.companies')}
                                  </button>
                                  <button
                                    onClick={() => handleRoleChange(user.id, 'ADMIN')}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    disabled={user.role === 'ADMIN'}
                                  >
                                    {t('adminUsers.admin')}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Delete User */}
                            <button
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title={t('common.delete')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  {t('common.showingResults', {
                    start: ((currentPage - 1) * 15) + 1,
                    end: Math.min(currentPage * 15, pagination.total),
                    total: pagination.total,
                  })}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('common.previous')}
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                    disabled={currentPage === pagination.totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('common.next')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage; 