import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { completeLink } from '../services/authService';

const LinkAccountPage = () => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const location = useLocation();

    const token = new URLSearchParams(location.search).get('token');

    useEffect(() => {
        if (!token) {
            navigate('/profile', { state: { error: 'Invalid linking request.' } });
        }
    }, [token, navigate]);

    const handleChoice = async (choice: 'google_only' | 'keep_both') => {
        if (!token) return;
        setIsLoading(true);
        setError(null);
        try {
            await completeLink(token, choice);
            navigate('/profile', { state: { message: 'Account linked successfully! Your login options have been updated.' } });
        } catch (err: any) {
            setError(err.response?.data?.message || 'An unexpected error occurred.');
            setIsLoading(false);
        }
    };

    if (!token) {
        return null; // Or a loading spinner, or a message
    }

    return (
        <div className="min-h-[100dvh] bg-gray-50 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Link Your Google Account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    You're about to link a new Google account. Choose how you'd like to log in from now on.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 space-y-6">
                    {error && <p className="text-red-500 text-center">{error}</p>}

                    <div>
                        <button
                            onClick={() => handleChoice('google_only')}
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {isLoading ? 'Processing...' : 'Use Google Login Only (Removes Password)'}
                        </button>
                        <p className="mt-2 text-xs text-gray-500 text-center">
                            Choose this to simplify your login. You will no longer be able to sign in with your password.
                        </p>
                    </div>

                    <div>
                        <button
                            onClick={() => handleChoice('keep_both')}
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {isLoading ? 'Processing...' : 'Keep Password and Add Google Login'}
                        </button>
                        <p className="mt-2 text-xs text-gray-500 text-center">
                            You will be able to log in with either your existing password or your Google account.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LinkAccountPage; 