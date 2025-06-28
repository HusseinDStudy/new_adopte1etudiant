import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as authService from '../services/authService';

const CompleteRegistrationPage = () => {
    const [role, setRole] = useState<'STUDENT' | 'COMPANY'>('STUDENT');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();

    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    useEffect(() => {
        if (!token) {
            setError('No registration token found. Please try signing up again.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            setError('Registration token is missing.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const { user, token: authToken } = await authService.completeOauthRegistration(token, role);
            login(user, authToken);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to complete registration.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-md">
            <h1 className="text-2xl font-bold mb-4">Complete Your Registration</h1>
            {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="role" className="block text-gray-700 font-bold mb-2">
                        I am a:
                    </label>
                    <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value as 'STUDENT' | 'COMPANY')}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                        <option value="STUDENT">Student</option>
                        <option value="COMPANY">Company</option>
                    </select>
                </div>
                <button
                    type="submit"
                    disabled={loading || !token}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
                >
                    {loading ? 'Completing...' : 'Complete Registration'}
                </button>
            </form>
        </div>
    );
};

export default CompleteRegistrationPage; 