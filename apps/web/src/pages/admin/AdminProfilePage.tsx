import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMe, deleteAccountWithPassword, disablePassword } from '../../services/authService';
import AdminLayout from '../../components/admin/AdminLayout';
import { Shield, User, Mail, Calendar, Settings, Trash2, AlertTriangle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const AdminProfilePage = () => {
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
      setError('Failed to fetch profile data.');
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
        alert('Account deleted successfully.');
        logout();
    } catch (err: any) {
        setError(err.response?.data?.message || "Failed to delete account.");
    } finally {
        setShowDeleteModal(false);
    }
  };

  const handleDisablePassword = async () => {
    if (window.confirm('Are you sure you want to disable password login? You will only be able to log in with your linked social accounts.')) {
        try {
            await disablePassword();
            await fetchProfile();
            setSuccessMessage('Password login disabled successfully.');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to disable password login.');
        }
    }
  };

  const linkAccount = (provider: 'google') => {
    window.location.href = `${API_URL}/auth/${provider}`;
  };

  const deleteOAuthAccount = (provider: 'google') => {
    const confirmed = window.confirm(`Are you sure you want to delete your account? You will be asked to re-authenticate with ${provider}.`);
    if (confirmed) {
        window.location.href = `${API_URL}/auth/${provider}/delete`;
    }
  };

  return (
    <AdminLayout
      title="Profil Administrateur"
      subtitle="Gérez votre profil administrateur"
    >
      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}
        
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Informations du profil</h2>
                <p className="text-gray-600">Détails de votre compte administrateur</p>
              </div>
            </div>

            {profileData && (
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{profileData.email}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Shield className="w-4 h-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Rôle</p>
                    <p className="font-medium">{profileData.role}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Membre depuis</p>
                    <p className="font-medium">
                      {new Date(profileData.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                {profileData.lastLoginAt && (
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Dernière connexion</p>
                      <p className="font-medium">
                        {new Date(profileData.lastLoginAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <Settings className="w-6 h-6 text-gray-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Paramètres du compte</h2>
            </div>

            {profileData && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Comptes liés</h3>
                  <div className="space-y-2">
                    {!profileData.linkedProviders.includes('google') && profileData.hasPassword && (
                      <button 
                        onClick={() => linkAccount('google')} 
                        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Lier avec Google
                      </button>
                    )}
                    
                    {profileData.linkedProviders.includes('google') && (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                        <span className="text-sm text-green-800">Google lié</span>
                        <button 
                          onClick={() => deleteOAuthAccount('google')}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {profileData.hasPassword && (
                  <div className="pt-4 border-t border-gray-200">
                    <button 
                      onClick={handleDisablePassword}
                      className="w-full px-4 py-2 border border-yellow-300 rounded-md shadow-sm text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                    >
                      Désactiver la connexion par mot de passe
                    </button>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <button 
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer le compte
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Supprimer le compte</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Cette action est irréversible. Toutes vos données seront supprimées définitivement.
                </p>
                <input
                  type="password"
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDeletePasswordAccount}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProfilePage; 