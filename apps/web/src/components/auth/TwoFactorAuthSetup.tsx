import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const TwoFactorAuthSetup = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const me = await authService.getMe();
        setIsTwoFactorEnabled(me.isTwoFactorEnabled);
      } catch (err) {
        setError(t('twoFactorAuth.couldNotFetchStatus'));
      }
    };
    checkStatus();
  }, [user, t]);

  const handleCopyCodes = () => {
    const codesString = recoveryCodes.join('\n');
    navigator.clipboard.writeText(codesString);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
  };

  const handleGenerateSecret = async () => {
    try {
      setError('');
      const { qrCodeUrl } = await authService.generate2faSecret();
      setQrCodeUrl(qrCodeUrl);
    } catch (err) {
      setError(t('twoFactorAuth.couldNotGenerateSecret'));
    }
  };

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      const { recoveryCodes } = await authService.verify2fa(token);
      setRecoveryCodes(recoveryCodes);
      setIsTwoFactorEnabled(true);
      setQrCodeUrl(''); // Clear QR code
    } catch (err) {
      setError(t('twoFactorAuth.invalidToken'));
    }
  };

  const handleDisable = async () => {
    if (!window.confirm(t('twoFactorAuth.confirmDisable'))) {
      return;
    }
    const userToken = prompt(t('twoFactorAuth.enterCodeToDisable'));
    if (userToken) {
      try {
        setError('');
        await authService.disable2fa(userToken);
        setIsTwoFactorEnabled(false);
        setToken('');
      } catch (err) {
        setError(t('twoFactorAuth.invalidTokenDisable'));
      }
    }
  };

  return (
    <div className="mt-8 p-4 border rounded-lg">
      <h3 className="text-lg font-medium">{t('twoFactorAuth.title')}</h3>
      {error && <p className="text-red-500 my-2">{error}</p>}

      {isTwoFactorEnabled ? (
        <div>
          <p className="text-green-600 my-2">{t('twoFactorAuth.enabled')}</p>
          <button onClick={handleDisable} className="bg-red-500 text-white px-4 py-2 rounded">
            {t('twoFactorAuth.disable2FA')}
          </button>
        </div>
      ) : (
        <div>
          <p className="my-2">{t('twoFactorAuth.description')}</p>
          {!qrCodeUrl && (
            <button onClick={handleGenerateSecret} className="bg-blue-500 text-white px-4 py-2 rounded">
              {t('twoFactorAuth.enable2FA')}
            </button>
          )}

          {qrCodeUrl && !recoveryCodes.length && (
            <div className="mt-4">
              <p>{t('twoFactorAuth.step1')}</p>
              <img src={qrCodeUrl} alt="2FA QR Code" />
              <p className="mt-4">{t('twoFactorAuth.step2')}</p>
              <form onSubmit={handleVerifyToken} className="flex items-center mt-2">
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="p-2 border rounded"
                  placeholder={t('twoFactorAuth.sixDigitCode')}
                />
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded ml-2">
                  {t('twoFactorAuth.verifyAndEnable')}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {recoveryCodes.length > 0 && (
        <div className="mt-6 p-4 border-t">
           <div className="flex justify-between items-center mb-2">
            <div>
                <h4 className="text-md font-semibold text-orange-600">{t('twoFactorAuth.saveRecoveryCodes')}</h4>
                <p className="text-sm text-gray-600">
                    {t('twoFactorAuth.storeCodesSafely')}
                </p>
            </div>
             <button
              onClick={handleCopyCodes}
              title={t('twoFactorAuth.copyToClipboard')}
              className="p-1.5 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 hover:text-gray-900"
            >
              <span className="sr-only">{t('twoFactorAuth.copyToClipboard')}</span>
              {isCopied ? (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              )}
            </button>
          </div>
          <ul className="grid grid-cols-2 gap-x-8 gap-y-2 bg-gray-100 p-4 rounded-md font-mono text-sm">
            {recoveryCodes.map((code) => (
              <li key={code}>{code}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TwoFactorAuthSetup; 