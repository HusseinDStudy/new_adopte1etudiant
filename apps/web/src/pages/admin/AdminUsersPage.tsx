import React, { useState } from 'react';
import { Search, Filter, Users, Building2, Shield, Ban, Trash2, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
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
  const [confirm, setConfirm] = useState<{ action: 'role' | 'delete' | null; userId?: string; info?: string; newRole?: string }>({ action: null });

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateStatus(userId, !currentStatus);
      refetch();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setConfirm({ action: 'role', userId, newRole, info: t('adminUsers.confirmChangeRole', { role: newRole }) });
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    setConfirm({ action: 'delete', userId, info: t('adminUsers.confirmDeleteUser', { email: userEmail }) });
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
        return <Shield className="h-4 w-4" />;
      case 'COMPANY':
        return <Building2 className="h-4 w-4" />;
      case 'STUDENT':
        return <Users className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  return (
    <AdminLayout
      title={t('adminUsers.title')}
      subtitle={t('adminUsers.subtitle')}
    >
      <div className="p-6">
        {/* Header with Filters */}
        <div className="mb-6 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-col items-stretch gap-4 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative min-w-0 flex-1 sm:min-w-[16rem] sm:flex-none">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder={t('adminUsers.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 sm:w-64"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 sm:w-auto"
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 sm:w-auto"
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
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-gray-600">{t('loading.loadingUsers')}</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
              <p className="mb-4 text-red-600">{t('errors.loadingUsersError')}</p>
            <button
              onClick={refetch}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
                {t('common.retry')}
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-600">{t('noData.noResultsFound')}</p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              {/* Mobile stacked cards */}
              <div className="divide-y divide-gray-200 sm:hidden">
                {users.map((u) => (
                  <div key={u.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-300">
                        {getRoleIcon(u.role)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="break-words text-sm font-medium text-gray-900">
                            {u.profile?.firstName && u.profile?.lastName
                              ? `${u.profile.firstName} ${u.profile.lastName}`
                              : u.profile?.companyName || u.email.split('@')[0]}
                          </div>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeColor(u.role)}`}>
                            {getRoleIcon(u.role)}
                            <span className="ml-1">{u.role}</span>
                          </span>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {u.isActive ? t('adminUsers.active') : t('adminUsers.inactive')}
                          </span>
                        </div>
                        <div className="mt-1 break-words text-sm text-gray-500">{u.email}</div>
                        <div className="mt-2 text-xs text-gray-600">
                          <span className="mr-2">{t('adminUsers.table.registeredAt')}: {formatDate(u.createdAt)}</span>
                          <span>{t('adminUsers.table.lastLogin')}: {u.lastLoginAt ? formatDate(u.lastLoginAt) : t('adminUsers.never')}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(u.id, u.isActive)}
                            className={`rounded-lg p-2 transition-colors ${
                              u.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={u.isActive ? t('adminUsers.deactivate') : t('adminUsers.activate')}
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                          <div className="group relative">
                            <button className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50">
                              <Shield className="h-4 w-4" />
                            </button>
                            <div className="invisible absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-gray-200 bg-white opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                              <div className="py-1">
                                <button onClick={() => handleRoleChange(u.id, 'STUDENT')} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100" disabled={u.role === 'STUDENT'}>
                                  {t('forms.students')}
                                </button>
                                <button onClick={() => handleRoleChange(u.id, 'COMPANY')} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100" disabled={u.role === 'COMPANY'}>
                                  {t('forms.companies')}
                                </button>
                                <button onClick={() => handleRoleChange(u.id, 'ADMIN')} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100" disabled={u.role === 'ADMIN'}>
                                  {t('adminUsers.admin')}
                                </button>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => handleDeleteUser(u.id, u.email)} className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50" title={t('common.delete')}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto sm:block">
                <table className="min-w-[1000px] divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t('adminUsers.table.user')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        {t('adminUsers.table.role')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        {t('adminUsers.table.status')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        {t('adminUsers.table.registeredAt')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        {t('adminUsers.table.lastLogin')}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        {t('adminUsers.table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
                                {getRoleIcon(user.role)}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="break-words text-sm font-medium text-gray-900">
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
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                              {getRoleIcon(user.role)}
                              <span className="ml-1">{user.role}</span>
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                              {user.isActive ? t('adminUsers.active') : t('adminUsers.inactive')}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                              {user.lastLoginAt ? formatDate(user.lastLoginAt) : t('adminUsers.never')}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Toggle Status */}
                            <button
                              onClick={() => handleToggleStatus(user.id, user.isActive)}
                              className={`rounded-lg p-2 transition-colors ${
                                user.isActive
                                  ? 'text-red-600 hover:bg-red-50'
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                              title={user.isActive ? t('adminUsers.deactivate') : t('adminUsers.activate')}
                            >
                              <Ban className="h-4 w-4" />
                            </button>

                            {/* Role Dropdown */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50">
                                    <Shield className="h-4 w-4" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-48">
                                  <DropdownMenuItem inset onSelect={() => handleRoleChange(user.id, 'STUDENT')}>
                                    {t('forms.students')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem inset onSelect={() => handleRoleChange(user.id, 'COMPANY')}>
                                    {t('forms.companies')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem inset onSelect={() => handleRoleChange(user.id, 'ADMIN')}>
                                    {t('adminUsers.admin')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>

                            {/* Delete User */}
                            <button
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                              title={t('common.delete')}
                            >
                              <Trash2 className="h-4 w-4" />
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
              <div className="mt-6 flex items-center justify-between">
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
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t('common.previous')}
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`rounded-md px-3 py-2 text-sm font-medium ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                    disabled={currentPage === pagination.totalPages}
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t('common.next')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {/* Confirmation Dialog */}
      {confirm.action && (
        <Dialog open={!!confirm.action} onOpenChange={(open) => !open && setConfirm({ action: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{confirm.action === 'delete' ? t('common.delete') : t('adminUsers.changeRole')}</DialogTitle>
              <DialogDescription>{confirm.info}</DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirm({ action: null })} className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200">
                {t('common.cancel')}
              </button>
              <button
                onClick={async () => {
                  if (!confirm.userId) return;
                  if (confirm.action === 'delete') {
                    await deleteUser(confirm.userId);
                  } else if (confirm.action === 'role' && confirm.newRole) {
                    await updateRole(confirm.userId, confirm.newRole);
                  }
                  setConfirm({ action: null });
                  refetch();
                }}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                {t('common.confirm')}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
};

export default AdminUsersPage; 