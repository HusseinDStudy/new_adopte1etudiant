import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentProfileSchema, StudentProfileInput } from 'shared-types';
import { getProfile, upsertProfile } from '../../services/profileService';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Field, Label } from '../form/Field';
import { Input } from '../ui/input';

const StudentProfileForm = () => {
  const { t } = useTranslation();
  const [error, setError] = useState('');

  const validSkillRegex = /^[a-zA-Z0-9\s+#.-]*$/;

  const skillValidation = z.string().refine(
    (value) => {
      const skills = value.split(',').map(s => s.trim());
      return skills.every(skill => validSkillRegex.test(skill) || skill === '');
    },
    {
      message: t('profileForm.skillsValidationError'),
    }
  );

  // Zod schema for the form data, where skills is a string
  const studentProfileFormSchema = studentProfileSchema.extend({
    skills: skillValidation,
    isOpenToOpportunities: z.boolean().optional(),
    cvUrl: z.string().url({ message: t('profileForm.cvUrlValidationError') }).optional().or(z.literal('')),
    isCvPublic: z.boolean().optional(),
  });

  // Type for the form data
  type StudentProfileFormData = z.infer<typeof studentProfileFormSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentProfileFormData>({
    resolver: zodResolver(studentProfileFormSchema),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await getProfile();
        if (profileData) {
          const formData = {
            ...profileData,
            skills: profileData.skills?.map((s: any) => s.skill.name).join(', ') || '',
          };
          reset(formData);
        }
      } catch (err) {
        setError(t('profileForm.failedToLoadProfile'));
        console.error(err);
      }
    };
    fetchProfile();
  }, [reset, t]);

  const onSubmit: SubmitHandler<StudentProfileFormData> = async (data) => {
    setError('');
    try {
      const transformedData: StudentProfileInput = {
        ...data,
        skills: data.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
        isOpenToOpportunities: data.isOpenToOpportunities,
      };
      
      const updatedProfile = await upsertProfile(transformedData);

      const updatedFormData = {
        ...updatedProfile,
        skills: updatedProfile.skills?.map((s: any) => s.skill.name).join(', ') || '',
      };
      
      reset(updatedFormData);
      alert(t('profileForm.profileSaved'));
    } catch (err) {
      setError(t('profileForm.failedToSaveProfile'));
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h3 className="text-lg font-medium leading-6 text-gray-900">{t('profileForm.studentProfile')}</h3>
      <p className="mt-1 text-sm text-gray-500">{t('profileForm.studentProfileDescription')}</p>
      
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
        <Field error={errors.firstName?.message} className="sm:col-span-3">{({ id, errorId }) => (
          <>
            <Label>{t('profileForm.firstName')}</Label>
            <Input id={id} uiSize="md" aria-invalid={!!errors.firstName} aria-describedby={[errorId].filter(Boolean).join(' ')} {...register('firstName')} />
          </>
        )}</Field>

        <Field error={errors.lastName?.message} className="sm:col-span-3">{({ id, errorId }) => (
          <>
            <Label>{t('profileForm.lastName')}</Label>
            <Input id={id} uiSize="md" aria-invalid={!!errors.lastName} aria-describedby={[errorId].filter(Boolean).join(' ')} {...register('lastName')} />
          </>
        )}</Field>
        
        <Field className="sm:col-span-4">{({ id }) => (
          <>
            <Label>{t('profileForm.school')}</Label>
            <Input id={id} uiSize="md" {...register('school')} />
          </>
        )}</Field>

        <Field className="sm:col-span-4">{({ id }) => (
          <>
            <Label>{t('profileForm.degree')}</Label>
            <Input id={id} uiSize="md" {...register('degree')} />
          </>
        )}</Field>

        <Field error={errors.skills?.message} className="sm:col-span-6">{({ id, errorId }) => (
          <>
            <Label>{t('profileForm.skills')}</Label>
            <Input id={id} uiSize="md" aria-invalid={!!errors.skills} aria-describedby={[errorId].filter(Boolean).join(' ')} {...register('skills')} />
          </>
        )}</Field>

        <Field error={errors.cvUrl?.message} className="sm:col-span-6">{({ id, errorId }) => (
          <>
            <Label>{t('profileForm.cvUrl')}</Label>
            <Input id={id} uiSize="md" aria-invalid={!!errors.cvUrl} aria-describedby={[errorId].filter(Boolean).join(' ')} {...register('cvUrl')} placeholder={t('profileForm.cvUrlPlaceholder') as string} />
          </>
        )}</Field>
      </div>

      <div className="relative mt-6 flex items-start">
        <div className="flex h-5 items-center">
          <input
            id="isCvPublic"
            {...register('isCvPublic')}
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="isCvPublic" className="font-medium text-gray-700">
            {t('profileForm.makeCvVisible')}
          </label>
          <p className="text-gray-500">
            {t('profileForm.makeCvVisibleDescription')}
          </p>
        </div>
      </div>

      <div className="relative mt-6 flex items-start">
        <div className="flex h-5 items-center">
          <input
            id="isOpenToOpportunities"
            aria-describedby="isOpenToOpportunities-description"
            {...register('isOpenToOpportunities')}
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="isOpenToOpportunities" className="font-medium text-gray-700">
            {t('profileForm.openToOpportunities')}
          </label>
          <p id="isOpenToOpportunities-description" className="text-gray-500">
            {t('profileForm.openToOpportunitiesDescription')}
          </p>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            {isSubmitting ? t('profileForm.saving') : t('profileForm.save')}
          </button>
        </div>
      </div>
    </form>
  );
};

export default StudentProfileForm; 