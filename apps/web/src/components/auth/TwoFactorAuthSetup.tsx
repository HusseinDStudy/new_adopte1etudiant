import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as authService from '../../services/authService';
import ConfirmDialog from '../ui/confirm-dialog';
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

  const [checking, setChecking] = useState(true);
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const me = await authService.getMe();
        const initial = (me as any)?.isTwoFactorEnabled;
        if (initial === true) {
          setIsTwoFactorEnabled(true);
          return;
        }

        // Fallback: probe verify endpoint with a dummy token and infer from error message
        try {
          await authService.verify2fa('000000');
          // This should not succeed; if it does, consider 2FA enabled
          setIsTwoFactorEnabled(true);
        } catch (e: any) {
          const message: string | undefined = e?.response?.data?.message;
          // When 2FA is NOT enabled (or no secret), the backend returns 400 with message '2FA not requested or secret not found'
          // When 2FA IS enabled, the backend returns 400 with message 'Invalid token or recovery code'
          if (typeof message === 'string') {
            const normalized = message.toLowerCase();
            if (normalized.includes('not requested') || normalized.includes('secret not found')) {
              setIsTwoFactorEnabled(false);
            } else if (normalized.includes('invalid token') || normalized.includes('recovery code')) {
              setIsTwoFactorEnabled(true);
            } else {
              // Unknown message: assume disabled rather than showing wrong state
              setIsTwoFactorEnabled(false);
            }
          } else {
            setIsTwoFactorEnabled(false);
          }
        }
      } catch (err) {
        setError(t('twoFactorAuth.couldNotFetchStatus'));
      } finally {
        setChecking(false);
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
      // Refresh user status to reflect 2FA enabled in subsequent checks
      try { await authService.getMe(); } catch (e) { console.warn('Silent refresh of getMe after 2FA enable failed'); }
    } catch (err) {
      setError(t('twoFactorAuth.invalidToken'));
    }
  };

  const [confirmDisable, setConfirmDisable] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const handleDisable = async () => {
    setError('');
    setDisableCode('');
    setConfirmDisable(true);
  };

  return (
    <div className="mt-8 rounded-lg border p-4">
      <h3 className="text-lg font-medium">{t('twoFactorAuth.title')}</h3>
      {error && <p className="my-2 text-red-500">{error}</p>}

      {checking ? (
        <p className="my-2 text-sm text-gray-500">{t('loading.loading')}</p>
      ) : isTwoFactorEnabled ? (
        <div>
          <p className="my-2 text-green-600">{t('twoFactorAuth.enabled')}</p>
          <button onClick={handleDisable} className="rounded bg-red-500 px-4 py-2 text-white">
            {t('twoFactorAuth.disable2FA')}
          </button>
          <ConfirmDialog
            open={confirmDisable}
            onOpenChange={(open) => setConfirmDisable(open)}
            title={t('twoFactorAuth.confirmDisable')}
            description={t('twoFactorAuth.enterCodeToDisable') as string}
            confirmText={t('common.confirm') as string}
            cancelText={t('common.cancel') as string}
            confirmDisabled={disableCode.length !== 6}
            
            onConfirm={async () => {
              try {
                setError('');
                await authService.disable2fa(disableCode);
                setIsTwoFactorEnabled(false);
                setToken('');
                setDisableCode('');
                // Refresh current user info silently
                try { await authService.getMe(); } catch (e) { console.warn('Silent refresh of getMe after 2FA disable failed'); }
              } catch (err) {
                setError(t('twoFactorAuth.invalidTokenDisable'));
              }
            }}
          />
          {confirmDisable && (
            <div className="mt-2">
              <label htmlFor="disable-code" className="mb-1 block text-sm font-medium text-gray-700">
                {t('twoFactorAuth.sixDigitCode')}
              </label>
              <input
                id="disable-code"
                inputMode="numeric"
                pattern="[0-9]*"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full rounded border p-2"
                placeholder={t('twoFactorAuth.sixDigitCode') as string}
              />
            </div>
          )}
        </div>
      ) : (
        <div>
          <p className="my-2">{t('twoFactorAuth.description')}</p>
          {!qrCodeUrl && (
            <button onClick={handleGenerateSecret} className="rounded bg-blue-500 px-4 py-2 text-white">
              {t('twoFactorAuth.enable2FA')}
            </button>
          )}

          {qrCodeUrl && !recoveryCodes.length && (
            <div className="mt-4">
              <p>{t('twoFactorAuth.step1')}</p>
              <img src={qrCodeUrl} alt="2FA QR Code" />
              <p className="mt-4">{t('twoFactorAuth.step2')}</p>
              <form onSubmit={handleVerifyToken} className="mt-2 flex items-center">
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="rounded border p-2"
                  placeholder={t('twoFactorAuth.sixDigitCode')}
                />
                <button type="submit" className="ml-2 rounded bg-green-500 px-4 py-2 text-white">
                  {t('twoFactorAuth.verifyAndEnable')}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {recoveryCodes.length > 0 && (
        <div className="mt-6 border-t p-4">
           <div className="mb-2 flex items-center justify-between">
            <div>
                <h4 className="text-md font-semibold text-orange-600">{t('twoFactorAuth.saveRecoveryCodes')}</h4>
                <p className="text-sm text-gray-600">
                    {t('twoFactorAuth.storeCodesSafely')}
                </p>
            </div>
             <button
              onClick={handleCopyCodes}
              title={t('twoFactorAuth.copyToClipboard')}
              className="rounded-md bg-gray-200 p-1.5 text-gray-700 hover:bg-gray-300 hover:text-gray-900"
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
          <ul className="grid grid-cols-2 gap-x-8 gap-y-2 rounded-md bg-gray-100 p-4 font-mono text-sm">
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