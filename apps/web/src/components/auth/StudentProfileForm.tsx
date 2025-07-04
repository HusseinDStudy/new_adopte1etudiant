import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentProfileSchema, StudentProfileInput } from 'shared-types';
import { getProfile, upsertProfile } from '../../services/profileService';
import { z } from 'zod';

const validSkillRegex = /^[a-zA-Z0-9\s\+#\.\-]*$/;

const skillValidation = z.string().refine(
  (value) => {
    const skills = value.split(',').map(s => s.trim());
    return skills.every(skill => validSkillRegex.test(skill) || skill === '');
  },
  {
    message: "Skills can only contain letters, numbers, spaces, and '+', '#', '.', '-'. Please remove any invalid characters.",
  }
);

// Zod schema for the form data, where skills is a string
const studentProfileFormSchema = studentProfileSchema.extend({
  skills: skillValidation,
  isOpenToOpportunities: z.boolean().optional(),
});

// Type for the form data
type StudentProfileFormData = z.infer<typeof studentProfileFormSchema>;

const StudentProfileForm = () => {
  const [error, setError] = useState('');
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
        setError('Failed to load profile.');
        console.error(err);
      }
    };
    fetchProfile();
  }, [reset]);

  const onSubmit: SubmitHandler<StudentProfileFormData> = async (data) => {
    setError('');
    try {
      const transformedData: StudentProfileInput = {
        ...data,
        skills: data.skills.split(',').map(s => s.trim()).filter(Boolean),
        isOpenToOpportunities: data.isOpenToOpportunities,
      };
      
      const updatedProfile = await upsertProfile(transformedData);

      const updatedFormData = {
        ...updatedProfile,
        skills: updatedProfile.skills?.map((s: any) => s.skill.name).join(', ') || '',
      };
      
      reset(updatedFormData);
      alert('Profile saved successfully!');
    } catch (err) {
      setError('Failed to save profile.');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h3 className="text-lg font-medium leading-6 text-gray-900">Student Profile</h3>
      <p className="mt-1 text-sm text-gray-500">Update your personal and academic information.</p>
      
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First name
          </label>
          <input
            type="text"
            id="firstName"
            {...register('firstName')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          {errors.firstName && <p className="mt-2 text-sm text-red-600">{errors.firstName.message}</p>}
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last name
          </label>
          <input
            type="text"
            id="lastName"
            {...register('lastName')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          {errors.lastName && <p className="mt-2 text-sm text-red-600">{errors.lastName.message}</p>}
        </div>
        
        <div className="sm:col-span-4">
          <label htmlFor="school" className="block text-sm font-medium text-gray-700">
            School
          </label>
          <input
            type="text"
            id="school"
            {...register('school')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div className="sm:col-span-4">
          <label htmlFor="degree" className="block text-sm font-medium text-gray-700">
            Degree
          </label>
          <input
            type="text"
            id="degree"
            {...register('degree')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
            Skills (comma-separated)
          </label>
          <input
            type="text"
            id="skills"
            {...register('skills')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          {errors.skills && <p className="mt-2 text-sm text-red-600">{errors.skills?.message}</p>}
        </div>
      </div>

      <div className="relative flex items-start mt-6">
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
            Open to opportunities
          </label>
          <p id="isOpenToOpportunities-description" className="text-gray-500">
            Allow companies to find your profile and contact you directly.
          </p>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default StudentProfileForm; 