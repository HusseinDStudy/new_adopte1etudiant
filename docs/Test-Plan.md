# Test Plan (Cahier de Recettes)

## 1. Introduction

This document outlines the test plan for the "AdopteUnEtudiant" application. Its purpose is to provide a structured set of test cases for performing manual User Acceptance Testing (UAT). This process, often referred to as a "cahier de recettes," ensures that all key features meet the specified requirements and function correctly from an end-user's perspective before a major release.

## 2. Scope

This test plan covers the manual verification of all major user stories and features of the web application (`apps/web`) and their interaction with the backend API (`apps/api`). It focuses on the end-to-end user experience.

## 3. Roles for Testing

*   **Student**: Represents a student user looking for opportunities.
*   **Company**: Represents a company user looking to hire students.

---

## 4. Test Cases

Each test case below should be executed by a human tester who will record the actual result and status.

### Test Suite: Onboarding & Authentication

| ID | User Story | Role | Test Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-001** | User Registration (Student) | (None) | 1. Go to Register page. <br/> 2. Select "Student" role. <br/> 3. Fill in valid user details. <br/> 4. Click "Register". | User is created and redirected to the "Complete Profile" page. | | |
| **TC-002** | User Registration (Company) | (None) | 1. Go to Register page. <br/> 2. Select "Company" role. <br/> 3. Fill in valid company details. <br/> 4. Click "Register". | User is created and redirected to the "Complete Profile" page. | | |
| **TC-003** | User Login | Student | 1. Go to Login page. <br/> 2. Enter valid student credentials. <br/> 3. Click "Login". | User is logged in and redirected to the offers page. The navbar shows the user's name and a "Logout" button. | | |
| **TC-004** | Invalid Login | Company | 1. Go to Login page. <br/> 2. Enter invalid credentials. <br/> 3. Click "Login". | An error message "Invalid credentials" is displayed. User remains on the login page. | | |
| **TC-005** | Logout | Student | 1. Log in as a student. <br/> 2. Click the "Logout" button in the navbar. | User is logged out and redirected to the login page. The navbar shows "Login" and "Register" buttons. | | |

### Test Suite: Student Features

| ID | User Story | Role | Test Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-101** | Complete Student Profile | Student | 1. Log in. <br/> 2. Go to the "Profile" page. <br/> 3. Add skills and a bio. <br/> 4. Click "Save". | A success message is shown. When the page is reloaded, the new information is still there. | | |
| **TC-102** | Search Offers | Student | 1. Log in. <br/> 2. Go to the "Offers" page. <br/> 3. Type "Developer" in the search bar. | The list of offers is filtered to show only those with "Developer" in the title or description. | | |
| **TC-103** | Apply for an Offer | Student | 1. Log in. <br/> 2. Go to an offer's detail page. <br/> 3. Click the "Apply" button. | A success message is shown. The button changes to "Applied". The application appears on the "My Applications" page with "Pending" status. | | |
| **TC-104** | View My Applications | Student | 1. Log in. <br/> 2. Apply to at least one offer. <br/> 3. Go to the "My Applications" page. | The page lists all offers the student has applied to, along with their current status. | | |
| **TC-105** | Accept Adoption Request | Student | 1. A company sends an adoption request. <br/> 2. Go to "My Adoption Requests". <br/> 3. Click "Accept" on the request. | The request status changes to "Accepted". A messaging thread with the company is now available. | | |

### Test Suite: Company Features

| ID | User Story | Role | Test Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-201** | Create a New Offer | Company | 1. Log in. <br/> 2. Go to "Manage Offers". <br/> 3. Click "Create New Offer". <br/> 4. Fill in all required fields. <br/> 5. Click "Publish". | The offer is created and appears in the "Manage Offers" list. It is also visible to students on the main offers page. | | |
| **TC-202** | Edit an Offer | Company | 1. Log in. <br/> 2. Go to "Manage Offers". <br/> 3. Click "Edit" on an existing offer. <br/> 4. Change the title. <br/> 5. Click "Save". | The offer's title is updated in the list and on the offer detail page. | | |
| **TC-203** | View Applicants | Company | 1. A student applies to one of your offers. <br/> 2. Go to "Manage Offers". <br/> 3. Click on the offer title to view applicants. | The page shows a list of students who have applied to that specific offer. | | |
| **TC-204** | Accept an Application | Company | 1. Go to the applicants page for an offer. <br/> 2. Click "Accept" for a student's application. | The application status changes to "Accepted". The student is notified. A messaging thread is now available. | | |
| **TC-205** | Search for Students | Company | 1. Log in. <br/> 2. Go to the "Student Directory" page. <br/> 3. Filter by the skill "React". | The directory is filtered to show only students who have "React" listed as a skill. | | |
| **TC-206** | Send Adoption Request | Company | 1. Go to a student's profile page from the directory. <br/> 2. Click "Send Adoption Request". | A success message is shown. The request appears on the "Sent Adoption Requests" page with "Pending" status. | | |

---

## 5. Test Environment

**Testing Environment**:
- **URL**: `http://localhost:5173`
- **Browser**: Google Chrome (Latest Version)
- **Data**: A clean database seeded with the `npm run db:seed` command.

---

## 6. Test Execution

The test cases should be executed in the order they are listed above. Each test case should be executed by a human tester who will record the actual result and status.

---

## 7. Test Results

The test results should be recorded in a structured format, such as a spreadsheet or a test management tool. The test results should include the test case ID, user story, role, test steps, expected result, actual result, and status (Pass/Fail).

---

## 8. Test Report

The test report should include a summary of the test results, a discussion of any issues encountered, and recommendations for further testing or improvements.

---

## 9. Test Closure

The test closure should include a review of the test results and a decision on whether the test plan was successful or not. If the test plan was not successful, the test closure should include recommendations for further testing or improvements. 