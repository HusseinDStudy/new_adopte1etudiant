import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMe, deleteAccountWithPassword, disablePassword } from '../../services/authService';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/admin/AdminLayout';
import TwoFactorAuthSetup from '../../components/auth/TwoFactorAuthSetup';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import ConfirmDialog from '../../components/ui/confirm-dialog';
import { Shield, User, Mail, Calendar, Settings, Trash2, AlertTriangle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const AdminProfilePage = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');
  const location = useLocation();

  const fetchProfile = async () => {
    try {
      const data = await getMe();
      setProfileData(data);
    } catch (err) {
      setError(t('profile.failedToFetchProfile'));
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorParam = params.get('error');
    const messageParam = params.get('message');
    if (errorParam) {
      setError(decodeURIComponent(errorParam.replace(/\+/g, ' ')));
    }
    if (messageParam) {
      setSuccessMessage(decodeURIComponent(messageParam.replace(/\+/g, ' ')));
    }

    fetchProfile();
  }, [location]);
  
  const handleDeletePasswordAccount = async () => {
    try {
        await deleteAccountWithPassword(password);
        alert(t('profile.accountDeletedSuccessfully'));
        logout();
    } catch (err: any) {
        setError(err.response?.data?.message || t('profile.failedToDeleteAccount'));
    } finally {
        setShowDeleteModal(false);
    }
  };

  const [confirmDisablePwd, setConfirmDisablePwd] = useState(false);
  const handleDisablePassword = () => setConfirmDisablePwd(true);

  const linkAccount = (provider: 'google') => {
    window.location.href = `${API_URL}/auth/${provider}`;
  };

  const [confirmDeleteOAuth, setConfirmDeleteOAuth] = useState<null | { provider: 'google' }>(null);
  const deleteOAuthAccount = (provider: 'google') => setConfirmDeleteOAuth({ provider });

  return (
    <AdminLayout
      title={t('admin.profile')}
      subtitle={t('profile.manageYourProfile')}
    >
      <div className="p-6">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-400" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}
        
        {successMessage && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Profile Information */}
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-6 flex items-center">
              <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{t('profile.accountSettings')}</h2>
                <p className="text-gray-600">{t('profile.manageYourProfile')}</p>
              </div>
            </div>

            {profileData && (
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="mr-3 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">{t('profile.email')}</p>
                    <p className="font-medium">{profileData.email}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Shield className="mr-3 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">{t('profile.role')}</p>
                    <p className="font-medium">{profileData.role}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="mr-3 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">{t('settings.created') || 'Created'}</p>
                    <p className="font-medium">
                      {new Date(profileData.createdAt).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')}
                    </p>
                  </div>
                </div>

                {profileData.lastLoginAt && (
                  <div className="flex items-center">
                    <User className="mr-3 h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">{t('adminUsers.table.lastLogin')}</p>
                      <p className="font-medium">
                        {new Date(profileData.lastLoginAt).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Account Settings */}
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-6 flex items-center">
              <Settings className="mr-3 h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">{t('profile.accountSettings')}</h2>
            </div>

            {profileData && (
              <div className="space-y-4">
                <div>
                  <h3 className="mb-3 font-medium text-gray-900">{t('profile.linkedAccounts')}</h3>
                  <div className="space-y-2">
                    {!profileData.linkedProviders.includes('google') && profileData.hasPassword && (
                      <button 
                        onClick={() => linkAccount('google')} 
                        className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                      >
                        {t('profile.linkGoogle')}
                      </button>
                    )}
                    
                    {profileData.linkedProviders.includes('google') && (
                      <div className="flex items-center justify-between rounded-md border border-green-200 bg-green-50 p-3">
                        <span className="text-sm text-green-800">Google</span>
                        <button 
                          onClick={() => deleteOAuthAccount('google')}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          {t('common.delete')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {profileData.hasPassword && (
                  <div className="border-t border-gray-200 pt-4">
                    <button 
                      onClick={handleDisablePassword}
                      className="w-full rounded-md border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-700 shadow-sm hover:bg-yellow-100"
                    >
                      {t('profile.passwordLoginDisabled')}
                    </button>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <button 
                    onClick={() => setShowDeleteModal(true)}
                    className="flex w-full items-center justify-center rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-100"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('profile.deleteAccount')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Two-Factor Authentication */}
          <div className="rounded-lg bg-white p-6 shadow lg:col-span-2">
            <TwoFactorAuthSetup />
          </div>
        </div>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('profile.deleteAccount')}</DialogTitle>
                <DialogDescription>{t('profile.deleteAccountWarning')}</DialogDescription>
              </DialogHeader>
              <input
                type="password"
                placeholder={t('profile.enterPassword') as string}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border border-neutral-200 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-500 shadow-sm focus:border-[color:var(--color-primary)] focus:ring-[color:var(--color-primary)]"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleDeletePasswordAccount}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  {t('common.delete')}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Confirm disable password login */}
        <ConfirmDialog
          open={confirmDisablePwd}
          onOpenChange={setConfirmDisablePwd}
          title={t('profile.confirmDisablePassword')}
          description={i18n.exists('profile.disablePasswordWarning') ? (t('profile.disablePasswordWarning') as string) : undefined}
          confirmText={t('common.confirm') as string}
          cancelText={t('common.cancel') as string}
          onConfirm={async () => {
            try {
              await disablePassword();
              await fetchProfile();
              setSuccessMessage(t('profile.passwordLoginDisabled'));
            } catch (err: any) {
              setError(err.response?.data?.message || t('profile.failedToDisablePassword'));
            }
          }}
        />

        {/* Confirm delete OAuth account */}
        {confirmDeleteOAuth && (
          <ConfirmDialog
            open={!!confirmDeleteOAuth}
            onOpenChange={(open) => !open && setConfirmDeleteOAuth(null)}
            title={t('profile.confirmDeleteOAuth', { provider: confirmDeleteOAuth.provider })}
            description={i18n.exists('profile.deleteOAuthWarning') ? (t('profile.deleteOAuthWarning') as string) : undefined}
            confirmText={t('common.delete') as string}
            cancelText={t('common.cancel') as string}
            onConfirm={async () => {
              window.location.href = `${API_URL}/auth/${confirmDeleteOAuth.provider}/delete`;
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProfilePage; 