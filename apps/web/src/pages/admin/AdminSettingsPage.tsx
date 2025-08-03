import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';
import { Settings, Bell, Eye, Shield, Save, CheckCircle } from 'lucide-react';

const AdminSettingsPage: React.FC = () => {
  const { user } = useAuth();
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
      title="Paramètres Administrateur"
      subtitle="Configurez vos préférences et paramètres système"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Settings className="w-6 h-6 text-gray-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {saved ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Sauvegardé
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </>
            )}
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Notifications Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Bell className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Notifications par email</label>
                  <p className="text-sm text-gray-500">Recevoir les notifications par email</p>
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
                  <label className="text-sm font-medium text-gray-900">Notifications push</label>
                  <p className="text-sm text-gray-500">Recevoir les notifications push dans le navigateur</p>
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
                  <label className="text-sm font-medium text-gray-900">Emails marketing</label>
                  <p className="text-sm text-gray-500">Recevoir les emails marketing et promotionnels</p>
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
                  <label className="text-sm font-medium text-gray-900">Alertes système</label>
                  <p className="text-sm text-gray-500">Recevoir les alertes système importantes</p>
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
                  <label className="text-sm font-medium text-gray-900">Rapports utilisateurs</label>
                  <p className="text-sm text-gray-500">Recevoir les notifications de rapports utilisateurs</p>
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
              <h2 className="text-xl font-semibold text-gray-900">Confidentialité</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Visibilité du profil</label>
                  <p className="text-sm text-gray-500">Rendre votre profil visible aux autres utilisateurs</p>
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
                  <label className="text-sm font-medium text-gray-900">Afficher l'email</label>
                  <p className="text-sm text-gray-500">Permettre aux autres de voir votre adresse email</p>
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
                  <label className="text-sm font-medium text-gray-900">Afficher le téléphone</label>
                  <p className="text-sm text-gray-500">Permettre aux autres de voir votre numéro de téléphone</p>
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
                  <label className="text-sm font-medium text-gray-900">Mode administrateur</label>
                  <p className="text-sm text-gray-500">Afficher les informations d'administration</p>
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
              <h2 className="text-xl font-semibold text-gray-900">Paramètres système</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Approbation automatique des utilisateurs</label>
                  <p className="text-sm text-gray-500">Approuver automatiquement les nouveaux utilisateurs</p>
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
                  <label className="text-sm font-medium text-gray-900">Vérification email obligatoire</label>
                  <p className="text-sm text-gray-500">Exiger la vérification de l'email pour l'inscription</p>
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
                  <label className="text-sm font-medium text-gray-900">Activer l'authentification à deux facteurs</label>
                  <p className="text-sm text-gray-500">Permettre l'utilisation de 2FA pour tous les utilisateurs</p>
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
                  <label className="text-sm font-medium text-gray-900">Journaliser les actions administrateur</label>
                  <p className="text-sm text-gray-500">Enregistrer toutes les actions administratives</p>
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