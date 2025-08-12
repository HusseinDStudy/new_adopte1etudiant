import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import StudentProfileForm from '../components/auth/StudentProfileForm';
import CompanyProfileForm from '../components/auth/CompanyProfileForm';
import { getMe, deleteAccountWithPassword, disablePassword } from '../services/authService';
import TwoFactorAuthSetup from '../components/auth/TwoFactorAuthSetup';
import ConfirmDialog from '../components/ui/confirm-dialog';
import SidebarLayout from '../components/layout/SidebarLayout';

const API_URL = import.meta.env.VITE_API_URL;

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');
  const location = useLocation();
  const { t, i18n } = useTranslation();

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
    <SidebarLayout>
      <div className="container mx-auto">
        <h1 className="sr-only">{t('profile.manageYourProfile')}</h1>
        {error && <p className="mt-4 rounded bg-red-100 p-2 text-red-500">{error}</p>}
        {successMessage && <p className="mt-4 rounded bg-green-100 p-2 text-green-500">{successMessage}</p>}
        <section className="mt-4" aria-labelledby="profile-section">
          <h2 id="profile-section" className="text-2xl font-bold">{t('profile.manageYourProfile')}</h2>
          {user?.role === 'STUDENT' && <StudentProfileForm />}
          {user?.role === 'COMPANY' && <CompanyProfileForm />}
        </section>
      
      <section className="mt-8 border-t border-gray-200 p-4" aria-labelledby="account-settings">
          <h2 id="account-settings" className="text-xl font-semibold">{t('profile.accountSettings')}</h2>
          {profileData && (
              <div className="mt-4">
                  <p><strong>{t('profile.email')}:</strong> {profileData.email}</p>
                  <p><strong>{t('profile.role')}:</strong> {profileData.role}</p>

                  <section className="mt-4" aria-labelledby="linked-accounts">
                      <h3 id="linked-accounts" className="font-bold">{t('profile.linkedAccounts')}</h3>
                      {!profileData.linkedProviders.includes('google') && profileData.hasPassword && (
                                                      <button onClick={() => linkAccount('google')} className="mr-2 mt-2 rounded bg-blue-500 p-2 text-white">{t('profile.linkGoogle')}</button>
                      )}
                      {profileData.linkedProviders.length === 0 && !profileData.hasPassword && <p>{t('profile.noAccountsLinked')}</p>}
                      {profileData.linkedProviders.map((p: string) => <span key={p} className="mr-2 inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700">{p}</span>)}
                  </section>

                  <section className="mt-6" aria-labelledby="login-methods">
                    <h3 id="login-methods" className="text-lg font-semibold">{t('profile.loginMethods')}</h3>
                    <ul className="mt-2 divide-y divide-gray-200">
                        {profileData.hasPassword && (
                            <li className="flex items-center justify-between py-2">
                                <span>{t('profile.passwordLogin')}</span>
                                {profileData.linkedProviders.length > 0 ? (
                                    <button
                                        onClick={handleDisablePassword}
                                        className="font-medium text-red-600 hover:text-red-800"
                                    >
                                        {t('profile.disable')}
                                    </button>
                                ) : (
                                    <span className="text-gray-500">{t('profile.enabled')}</span>
                                )}
                            </li>
                        )}
                        {profileData.linkedProviders.includes('google') && (
                            <li className="flex items-center justify-between py-2">
                                <span>{t('profile.googleLogin')}</span>
                                <span className="text-green-600">{t('profile.enabled')}</span>
                            </li>
                        )}
                    </ul>
                  </section>

                  <TwoFactorAuthSetup />
              </div>
          )}
      </section>

      <section className="mt-8 border-t border-red-300 bg-red-50 p-4" aria-labelledby="danger-zone">
          <h2 id="danger-zone" className="text-xl font-semibold text-red-800">{t('profile.dangerZone')}</h2>
          <div className="mt-4">
              <p className="text-sm text-gray-600">
                  {t('profile.deleteAccountWarning')}
              </p>
              {profileData?.hasPassword ? (
                 <button onClick={() => setShowDeleteModal(true)} className="mt-2 rounded bg-red-600 p-2 text-white">{t('profile.deleteAccount')}</button>
              ) : (
                <>
                  {profileData?.linkedProviders.includes('google') &&
                    <button onClick={() => deleteOAuthAccount('google')} className="mr-2 mt-2 rounded bg-red-600 p-2 text-white">{t('profile.deleteWithGoogle')}</button>
                  }
                </>
              )}
          </div>
      </section>
      
      {showDeleteModal && (
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('profile.confirmDeletion')}</DialogTitle>
              <DialogDescription>{t('profile.enterPasswordToDelete')}</DialogDescription>
            </DialogHeader>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-md border border-neutral-200 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-500 shadow-sm focus:border-[color:var(--color-primary)] focus:ring-[color:var(--color-primary)]"
              placeholder={t('profile.password') as string}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowDeleteModal(false)} className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200">
                {t('profile.cancel')}
              </button>
              <button onClick={handleDeletePasswordAccount} className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700">
                {t('profile.confirm')}
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
        description={t('profile.disablePasswordWarning') as string}
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
          description={t('profile.deleteOAuthWarning') as string}
          confirmText={t('common.delete') as string}
          cancelText={t('common.cancel') as string}
          onConfirm={async () => {
            window.location.href = `${API_URL}/auth/${confirmDeleteOAuth.provider}/delete`;
          }}
        />
      )}
      </div>
    </SidebarLayout>
  );
};

export default ProfilePage; 