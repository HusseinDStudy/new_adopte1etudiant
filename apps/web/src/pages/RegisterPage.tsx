import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { extendedRegisterSchema, RegisterInput } from 'shared-types';
import { useTranslation } from 'react-i18next';
import { register as registerUser } from '../services/authService';
// Example usage of new Field primitives for one field (email) as reference
import { Field, Label } from '../components/form/Field';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Button } from '../components/ui/button';


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
  type StudentInput = Extract<RegisterInput, { role: 'STUDENT' }>;
  type CompanyInput = Extract<RegisterInput, { role: 'COMPANY' }>;
  const studentErrors = errors as unknown as FieldErrors<StudentInput>;
  const companyErrors = errors as unknown as FieldErrors<CompanyInput>;

  const onSubmit = async (data: RegisterInput) => {
    try {
      await registerUser(data);
      // On successful registration, redirect to login with a success message
      navigate('/login?status=registered');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || t('auth.registrationFailed');
      setError('root.serverError', { type: 'manual', message });
    }
  };

  return (
    <div className="flex min-h-[100dvh] min-h-[100svh] items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Adopte un Étudiant</h1>
          <p className="text-gray-600">{t('auth.createYourAccount')}</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
            {t('auth.register')}
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {errors.root?.serverError && (
              <p className="mb-4 text-center text-sm text-red-500">{errors.root.serverError.message}</p>
            )}

            <Field className="space-y-1">{({ id }) => (
              <>
                <Label>{t('auth.iAm')}</Label>
              <Select id={id} {...register('role')} uiSize="lg">
                  <option value="STUDENT">{t('auth.student')}</option>
                  <option value="COMPANY">{t('auth.company')}</option>
                </Select>
              </>
            )}</Field>

            <Field error={errors.email?.message} className="space-y-1">{({ id, errorId }) => (
              <>
                <Label>{t('auth.emailAddress')}</Label>
                <Input id={id} type="email" {...register('email')} placeholder={t('auth.enterYourEmail') as string} aria-invalid={!!errors.email} aria-describedby={[errorId].filter(Boolean).join(' ')} uiSize="lg" />
              </>
            )}</Field>

            <Field error={errors.password?.message} className="space-y-1">{({ id, errorId }) => (
              <>
                <Label>{t('auth.password')}</Label>
                <Input id={id} type="password" {...register('password')} placeholder={t('auth.enterYourPassword') as string} aria-invalid={!!errors.password} aria-describedby={[errorId].filter(Boolean).join(' ')} uiSize="lg" />
              </>
            )}</Field>

            {role === 'STUDENT' && (
              <>
                <Field error={studentErrors.firstName?.message} className="space-y-1">{({ id, errorId }) => (
                  <>
                    <Label>{t('forms.firstName')}</Label>
                    <Input id={id} type="text" {...register('firstName')} placeholder={t('forms.enterYourFirstName') as string} aria-invalid={!!studentErrors.firstName} aria-describedby={[errorId].filter(Boolean).join(' ')} uiSize="lg" />
                  </>
                )}</Field>
                <div>
                  <Field error={studentErrors.lastName?.message} className="space-y-1">{({ id, errorId }) => (
                    <>
                      <Label>{t('forms.lastName')}</Label>
                      <Input id={id} type="text" {...register('lastName')} placeholder={t('forms.enterYourLastName') as string} aria-invalid={!!studentErrors.lastName} aria-describedby={[errorId].filter(Boolean).join(' ')} uiSize="lg" />
                    </>
                  )}</Field>
                </div>
              </>
            )}

            {role === 'COMPANY' && (
              <>
                <Field error={companyErrors.name?.message} className="space-y-1">{({ id, errorId }) => (
                  <>
                    <Label>{t('profileForm.companyName')}</Label>
                    <Input id={id} type="text" {...register('name')} placeholder={t('forms.enterYourCompanyName') as string} aria-invalid={!!companyErrors.name} aria-describedby={[errorId].filter(Boolean).join(' ')} uiSize="lg" />
                  </>
                )}</Field>
                <div>
                  <Field error={companyErrors.contactEmail?.message} className="space-y-1">{({ id, errorId }) => (
                    <>
                      <Label>{t('profileForm.contactEmail')}</Label>
                      <Input id={id} type="email" {...register('contactEmail')} placeholder="contact@company.com" aria-invalid={!!companyErrors.contactEmail} aria-describedby={[errorId].filter(Boolean).join(' ')} uiSize="lg" />
                    </>
                  )}</Field>
                </div>
              </>
            )}

            <div>
              <Button type="submit" disabled={isSubmitting} size="lg" className="w-full">
                {isSubmitting ? t('loading.loading') : t('auth.register')}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t('auth.alreadyHaveAccount')} <a href="/login" className="font-medium text-blue-600 hover:text-blue-700">{t('auth.login')}</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 