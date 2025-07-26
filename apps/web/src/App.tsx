import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import OfferListPage from './pages/OfferListPage';
import OfferDetailsPage from './pages/OfferDetailsPage';
import ManageOffersPage from './pages/company/ManageOffersPage';
import CreateOfferPage from './pages/company/CreateOfferPage';
import EditOfferPage from './pages/company/EditOfferPage';
import OfferApplicantsPage from './pages/company/OfferApplicantsPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import ConversationPage from './pages/ConversationPage';
import MyConversationsPage from './pages/MyConversationsPage';
import StudentDirectoryPage from './pages/StudentDirectoryPage';
import MyAdoptionRequestsPage from './pages/MyAdoptionRequestsPage';
import SentAdoptionRequestsPage from './pages/company/SentAdoptionRequestsPage';
import InviteStudentsPage from './pages/company/InviteStudentsPage';
import CompleteRegistrationPage from './pages/CompleteRegistrationPage';
import LinkAccountPage from './pages/LinkAccountPage';
import Verify2faPage from './pages/Verify2faPage';
import HomePage from './pages/HomePage';


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
                <Link to="/conversations" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">My Conversations</Link>
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
              <>
                <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">Login</Link>
                <Link to="/register" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/offers" element={<OfferListPage />} />
          <Route path="/offers/:id" element={<OfferDetailsPage />} />
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/complete-registration" element={<CompleteRegistrationPage />} />
          <Route path="/link-account" element={<LinkAccountPage />} />
          <Route path="/verify-2fa" element={<Verify2faPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/my-applications" element={<MyApplicationsPage />} />
            <Route path="/conversations" element={<MyConversationsPage />} />
            <Route path="/conversations/:conversationId" element={<ConversationPage />} />
            <Route path="/students" element={<StudentDirectoryPage />} />
            <Route path="/my-adoption-requests" element={<MyAdoptionRequestsPage />} />
            <Route path="/company/offers" element={<ManageOffersPage />} />
            <Route path="/company/offers/new" element={<CreateOfferPage />} />
            <Route path="/company/offers/edit/:id" element={<EditOfferPage />} />
            <Route path="/company/offers/:id/applications" element={<OfferApplicantsPage />} />
            <Route path="/company/offers/:id/invite-students" element={<InviteStudentsPage />} />
            <Route path="/company/sent-requests" element={<SentAdoptionRequestsPage />} />
          </Route>
        </Routes>
      </main>
    </>
  );
}

export default App; 