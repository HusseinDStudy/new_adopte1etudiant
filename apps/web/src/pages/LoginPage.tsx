import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from 'shared-types';
import { useTranslation } from 'react-i18next';
import * as authService from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';

const LoginPage = () => {
  const { setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isTwoFactorStep, setIsTwoFactorStep] = useState(false);
  const { t } = useTranslation();

  // Get the intended destination from location state, or default to home
  const from = (location.state as any)?.from?.pathname || '/';
  
  // Form for initial email/password login
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    setError: setLoginError,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  // Form for the 2FA token step
  const {
    register: register2fa,
    handleSubmit: handle2faSubmit,
    setError: set2faError,
    formState: { errors: twoFactorErrors, isSubmitting: is2faSubmitting },
  } = useForm<{ token: string }>({
    resolver: zodResolver(z.object({ token: z.string().min(6, t('auth.tokenMustBe6Digits')) })),
  });


  const onSubmit: SubmitHandler<LoginInput> = async (data) => {
    try {
      const response = await authService.login(data);
      if (response.twoFactorRequired) {
        setIsTwoFactorStep(true);
      } else {
        const user = await authService.getMe();
        setCurrentUser(user);
        navigate(from, { replace: true });
      }
    } catch (error) {
      setLoginError('root', { message: t('auth.invalidEmailOrPassword') });
    }
  };

  const onTwoFactorSubmit: SubmitHandler<{ token: string }> = async (data) => {
    try {
      await authService.login2fa(data.token);
      const user = await authService.getMe();
      setCurrentUser(user);
      navigate(from, { replace: true });
    } catch (error) {
      set2faError('root', { message: t('auth.invalid2FAToken') });
    }
  };

  return (
    <div className="min-h-[100dvh] min-h-[100svh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {!isTwoFactorStep ? (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Adopte un Étudiant</h1>
              <p className="text-gray-600">{t('auth.signInToYourAccount')}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-center text-2xl font-bold text-gray-900 mb-6">
              {t('auth.login')}
            </h2>
            {from !== '/' && (
              <p className="mt-2 text-center text-sm text-gray-600">
                {t('auth.pleaseSignInToAccess')}
              </p>
            )}
            <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit(onSubmit)}>
              <input type="hidden" name="remember" value="true" />
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="email-address" className="sr-only">{t('auth.emailAddress')}</label>
                  <input
                    id="email-address"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder={t('auth.enterYourEmail')}
                    {...registerLogin('email')}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">{t('auth.password')}</label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder={t('auth.enterYourPassword')}
                    {...registerLogin('password')}
                  />
                </div>
              </div>

              {loginErrors.root && (
                <p className="mt-2 text-sm text-red-600">{loginErrors.root.message}</p>
              )}
               {loginErrors.email && (
                <p className="mt-2 text-sm text-red-600">{loginErrors.email.message}</p>
              )}
               {loginErrors.password && (
                <p className="mt-2 text-sm text-red-600">{loginErrors.password.message}</p>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoginSubmitting}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isLoginSubmitting ? t('loading.loading') : t('auth.signIn')}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">{t('auth.orContinueWith')}</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3">
                <div>
                  <a
                    href={`${import.meta.env.VITE_API_URL}/auth/google`}
                    className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
                  >
                    <span className="sr-only">{t('auth.loginWithGoogle')}</span>
                    <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.99 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      <path d="M1 1h22v22H1z" fill="none"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Adopte un Étudiant</h1>
              <p className="text-gray-600">{t('auth.twoFactorAuthentication')}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-center text-2xl font-bold text-gray-900 mb-6">
              {t('auth.enterVerificationCode')}
            </h2>
            <form className="space-y-6" onSubmit={handle2faSubmit(onTwoFactorSubmit)}>
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="token" className="sr-only">{t('auth.verificationCode')}</label>
                  <input
                    id="token"
                    type="text"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder={t('twoFactorAuth.sixDigitCode')}
                    {...register2fa('token')}
                  />
                </div>
              </div>
               {twoFactorErrors.root && (
                <p className="mt-2 text-sm text-red-600">{twoFactorErrors.root.message}</p>
              )}
              {twoFactorErrors.token && (
                <p className="mt-2 text-sm text-red-600">{twoFactorErrors.token.message}</p>
              )}
              <div>
                <button
                  type="submit"
                  disabled={is2faSubmitting}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {is2faSubmitting ? t('loading.loading') : t('auth.verify')}
                </button>
              </div>
            </form>
            </div>
          </div>
        )}
        <div className="text-sm text-center">
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700">
              {t('auth.dontHaveAccountYet')} {t('auth.createAccount')}
            </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 