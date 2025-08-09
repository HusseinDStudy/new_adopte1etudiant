import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { extendedRegisterSchema, RegisterInput } from 'shared-types';
import { useTranslation } from 'react-i18next';
import { register as registerUser } from '../services/authService';


const RegisterPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterInput>({
    resolver: zodResolver(extendedRegisterSchema),
    defaultValues: {
      role: 'STUDENT',
    },
  });

  const role = watch('role');

  const onSubmit = async (data: RegisterInput) => {
    try {
      await registerUser(data);
      // On successful registration, redirect to login with a success message
      navigate('/login?status=registered');
    } catch (err: any) {
      setError('root.serverError', {
        type: 'manual',
        message: err.response?.data?.message || t('auth.registrationFailed')
      });
    }
  };

  return (
    <div className="min-h-[100dvh] min-h-[100svh] bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Adopte un Étudiant</h1>
          <p className="text-gray-600">{t('auth.createYourAccount')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-6">
            {t('auth.register')}
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {errors.root?.serverError && (
              <p className="mb-4 text-center text-sm text-red-500">{errors.root.serverError.message}</p>
            )}

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">{t('auth.iAm')}</label>
              <select
                id="role"
                {...register('role')}
                className="block w-full rounded-lg border-gray-300 py-3 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm transition-colors"
              >
                <option value="STUDENT">{t('auth.student')}</option>
                <option value="COMPANY">{t('auth.company')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">{t('auth.emailAddress')}</label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 transition-colors"
                placeholder={t('auth.enterYourEmail')}
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">{t('auth.password')}</label>
              <input
                id="password"
                type="password"
                {...register('password')}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 transition-colors"
                placeholder={t('auth.enterYourPassword')}
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
            </div>

            {role === 'STUDENT' && (
              <>
                <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">{t('forms.name')}</label>
                  <input
                    id="firstName"
                    type="text"
                    {...register('firstName')}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 transition-colors"
                placeholder={t('forms.name')}
                  />
                  {(errors as any).firstName && <p className="mt-1 text-sm text-red-500">{(errors as any).firstName.message}</p>}
                </div>
                <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">{t('forms.name')}</label>
                  <input
                    id="lastName"
                    type="text"
                    {...register('lastName')}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 transition-colors"
                placeholder={t('forms.name')}
                  />
                  {(errors as any).lastName && <p className="mt-1 text-sm text-red-500">{(errors as any).lastName.message}</p>}
                </div>
              </>
            )}

            {role === 'COMPANY' && (
              <>
                <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">{t('profileForm.companyName')}</label>
                  <input
                    id="name"
                    type="text"
                    {...register('name')}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 transition-colors"
                placeholder={t('profileForm.companyName')}
                  />
                  {(errors as any).name && <p className="mt-1 text-sm text-red-500">{(errors as any).name.message}</p>}
                </div>
                <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">{t('profileForm.contactEmail')}</label>
                  <input
                    id="contactEmail"
                    type="email"
                    {...register('contactEmail')}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 transition-colors"
                placeholder="contact@company.com"
                  />
                  {(errors as any).contactEmail && <p className="mt-1 text-sm text-red-500">{(errors as any).contactEmail.message}</p>}
                </div>
              </>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 hover:shadow-xl"
              >
                {isSubmitting ? t('loading.loading') : t('auth.register')}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t('auth.alreadyHaveAccount')} <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">{t('auth.login')}</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 