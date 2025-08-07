import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOfferSchema, CreateOfferInput } from 'shared-types';
import { z } from 'zod';

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
          defaultValues.skills.map(skill =>
            typeof skill === 'string' ? skill : (skill as any).name
          ).join(', ') :
          defaultValues.skills
        ) : '',
    },
  });

  const handleFormSubmit = (data: OfferFormData) => {
    const transformedData: CreateOfferInput = {
      ...data,
      skills: data.skills.split(',').map(s => s.trim()).filter(Boolean),
    };
    onSubmit(transformedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="sm:col-span-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          {t('offerForm.offerTitle')}
        </label>
        <input
          type="text"
          id="title"
          {...register('title')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div className="sm:col-span-6">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          {t('offerForm.description')}
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={5}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>}
      </div>

      <div className="sm:col-span-3">
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          {t('offerForm.location')}
        </label>
        <input
          type="text"
          id="location"
          {...register('location')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      
      <div className="sm:col-span-3">
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
          {t('offerForm.duration')}
        </label>
        <input
          type="text"
          id="duration"
          {...register('duration')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      
      <div className="sm:col-span-6">
        <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
          {t('offerForm.requiredSkills')}
        </label>
        <input
          type="text"
          id="skills"
          {...register('skills')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.skills && <p className="mt-2 text-sm text-red-600">{errors.skills.message}</p>}
      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            {isSubmitting ? t('offerForm.saving') : t('offerForm.saveOffer')}
          </button>
        </div>
      </div>
    </form>
  );
};

export default OfferForm; 