import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import OfferListPage from './pages/OfferListPage';
import OfferDetailsPage from './pages/OfferDetailsPage';
import ManageOffersPage from './pages/company/ManageOffersPage';
import CreateOfferPage from './pages/company/CreateOfferPage';
import EditOfferPage from './pages/company/EditOfferPage';
import OfferApplicantsPage from './pages/company/OfferApplicantsPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import ApplicationThreadPage from './pages/ApplicationThreadPage';
import StudentDirectoryPage from './pages/StudentDirectoryPage';
import MyAdoptionRequestsPage from './pages/MyAdoptionRequestsPage';
import SentAdoptionRequestsPage from './pages/company/SentAdoptionRequestsPage';

// A simple layout for auth pages to share navigation
const AuthLayout = ({ children, isLogin }: { children: React.ReactNode, isLogin?: boolean }) => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
    {children}
    <div className="mt-4 text-center text-sm">
      {isLogin ? (
        <p>
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign up
          </Link>
        </p>
      ) : (
        <p>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      )}
    </div>
  </div>
);

// A generic dashboard page
const DashboardPage = () => {
  const { user } = useAuth();
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome, {user?.email}!</p>
      <p>Your role is: {user?.role}</p>
    </div>
  );
};

// TODO: Create placeholder pages for these routes
const HomePage = () => <div>Home Page</div>;

function App() {
  const { isAuthenticated, isLoading, logout, user } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <>
      <nav className="bg-gray-800 p-4 text-white">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">Adopte1Etudiant</Link>
          <div>
            <Link to="/offers" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">Offers</Link>
            {isAuthenticated ? (
              <>
                {user?.role === 'STUDENT' && (
                  <>
                    <Link to="/my-applications" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">My Applications</Link>
                    <Link to="/my-adoption-requests" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">Adoption Requests</Link>
                  </>
                )}
                {user?.role === 'COMPANY' && (
                  <>
                    <Link to="/company/offers" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">Manage Offers</Link>
                    <Link to="/students" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">Find Students</Link>
                    <Link to="/company/sent-requests" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-ray-700">Sent Requests</Link>
                  </>
                )}
                <Link to="/profile" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">Profile</Link>
                <button onClick={logout} className="ml-4 px-3 py-2 rounded-md text-sm font-medium bg-red-500 hover:bg-red-600">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">Login</Link>
            )}
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/offers" />} />
          <Route path="/offers" element={<OfferListPage />} />
          <Route path="/offers/:id" element={<OfferDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/my-applications" element={<MyApplicationsPage />} />
            <Route path="/applications/:id/thread" element={<ApplicationThreadPage />} />
            <Route path="/students" element={<StudentDirectoryPage />} />
            <Route path="/my-adoption-requests" element={<MyAdoptionRequestsPage />} />
            <Route path="/company/offers" element={<ManageOffersPage />} />
            <Route path="/company/offers/new" element={<CreateOfferPage />} />
            <Route path="/company/offers/edit/:id" element={<EditOfferPage />} />
            <Route path="/company/offers/:id/applications" element={<OfferApplicantsPage />} />
            <Route path="/company/sent-requests" element={<SentAdoptionRequestsPage />} />
          </Route>
        </Routes>
      </main>
    </>
  );
}

export default App; 