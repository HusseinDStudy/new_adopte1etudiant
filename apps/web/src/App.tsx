import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/routes/ProtectedRoute';
import GuestRoute from './components/routes/GuestRoute';
import RoleBasedRoute from './components/routes/RoleBasedRoute';
import DashboardRedirect from './components/dashboard/DashboardRedirect';
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
import SettingsPage from './pages/SettingsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import BlogPostList from './pages/admin/BlogPostList';
import BlogPostForm from './pages/admin/BlogPostForm';
import BlogCategoriesPage from './pages/admin/BlogCategoriesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminOffersPage from './pages/admin/AdminOffersPage';
import AdminMessagesPage from './pages/admin/AdminMessagesPage';
import AdminConversationPage from './pages/admin/AdminConversationPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import DashboardStudentPage from './pages/DashboardStudentPage';
import DashboardCompanyPage from './pages/DashboardCompanyPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import CookiesPage from './pages/CookiesPage';
import AboutPage from './pages/AboutPage';
import TeamPage from './pages/TeamPage';
import MissionsPage from './pages/MissionsPage';
import PartnersPage from './pages/PartnersPage';
import BlogPage from './pages/blog/BlogPage';
import BlogPostPage from './pages/blog/BlogPostPage';



function App() {
  const { isLoading } = useAuth();
  const location = useLocation();

  // Check if we're on a page that uses SidebarLayout (authenticated pages)
  const isSidebarPage = location.pathname.startsWith('/dashboard-') ||
                        location.pathname.startsWith('/profile') ||
                        location.pathname.startsWith('/settings') ||
                        location.pathname.startsWith('/conversations') ||
                        location.pathname.startsWith('/company/') ||
                        location.pathname.startsWith('/my-');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={isSidebarPage ? "" : "min-h-screen bg-gray-50"}>
      {/* Only show header for non-sidebar pages (public pages) */}
      {!isSidebarPage && <Header />}

      <main className={isSidebarPage ? "" : "pt-4 px-4 pb-8 max-w-7xl mx-auto"}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/offers" element={<OfferListPage />} />
          <Route path="/offers/:id" element={<OfferDetailsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/missions" element={<MissionsPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/cookies" element={<CookiesPage />} />

          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/complete-registration" element={<CompleteRegistrationPage />} />
          <Route path="/link-account" element={<LinkAccountPage />} />
          <Route path="/verify-2fa" element={<Verify2faPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardRedirect />} />
            <Route path="/dashboard-student" element={
              <RoleBasedRoute allowedRole="STUDENT">
                <DashboardStudentPage />
              </RoleBasedRoute>
            } />
            <Route path="/dashboard-company" element={
              <RoleBasedRoute allowedRole="COMPANY">
                <DashboardCompanyPage />
              </RoleBasedRoute>
            } />
            <Route path="/profile" element={
              <RoleBasedRoute allowedRoles={['STUDENT', 'COMPANY']}>
                <ProfilePage />
              </RoleBasedRoute>
            } />
            <Route path="/my-applications" element={
              <RoleBasedRoute allowedRole="STUDENT">
                <MyApplicationsPage />
              </RoleBasedRoute>
            } />
            <Route path="/conversations" element={
              <RoleBasedRoute allowedRoles={['STUDENT', 'COMPANY']}>
                <MyConversationsPage />
              </RoleBasedRoute>
            } />
            <Route path="/conversations/:conversationId" element={
              <RoleBasedRoute allowedRoles={['STUDENT', 'COMPANY']}>
                <ConversationPage />
              </RoleBasedRoute>
            } />
            <Route path="/students" element={
              <RoleBasedRoute allowedRole="COMPANY">
                <StudentDirectoryPage />
              </RoleBasedRoute>
            } />
            <Route path="/my-adoption-requests" element={
              <RoleBasedRoute allowedRole="STUDENT">
                <MyAdoptionRequestsPage />
              </RoleBasedRoute>
            } />
            <Route path="/company/offers" element={
              <RoleBasedRoute allowedRole="COMPANY">
                <ManageOffersPage />
              </RoleBasedRoute>
            } />
            <Route path="/company/offers/new" element={
              <RoleBasedRoute allowedRole="COMPANY">
                <CreateOfferPage />
              </RoleBasedRoute>
            } />
            <Route path="/company/offers/edit/:id" element={
              <RoleBasedRoute allowedRole="COMPANY">
                <EditOfferPage />
              </RoleBasedRoute>
            } />
            <Route path="/company/offers/:id/applications" element={
              <RoleBasedRoute allowedRole="COMPANY">
                <OfferApplicantsPage />
              </RoleBasedRoute>
            } />
            <Route path="/company/offers/:id/invite-students" element={
              <RoleBasedRoute allowedRole="COMPANY">
                <InviteStudentsPage />
              </RoleBasedRoute>
            } />
            <Route path="/company/sent-requests" element={
              <RoleBasedRoute allowedRole="COMPANY">
                <SentAdoptionRequestsPage />
              </RoleBasedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <RoleBasedRoute allowedRole="ADMIN">
                <AdminDashboard />
              </RoleBasedRoute>
            } />
            <Route path="/admin/blog" element={<Navigate to="/admin/blog/posts" replace />} />
            <Route path="/admin/blog/posts" element={
              <RoleBasedRoute allowedRole="ADMIN">
                <BlogPostList />
              </RoleBasedRoute>
            } />
            <Route path="/admin/blog/posts/new" element={
              <RoleBasedRoute allowedRole="ADMIN">
                <BlogPostForm />
              </RoleBasedRoute>
            } />
            <Route path="/admin/blog/posts/:id/edit" element={
              <RoleBasedRoute allowedRole="ADMIN">
                <BlogPostForm />
              </RoleBasedRoute>
            } />
            <Route path="/admin/blog/categories" element={
              <RoleBasedRoute allowedRole="ADMIN">
                <BlogCategoriesPage />
              </RoleBasedRoute>
            } />
            <Route path="/admin/users" element={
              <RoleBasedRoute allowedRole="ADMIN">
                <AdminUsersPage />
              </RoleBasedRoute>
            } />
            <Route path="/admin/offers" element={
              <RoleBasedRoute allowedRole="ADMIN">
                <AdminOffersPage />
              </RoleBasedRoute>
            } />
            <Route path="/admin/messages" element={
              <RoleBasedRoute allowedRole="ADMIN">
                <AdminMessagesPage />
              </RoleBasedRoute>
            } />
            <Route path="/admin/conversations/:conversationId" element={
              <RoleBasedRoute allowedRole="ADMIN">
                <AdminConversationPage />
              </RoleBasedRoute>
            } />
            <Route path="/admin/analytics" element={
              <RoleBasedRoute allowedRole="ADMIN">
                <AdminAnalyticsPage />
              </RoleBasedRoute>
            } />
            <Route path="/admin/profile" element={
              <RoleBasedRoute allowedRole="ADMIN">
                <AdminProfilePage />
              </RoleBasedRoute>
            } />
            <Route path="/admin/settings" element={
              <RoleBasedRoute allowedRole="ADMIN">
                <AdminSettingsPage />
              </RoleBasedRoute>
            } />

            <Route path="/settings" element={
              <RoleBasedRoute allowedRoles={['STUDENT', 'COMPANY']}>
                <SettingsPage />
              </RoleBasedRoute>
            } />
          </Route>
        </Routes>
      </main>

      {/* Only show footer for non-sidebar pages (public pages) */}
      {!isSidebarPage && <Footer />}
    </div>
  );
}

export default App; 