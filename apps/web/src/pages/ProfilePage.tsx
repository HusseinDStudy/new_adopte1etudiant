import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StudentProfileForm from '../components/auth/StudentProfileForm';
import CompanyProfileForm from '../components/auth/CompanyProfileForm';
import { getMe, deleteAccountWithPassword, disablePassword } from '../services/authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const ProfilePage = () => {
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

  const linkAccount = (provider: 'google' | 'linkedin') => {
    window.location.href = `${API_URL}/auth/${provider}`;
  };

  const deleteOAuthAccount = (provider: 'google' | 'linkedin') => {
    const confirmed = window.confirm(`Are you sure you want to delete your account? You will be asked to re-authenticate with ${provider}.`);
    if (confirmed) {
        window.location.href = `${API_URL}/auth/${provider}/delete`;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Manage Your Profile</h1>
      {error && <p className="mt-4 text-red-500 bg-red-100 p-2 rounded">{error}</p>}
      {successMessage && <p className="mt-4 text-green-500 bg-green-100 p-2 rounded">{successMessage}</p>}
      <div className="mt-4">
        {user?.role === 'STUDENT' && <StudentProfileForm />}
        {user?.role === 'COMPANY' && <CompanyProfileForm />}
      </div>
      
      <div className="mt-8 p-4 border-t border-gray-200">
          <h2 className="text-xl font-semibold">Account Settings</h2>
          {profileData && (
              <div className="mt-4">
                  <p><strong>Email:</strong> {profileData.email}</p>
                  <p><strong>Role:</strong> {profileData.role}</p>

                  <div className="mt-4">
                      <h3 className="font-bold">Linked Accounts</h3>
                      {!profileData.linkedProviders.includes('google') && profileData.hasPassword && (
                          <button onClick={() => linkAccount('google')} className="mt-2 mr-2 bg-blue-500 text-white p-2 rounded">Link Google</button>
                      )}
                      {profileData.linkedProviders.length === 0 && !profileData.hasPassword && <p>No accounts linked.</p>}
                      {profileData.linkedProviders.map((p: string) => <span key={p} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">{p}</span>)}
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold">Login Methods</h3>
                    <ul className="mt-2 divide-y divide-gray-200">
                        {profileData.hasPassword && (
                            <li className="flex justify-between items-center py-2">
                                <span>Password Login</span>
                                {profileData.linkedProviders.length > 0 ? (
                                    <button
                                        onClick={handleDisablePassword}
                                        className="text-red-600 hover:text-red-800 font-medium"
                                    >
                                        Disable
                                    </button>
                                ) : (
                                    <span className="text-gray-500">Enabled</span>
                                )}
                            </li>
                        )}
                        {profileData.linkedProviders.includes('google') && (
                            <li className="flex justify-between items-center py-2">
                                <span>Google Login</span>
                                <span className="text-green-600">Enabled</span>
                            </li>
                        )}
                    </ul>
                  </div>
              </div>
          )}
      </div>

      <div className="mt-8 p-4 border-t border-red-300 bg-red-50">
          <h2 className="text-xl font-semibold text-red-800">Danger Zone</h2>
          <div className="mt-4">
              <p className="text-sm text-gray-600">
                  Deleting your account is permanent and cannot be undone.
              </p>
              {profileData?.hasPassword ? (
                 <button onClick={() => setShowDeleteModal(true)} className="mt-2 bg-red-600 text-white p-2 rounded">Delete Account</button>
              ) : (
                <>
                  {profileData?.linkedProviders.includes('google') &&
                    <button onClick={() => deleteOAuthAccount('google')} className="mt-2 mr-2 bg-red-600 text-white p-2 rounded">Delete with Google</button>
                  }
                </>
              )}
          </div>
      </div>
      
      {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg">
                  <h3 className="text-lg font-bold">Confirm Deletion</h3>
                  <p className="my-4">Please enter your password to delete your account.</p>
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-2 rounded w-full"
                    placeholder="Password"
                  />
                  <div className="mt-4 flex justify-end">
                      <button onClick={() => setShowDeleteModal(false)} className="mr-2 p-2 rounded bg-gray-200">Cancel</button>
                      <button onClick={handleDeletePasswordAccount} className="p-2 rounded bg-red-600 text-white">Confirm</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ProfilePage; 