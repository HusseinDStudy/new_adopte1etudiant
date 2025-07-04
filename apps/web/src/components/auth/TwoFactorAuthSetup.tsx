import React, { useState, useEffect } from 'react';
import * as authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const TwoFactorAuthSetup = () => {
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
        setError('Could not fetch 2FA status.');
      }
    };
    checkStatus();
  }, [user]);

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
      setError('Could not generate a new 2FA secret.');
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
      setError('Invalid token. Please try again.');
    }
  };

  const handleDisable = async () => {
    if (!window.confirm('Are you sure you want to disable 2FA? You will need to provide one last code.')) {
      return;
    }
    const userToken = prompt('Please enter your 6-digit authentication code to disable 2FA.');
    if (userToken) {
      try {
        setError('');
        await authService.disable2fa(userToken);
        setIsTwoFactorEnabled(false);
        setToken('');
      } catch (err) {
        setError('Invalid token. Could not disable 2FA.');
      }
    }
  };

  return (
    <div className="mt-8 p-4 border rounded-lg">
      <h3 className="text-lg font-medium">Two-Factor Authentication (2FA)</h3>
      {error && <p className="text-red-500 my-2">{error}</p>}

      {isTwoFactorEnabled ? (
        <div>
          <p className="text-green-600 my-2">2FA is currently enabled.</p>
          <button onClick={handleDisable} className="bg-red-500 text-white px-4 py-2 rounded">
            Disable 2FA
          </button>
        </div>
      ) : (
        <div>
          <p className="my-2">Strengthen your account security by enabling 2FA.</p>
          {!qrCodeUrl && (
            <button onClick={handleGenerateSecret} className="bg-blue-500 text-white px-4 py-2 rounded">
              Enable 2FA
            </button>
          )}

          {qrCodeUrl && !recoveryCodes.length && (
            <div className="mt-4">
              <p>1. Scan this QR code with your authenticator app (like Google Authenticator).</p>
              <img src={qrCodeUrl} alt="2FA QR Code" />
              <p className="mt-4">2. Enter the 6-digit code from your app below.</p>
              <form onSubmit={handleVerifyToken} className="flex items-center mt-2">
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="p-2 border rounded"
                  placeholder="6-digit code"
                />
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded ml-2">
                  Verify & Enable
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
                <h4 className="text-md font-semibold text-orange-600">Save Your Recovery Codes!</h4>
                <p className="text-sm text-gray-600">
                    Store these codes in a safe place.
                </p>
            </div>
             <button
              onClick={handleCopyCodes}
              title="Copy to clipboard"
              className="p-1.5 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 hover:text-gray-900"
            >
              <span className="sr-only">Copy to clipboard</span>
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