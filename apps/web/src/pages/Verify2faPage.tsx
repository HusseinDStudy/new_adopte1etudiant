import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as authService from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const twoFactorSchema = z.object({
  token: z.string().length(6, 'Token must be 6 digits'),
});

type TwoFactorInput = z.infer<typeof twoFactorSchema>;

const Verify2faPage = () => {
  const { setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TwoFactorInput>({
    resolver: zodResolver(twoFactorSchema),
  });

  const onSubmit: SubmitHandler<TwoFactorInput> = async (data) => {
    try {
      await authService.login2fa(data.token);
      const user = await authService.getMe();
      setCurrentUser(user);
      navigate('/profile'); // Redirect after successful login
    } catch (error) {
      setError('root', { message: 'Invalid 2FA token' });
    }
  };

  return (
    <div className="min-h-[100dvh] min-h-[100svh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Enter Authentication Code
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
                Check your authenticator app for the 6-digit code.
            </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="token" className="sr-only">2FA Token</label>
              <input
                id="token"
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="6-digit code"
                {...register('token')}
              />
            </div>
          </div>
            {errors.root && (
            <p className="mt-2 text-sm text-red-600 text-center">{errors.root.message}</p>
            )}
            {errors.token && (
            <p className="mt-2 text-sm text-red-600 text-center">{errors.token.message}</p>
            )}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isSubmitting ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Verify2faPage; 