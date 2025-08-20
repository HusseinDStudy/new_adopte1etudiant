# Blog System and Admin Panel Guide

This document provides an overview of the integrated Blog System and the Admin Panel features within the "Adopte1Etudiant" platform, covering their functionalities and management.

## 1. Blog System Overview

The blog system allows for content creation, management, and display, providing a platform for sharing articles, news, and updates.

### Key Features

- **Featured Posts Carousel**: Highlights important articles on the homepage or dedicated sections.
- **Blog Listing Page**: Displays all blog posts with category filtering and pagination.
- **Individual Blog Post Page**: Dedicated page for each article, including related articles and social sharing options.
- **Content Management**: Supports rich text content for blog posts.

### Relevant Areas in Codebase

- **Frontend**: `apps/web/src/pages/blog/BlogPage.tsx`, `apps/web/src/pages/blog/BlogPostPage.tsx`
- **Backend**: Blog-related services and controllers in `apps/api/src/services/` and `apps/api/src/routes/`.
- **Database**: Prisma schema for `BlogCategory` and `BlogPost` models.

## 2. Admin Panel Overview

The Admin Panel provides centralized control over key aspects of the application, including user management, content moderation (for the blog), and analytics.

### Key Features

- **User Management**: 
  - View and manage user accounts (students and companies).
  - Filter users by active/inactive status.
  - `GET /api/admin/users`: List all users.
- **Content Moderation (Blog)**:
  - Create, edit, and delete blog posts and categories.
  - Manage offer visibility (only active offers for non-owners).
- **Analytics**: Displays key metrics and data related to platform usage (e.g., recent articles data).
  - `GET /api/admin/analytics`: Retrieve analytics data.
- **Broadcast Messaging**: Send messages to all students, all companies, or all users.
  - `POST /api/admin/messages/broadcast`: Send a new broadcast message.

### Relevant Areas in Codebase

- **Frontend**: `apps/web/src/pages/admin/` (e.g., `AdminAnalyticsPage.tsx`, `AdminUsersPage.tsx`, `AdminOffersPage.tsx`, `AdminProfilePage.tsx`)
- **Backend**: `apps/api/src/controllers/adminController.ts`, `apps/api/src/services/AdminService.ts`, and associated routes.
- **Database**: Prisma schema for `User` (admin role, active flags).

## 3. Implementation Details

### Admin Role and Access Control

- A new `ADMIN` role has been introduced in the database schema. Access to admin panel features and sensitive API endpoints is restricted to users with this role via role-based access control (`roleMiddleware`).

### Unified Admin Navigation

- The admin and dashboard sidebars have been unified into a shared component, improving UX consistency. Legacy admin header has been replaced with the shared header.

## 4. Usage Examples

### Fetching Blog Posts

```javascript
// Fetch all blog posts
const getBlogPosts = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await fetch(`/api/blog/posts?${params}`);
  return response.json();
};

// Fetch a specific blog post
const getBlogPost = async (slug) => {
  const response = await fetch(`/api/blog/posts/${slug}`);
  return response.json();
};
```

### Sending a Broadcast Message (Admin Only)

```javascript
// Send a broadcast message to all students
const sendBroadcast = async (message, targetRole = 'STUDENT') => {
  const response = await fetch('/api/admin/messages/broadcast', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Include admin authentication cookie/token
    },
    body: JSON.stringify({ content: message, targetRole })
  });
  return response.json();
};
```

### Managing Users (Admin Only)

```javascript
// Fetch all users
const getAllUsers = async () => {
  const response = await fetch('/api/admin/users', {
    headers: {
      // Include admin authentication cookie/token
    }
  });
  return response.json();
};

// Update user status (e.g., activate/deactivate)
const updateUserStatus = async (userId, isActive) => {
  const response = await fetch(`/api/admin/users/${userId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      // Include admin authentication cookie/token
    },
    body: JSON.stringify({ isActive })
  });
  return response.json();
};
```

## 5. Future Enhancements

- Detailed role-based permissions for admin actions.
- More advanced analytics and reporting features.
- Audit logs for all admin actions.

---
