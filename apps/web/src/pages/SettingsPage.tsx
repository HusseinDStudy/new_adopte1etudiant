import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import SidebarLayout from '../components/SidebarLayout';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: false,
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    alert('Settings saved successfully!');
  };

  return (
    <SidebarLayout>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <div className="space-y-6">
          {/* Notifications Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Email Notifications</label>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={(e) => handleNotificationChange('email', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Push Notifications</label>
                  <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={(e) => handleNotificationChange('push', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Marketing Emails</label>
                  <p className="text-sm text-gray-500">Receive marketing and promotional emails</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.marketing}
                  onChange={(e) => handleNotificationChange('marketing', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Privacy Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Privacy</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Profile Visibility</label>
                  <p className="text-sm text-gray-500">Make your profile visible to other users</p>
                </div>
                <input
                  type="checkbox"
                  checked={privacy.profileVisible}
                  onChange={(e) => handlePrivacyChange('profileVisible', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Show Email</label>
                  <p className="text-sm text-gray-500">Display your email address on your profile</p>
                </div>
                <input
                  type="checkbox"
                  checked={privacy.showEmail}
                  onChange={(e) => handlePrivacyChange('showEmail', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Show Phone</label>
                  <p className="text-sm text-gray-500">Display your phone number on your profile</p>
                </div>
                <input
                  type="checkbox"
                  checked={privacy.showPhone}
                  onChange={(e) => handlePrivacyChange('showPhone', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Account Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Account</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-900">Email</label>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-900">Role</label>
                <p className="text-sm text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                  Delete Account
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default SettingsPage;
