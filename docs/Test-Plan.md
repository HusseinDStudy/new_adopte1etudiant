# Test Plan (Cahier de Recettes)

This document outlines the test scenarios for manual acceptance testing of the AdopteUnEtudiant platform. The goal is to verify that all core functionalities work as expected and meet the user requirements.

**Testing Environment**:
- **URL**: `http://localhost:5173`
- **Browser**: Google Chrome (Latest Version)
- **Data**: A clean database seeded with the `npm run db:seed` command.

---

## 1. User Authentication

| Test ID | Scenario                             | Steps to Reproduce                                                                                                                              | Expected Result                                                                                                  | Status (Pass/Fail) |
| :------ | :----------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- | :----------------- |
| **AUTH-01** | Student Registration (Success)       | 1. Go to Register page. <br> 2. Select "Student" role. <br> 3. Fill in valid details. <br> 4. Click "Register".                                   | User is created and redirected to the "Complete Profile" page.                                                   |                    |
| **AUTH-02** | Company Registration (Success)       | 1. Go to Register page. <br> 2. Select "Company" role. <br> 3. Fill in valid details. <br> 4. Click "Register".                                   | User is created and redirected to the "Complete Profile" page.                                                   |                    |
| **AUTH-03** | Registration with Existing Email     | 1. Attempt to register with an email that is already in the database.                                                                           | An error message "Email already in use" is displayed.                                                            |                    |
| **AUTH-04** | User Login (Success)                 | 1. Go to Login page. <br> 2. Enter valid credentials for a Student. <br> 3. Click "Login".                                                          | User is logged in and redirected to the Offer List page. The navbar shows authenticated user options.          |                    |
| **AUTH-05** | User Login (Incorrect Password)      | 1. Go to Login page. <br> 2. Enter a valid email but an incorrect password.                                                                     | An error message "Invalid credentials" is displayed.                                                             |                    |
| **AUTH-06** | User Logout                          | 1. Log in as any user. <br> 2. Click the "Logout" button in the navigation bar.                                                                 | User is logged out and redirected to the homepage. The navbar reverts to the unauthenticated state.            |                    |

---

## 2. Profile Management

| Test ID | Scenario                         | Steps to Reproduce                                                                                                   | Expected Result                                                                                     | Status (Pass/Fail) |
| :------ | :------------------------------- | :------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- | :----------------- |
| **PROF-01** | Student Completes Profile      | 1. Log in as a new student. <br> 2. Fill in all fields in the "Complete Profile" form, including comma-separated skills. | Profile is saved successfully. When revisiting the page, the information is correctly pre-filled. |                    |
| **PROF-02** | Company Completes Profile      | 1. Log in as a new company. <br> 2. Fill in all fields in the "Complete Profile" form.                                   | Profile is saved successfully. When revisiting the page, the information is correctly pre-filled. |                    |
| **PROF-03** | Student Edits Profile          | 1. Log in as a student with a completed profile. <br> 2. Go to "Profile" page. <br> 3. Update a field. <br> 4. Save.      | The information is updated successfully.                                                            |                    |

---

## 3. Offer & Application Workflow

| Test ID | Scenario                         | Steps to Reproduce                                                                                                                                        | Expected Result                                                                                                                                  | Status (Pass/Fail) |
| :------ | :------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- | :----------------- |
| **OFF-01**  | Company Creates Offer          | 1. Log in as a Company. <br> 2. Go to "Manage Offers" -> "Create Offer". <br> 3. Fill in all fields. <br> 4. Publish.                                           | The new offer appears in the "Manage Offers" list and is visible on the main "Offer List" page for students.                                   |                    |
| **OFF-02**  | Student Views and Applies      | 1. Log in as a Student. <br> 2. Find the offer created in OFF-01. <br> 3. Click "Apply Now".                                                                  | A success message "Application sent!" is shown. The application appears in the student's "My Applications" page with "Pending" status.       |                    |
| **OFF-03**  | Company Views Applicants       | 1. Log in as the Company from OFF-01. <br> 2. Go to "Manage Offers" -> "View Applicants" for the relevant offer.                                              | The student from OFF-02 is listed as an applicant. The student's name and profile link are visible.                                            |                    |
| **OFF-04**  | Company Changes App Status     | 1. On the "Applicants" page, find the student's application. <br> 2. Change the status dropdown to "Accepted".                                               | The status is updated in the UI.                                                                                                                 |                    |
| **OFF-05**  | Student Sees Updated Status    | 1. Log in as the Student from OFF-02. <br> 2. Go to "My Applications" page.                                                                                  | The status for the application now shows "Accepted".                                                                                             |                    |

---

## 4. Messaging

| Test ID | Scenario                             | Steps to Reproduce                                                                                                                            | Expected Result                                                                                                | Status (Pass/Fail) |
| :------ | :----------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- | :----------------- |
| **MSG-01**  | Company Sends Message to Applicant | 1. Log in as a Company. <br> 2. Go to an application thread by clicking on an applicant's name. <br> 3. Type a message and click "Send".            | The message appears instantly in the chat history.                                                             |                    |
| **MSG-02**  | Student Receives & Replies       | 1. Log in as the Student from MSG-01. <br> 2. Go to "My Applications" and click on the application to view the thread. <br> 3. Type and send a reply. | The company's message is visible. The student's reply appears instantly in the chat history.                 |                    |

---

## 5. Student Directory & Adoption

| Test ID | Scenario                           | Steps to Reproduce                                                                                                           | Expected Result                                                                                                | Status (Pass/Fail) |
| :------ | :--------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- | :----------------- |
| **DIR-01**  | Company Searches for Student     | 1. Log in as a Company. <br> 2. Go to "Student Directory". <br> 3. Use the search bar to filter by a skill (e.g., "React").      | The list of students is filtered to only show those who have the "React" skill in their profile.             |                    |
| **DIR-02**  | Company Sends Adoption Request   | 1. From the filtered directory, click the "Adopt" button on a student's card.                                                | A success message is shown. The request should appear in the company's "Sent Adoption Requests" page.        |                    |
| **DIR-03**  | Student Receives Adoption Request| 1. Log in as the student from DIR-02. <br> 2. Navigate to the "My Adoption Requests" page.                                      | The request from the company is visible, with options to "Accept" or "Decline".                                |                    |

</rewritten_file> 