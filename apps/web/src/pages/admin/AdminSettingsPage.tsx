import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/admin/AdminLayout';
import { Settings, Bell, Eye, Shield, Save, CheckCircle } from 'lucide-react';

const AdminSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false,
    systemAlerts: true,
    userReports: true,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: false,
    adminMode: true,
  });

  const [systemSettings, setSystemSettings] = useState({
    autoApproveUsers: false,
    requireEmailVerification: true,
    enableTwoFactor: true,
    logAdminActions: true,
  });

  const [saved, setSaved] = useState(false);

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

  const handleSystemChange = (key: string, value: boolean) => {
    setSystemSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminLayout
      title={t('admin.settings')}
      subtitle={t('settings.title')}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Settings className="w-6 h-6 text-gray-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {saved ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {t('success.saved')}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {t('common.save')}
              </>
            )}
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Notifications Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Bell className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">{t('settings.notifications')}</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">{t('settings.emailNotifications')}</label>
                  <p className="text-sm text-gray-500">{t('settings.emailNotificationsDescription')}</p>
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
                  <label className="text-sm font-medium text-gray-900">{t('settings.pushNotifications')}</label>
                  <p className="text-sm text-gray-500">{t('settings.pushNotificationsDescription')}</p>
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
                  <label className="text-sm font-medium text-gray-900">{t('settings.marketingEmails')}</label>
                  <p className="text-sm text-gray-500">{t('settings.marketingEmailsDescription')}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.marketing}
                  onChange={(e) => handleNotificationChange('marketing', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">{t('settings.notifications')}</label>
                  <p className="text-sm text-gray-500">{t('settings.notifications')}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.systemAlerts}
                  onChange={(e) => handleNotificationChange('systemAlerts', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">{t('admin.users')}</label>
                  <p className="text-sm text-gray-500">{t('admin.users')}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.userReports}
                  onChange={(e) => handleNotificationChange('userReports', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Privacy Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Eye className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">{t('settings.privacy')}</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">{t('settings.profileVisibility')}</label>
                  <p className="text-sm text-gray-500">{t('settings.profileVisibilityDescription')}</p>
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
                  <label className="text-sm font-medium text-gray-900">{t('settings.showEmail')}</label>
                  <p className="text-sm text-gray-500">{t('settings.showEmailDescription')}</p>
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
                  <label className="text-sm font-medium text-gray-900">{t('settings.showPhone')}</label>
                  <p className="text-sm text-gray-500">{t('settings.showPhoneDescription')}</p>
                </div>
                <input
                  type="checkbox"
                  checked={privacy.showPhone}
                  onChange={(e) => handlePrivacyChange('showPhone', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">{t('admin.profile')}</label>
                  <p className="text-sm text-gray-500">{t('admin.profile')}</p>
                </div>
                <input
                  type="checkbox"
                  checked={privacy.adminMode}
                  onChange={(e) => handlePrivacyChange('adminMode', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* System Settings Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">{t('admin.settings')}</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">{t('adminUsers.admins')}</label>
                  <p className="text-sm text-gray-500">{t('adminUsers.admins')}</p>
                </div>
                <input
                  type="checkbox"
                  checked={systemSettings.autoApproveUsers}
                  onChange={(e) => handleSystemChange('autoApproveUsers', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">{t('settings.email')}</label>
                  <p className="text-sm text-gray-500">{t('settings.email')}</p>
                </div>
                <input
                  type="checkbox"
                  checked={systemSettings.requireEmailVerification}
                  onChange={(e) => handleSystemChange('requireEmailVerification', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">2FA</label>
                  <p className="text-sm text-gray-500">2FA</p>
                </div>
                <input
                  type="checkbox"
                  checked={systemSettings.enableTwoFactor}
                  onChange={(e) => handleSystemChange('enableTwoFactor', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">{t('adminUsers.admin')}</label>
                  <p className="text-sm text-gray-500">{t('adminUsers.admin')}</p>
                </div>
                <input
                  type="checkbox"
                  checked={systemSettings.logAdminActions}
                  onChange={(e) => handleSystemChange('logAdminActions', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage; 