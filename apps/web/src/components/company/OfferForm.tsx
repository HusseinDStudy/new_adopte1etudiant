import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOfferSchema, CreateOfferInput } from 'shared-types';
import { z } from 'zod';
import { Field, Label } from '../form/Field';
import { Input } from '../ui/input';

interface OfferFormProps {
  onSubmit: (data: CreateOfferInput) => void;
  defaultValues?: Partial<CreateOfferInput>;
  isSubmitting: boolean;
}

const OfferForm: React.FC<OfferFormProps> = ({ onSubmit, defaultValues, isSubmitting }) => {
  const { t } = useTranslation();

  const validSkillRegex = /^[a-zA-Z0-9\s+#.-]*$/;

  const skillValidation = z.string()
    .min(1, t('offerForm.validation.skillsRequired'))
    .refine(
      (value) => {
        const skills = value.split(',').map(s => s.trim());
        return skills.every(skill => validSkillRegex.test(skill));
      },
      {
        message: t('offerForm.validation.skillsInvalid'),
      }
    );

  // Zod schema for the form data, where skills is a string
  const offerFormSchema = createOfferSchema.extend({
    skills: skillValidation,
  });

  // Type for the form data
  type OfferFormData = z.infer<typeof offerFormSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OfferFormData>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      ...defaultValues,
      // Handle skills properly - they can be either strings or objects with name property
      skills: defaultValues?.skills ?
        (Array.isArray(defaultValues.skills) ?
          defaultValues.skills.map((skill: string | { name: string }) =>
            typeof skill === 'string' ? skill : (skill as { name: string }).name
          ).join(', ') :
          defaultValues.skills
        ) : '',
    },
  });

  const handleFormSubmit = (data: OfferFormData) => {
    const transformedData: CreateOfferInput = {
      ...data,
      skills: data.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
    };
    onSubmit(transformedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Field error={errors.title?.message} className="sm:col-span-4">{({ id, errorId }) => (
        <>
          <Label>{t('offerForm.offerTitle')}</Label>
          <Input id={id} uiSize="lg" aria-invalid={!!errors.title} aria-describedby={[errorId].filter(Boolean).join(' ')} {...register('title')} />
        </>
      )}</Field>

      <Field error={errors.description?.message} className="sm:col-span-6">{({ id, errorId }) => (
        <>
          <Label>{t('offerForm.description')}</Label>
          <textarea
            id={id}
            {...register('description')}
            rows={5}
            className="mt-1 block w-full rounded-md border border-neutral-200 p-3 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2"
            aria-invalid={!!errors.description}
            aria-describedby={[errorId].filter(Boolean).join(' ')}
          />
        </>
      )}</Field>

      <Field error={errors.location?.message} className="sm:col-span-3">{({ id, errorId }) => (
        <>
          <Label>{t('offerForm.location')}</Label>
          <Input id={id} uiSize="md" aria-invalid={!!errors.location} aria-describedby={[errorId].filter(Boolean).join(' ')} {...register('location')} />
        </>
      )}</Field>

      <Field error={errors.duration?.message} className="sm:col-span-3">{({ id, errorId }) => (
        <>
          <Label>{t('offerForm.duration')}</Label>
          <Input id={id} uiSize="md" aria-invalid={!!errors.duration} aria-describedby={[errorId].filter(Boolean).join(' ')} {...register('duration')} />
        </>
      )}</Field>

      <Field error={errors.skills?.message} className="sm:col-span-6">{({ id, errorId }) => (
        <>
          <Label>{t('offerForm.requiredSkills')}</Label>
          <Input id={id} uiSize="md" aria-invalid={!!errors.skills} aria-describedby={[errorId].filter(Boolean).join(' ')} {...register('skills')} />
        </>
      )}</Field>

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="ml-3 inline-flex justify-center rounded-md bg-[color:var(--color-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
          >
            {isSubmitting ? t('offerForm.saving') : t('offerForm.saveOffer')}
          </button>
        </div>
      </div>
    </form>
  );
};

export default OfferForm; 