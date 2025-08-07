import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { companyProfileSchema, CompanyProfileInput } from 'shared-types';
import { getProfile, upsertProfile } from '../../services/profileService';
import { useTranslation } from 'react-i18next';

const CompanyProfileForm = () => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CompanyProfileInput>({
    resolver: zodResolver(companyProfileSchema),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        if (profile) {
          reset(profile);
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
      }
    };
    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: CompanyProfileInput) => {
    setMessage('');
    try {
      await upsertProfile(data);
      setMessage(t('profileForm.profileUpdated'));
    } catch (error) {
      setMessage(t('profileForm.failedToUpdateProfile'));
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">{t('profileForm.companyProfile')}</h3>
        <p className="mt-1 text-sm text-gray-600">
          {t('profileForm.companyProfileDescription')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            {t('profileForm.companyName')}
          </label>
          <input
            type="text"
            id="name"
            {...register('name')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div className="sm:col-span-4">
          <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
            {t('profileForm.contactEmail')}
          </label>
          <input
            type="email"
            id="contactEmail"
            {...register('contactEmail')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.contactEmail && <p className="mt-2 text-sm text-red-600">{errors.contactEmail.message}</p>}
        </div>
        
        <div className="sm:col-span-3">
          <label htmlFor="size" className="block text-sm font-medium text-gray-700">
            {t('profileForm.companySize')}
          </label>
          <input
            type="text"
            id="size"
            {...register('size')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="sector" className="block text-sm font-medium text-gray-700">
            {t('profileForm.sector')}
          </label>
          <input
            type="text"
            id="sector"
            {...register('sector')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      {message && <p className="text-sm text-green-600">{message}</p>}

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {isSubmitting ? t('profileForm.saving') : t('profileForm.save')}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CompanyProfileForm; 