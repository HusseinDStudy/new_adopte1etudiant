import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import StudentProfileForm from '../components/auth/StudentProfileForm';
import CompanyProfileForm from '../components/auth/CompanyProfileForm';
import { getMe, deleteAccountWithPassword, disablePassword } from '../services/authService';
import TwoFactorAuthSetup from '../components/auth/TwoFactorAuthSetup';
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
  const { t } = useTranslation();

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

  const handleDisablePassword = async () => {
    if (window.confirm(t('profile.confirmDisablePassword'))) {
        try {
            await disablePassword();
            await fetchProfile();
            setSuccessMessage(t('profile.passwordLoginDisabled'));
        } catch (err: any) {
            setError(err.response?.data?.message || t('profile.failedToDisablePassword'));
        }
    }
  };

  const linkAccount = (provider: 'google') => {
    window.location.href = `${API_URL}/auth/${provider}`;
  };

  const deleteOAuthAccount = (provider: 'google') => {
    const confirmed = window.confirm(t('profile.confirmDeleteOAuth', { provider }));
    if (confirmed) {
        window.location.href = `${API_URL}/auth/${provider}/delete`;
    }
  };

  return (
    <SidebarLayout>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold">{t('profile.manageYourProfile')}</h1>
        {error && <p className="mt-4 text-red-500 bg-red-100 p-2 rounded">{error}</p>}
        {successMessage && <p className="mt-4 text-green-500 bg-green-100 p-2 rounded">{successMessage}</p>}
        <div className="mt-4">
          {user?.role === 'STUDENT' && <StudentProfileForm />}
          {user?.role === 'COMPANY' && <CompanyProfileForm />}
        </div>
      
      <div className="mt-8 p-4 border-t border-gray-200">
          <h2 className="text-xl font-semibold">{t('profile.accountSettings')}</h2>
          {profileData && (
              <div className="mt-4">
                  <p><strong>{t('profile.email')}:</strong> {profileData.email}</p>
                  <p><strong>{t('profile.role')}:</strong> {profileData.role}</p>

                  <div className="mt-4">
                      <h3 className="font-bold">{t('profile.linkedAccounts')}</h3>
                      {!profileData.linkedProviders.includes('google') && profileData.hasPassword && (
                                                      <button onClick={() => linkAccount('google')} className="mt-2 mr-2 bg-blue-500 text-white p-2 rounded">{t('profile.linkGoogle')}</button>
                      )}
                      {profileData.linkedProviders.length === 0 && !profileData.hasPassword && <p>{t('profile.noAccountsLinked')}</p>}
                      {profileData.linkedProviders.map((p: string) => <span key={p} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">{p}</span>)}
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold">{t('profile.loginMethods')}</h3>
                    <ul className="mt-2 divide-y divide-gray-200">
                        {profileData.hasPassword && (
                            <li className="flex justify-between items-center py-2">
                                <span>{t('profile.passwordLogin')}</span>
                                {profileData.linkedProviders.length > 0 ? (
                                    <button
                                        onClick={handleDisablePassword}
                                        className="text-red-600 hover:text-red-800 font-medium"
                                    >
                                        {t('profile.disable')}
                                    </button>
                                ) : (
                                    <span className="text-gray-500">{t('profile.enabled')}</span>
                                )}
                            </li>
                        )}
                        {profileData.linkedProviders.includes('google') && (
                            <li className="flex justify-between items-center py-2">
                                <span>{t('profile.googleLogin')}</span>
                                <span className="text-green-600">{t('profile.enabled')}</span>
                            </li>
                        )}
                    </ul>
                  </div>

                  <TwoFactorAuthSetup />
              </div>
          )}
      </div>

      <div className="mt-8 p-4 border-t border-red-300 bg-red-50">
          <h2 className="text-xl font-semibold text-red-800">{t('profile.dangerZone')}</h2>
          <div className="mt-4">
              <p className="text-sm text-gray-600">
                  {t('profile.deleteAccountWarning')}
              </p>
              {profileData?.hasPassword ? (
                 <button onClick={() => setShowDeleteModal(true)} className="mt-2 bg-red-600 text-white p-2 rounded">{t('profile.deleteAccount')}</button>
              ) : (
                <>
                  {profileData?.linkedProviders.includes('google') &&
                    <button onClick={() => deleteOAuthAccount('google')} className="mt-2 mr-2 bg-red-600 text-white p-2 rounded">{t('profile.deleteWithGoogle')}</button>
                  }
                </>
              )}
          </div>
      </div>
      
      {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg">
                  <h3 className="text-lg font-bold">{t('profile.confirmDeletion')}</h3>
                  <p className="my-4">{t('profile.enterPasswordToDelete')}</p>
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-2 rounded w-full"
                    placeholder={t('profile.password')}
                  />
                  <div className="mt-4 flex justify-end">
                      <button onClick={() => setShowDeleteModal(false)} className="mr-2 p-2 rounded bg-gray-200">{t('profile.cancel')}</button>
                      <button onClick={handleDeletePasswordAccount} className="p-2 rounded bg-red-600 text-white">{t('profile.confirm')}</button>
                  </div>
              </div>
          </div>
      )}
      </div>
    </SidebarLayout>
  );
};

export default ProfilePage; 