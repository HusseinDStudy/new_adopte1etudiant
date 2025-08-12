import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CompleteOauthInput, completeOauthSchema } from 'shared-types';
import { useAuth } from '../context/AuthContext';
import * as authService from '../services/authService';

const CompleteRegistrationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentUser } = useAuth();
  
  const token = new URLSearchParams(location.search).get('token');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CompleteOauthInput>({
    resolver: zodResolver(completeOauthSchema),
    defaultValues: {
      role: 'STUDENT',
    },
  });

  const role = watch('role');

  const onSubmit = async (data: CompleteOauthInput) => {
    if (!token) {
      setError('root.serverError', {
        type: 'manual',
        message: 'Registration token is missing or has expired. Please try signing up again.',
      });
      return;
    }
    try {
      const { user } = await authService.completeOauthRegistration(token, data);
      setCurrentUser(user);
      navigate('/');
    } catch (err: any) {
      setError('root.serverError', {
        type: 'manual',
        message: err.response?.data?.message || 'Failed to complete registration.',
      });
    }
  };

  if (!token) {
    return (
      <div className="container mx-auto max-w-md p-4 text-center">
        <h1 className="mb-4 text-2xl font-bold">Registration Error</h1>
        <p className="rounded bg-red-100 p-3 text-red-500">
          Registration token is missing or has expired. Please try signing up again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Complete Your Registration
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-lg bg-white px-4 py-8 shadow sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {errors.root?.serverError && (
              <p className="mb-4 text-center text-sm text-red-500">{errors.root.serverError.message}</p>
            )}

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">I am a</label>
              <select
                id="role"
                {...register('role')}
                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              >
                <option value="STUDENT">Student</option>
                <option value="COMPANY">Company</option>
              </select>
            </div>

            {role === 'STUDENT' && (
              <>
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    id="firstName"
                    type="text"
                    {...register('firstName')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {(errors as any).firstName && <p className="mt-1 text-sm text-red-500">{(errors as any).firstName.message}</p>}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    {...register('lastName')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {(errors as any).lastName && <p className="mt-1 text-sm text-red-500">{(errors as any).lastName.message}</p>}
                </div>
              </>
            )}

            {role === 'COMPANY' && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Company Name</label>
                  <input
                    id="name"
                    type="text"
                    {...register('name')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {(errors as any).name && <p className="mt-1 text-sm text-red-500">{(errors as any).name.message}</p>}
                </div>
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">Contact Email</label>
                  <input
                    id="contactEmail"
                    type="email"
                    {...register('contactEmail')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {(errors as any).contactEmail && <p className="mt-1 text-sm text-red-500">{(errors as any).contactEmail.message}</p>}
                </div>
              </>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Completing...' : 'Complete Registration'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteRegistrationPage; 