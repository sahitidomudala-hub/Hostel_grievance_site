<<<<<<< HEAD
# Hostel Grievance Management System

A full-stack Grievance Management System built with React, Vite, Tailwind CSS, and Firebase.

## Prerequisites

- Node.js installed on your machine.
- A Google Firebase project.

## Setup Instructions

### 1. Install Dependencies
Since this project was generated, you need to install the dependencies. Open a terminal in this folder and run:

```bash
npm install
```

### 2. Firebase Setup
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project.
3. Enable **Authentication** (Email/Password provider).
4. Enable **Cloud Firestore** in Test Mode (or Production Mode and apply the rules below).
5. Create a web app in project settings and copy the configuration.
6. Open `src/config/firebase.js` and replace the placeholder values with your actual Firebase config keys.

### 3. Database & Roles
The system relies on a `users` collection to determine if a user is a **student** or **admin**.

**For Admin:**
1. Create a user in Firebase Auth with an email (e.g., `admin@hostel.com`) and password.
2. Go to **Firestore Database** -> `users` collection.
3. Create a document with ID = User's UID.
4. Fields:
   - `email`: `admin@hostel.com`
   - `role`: `admin`

**For Student (SAP ID Login):**
The system uses `SAPID@hostel.local` as the email behind the scenes.
1. Create a user in Firebase Auth.
   - **Email**: `[SAP_ID]@hostel.local` (e.g., `500012345@hostel.local`)
   - **Password**: Any password
2. Go to **Firestore Database** -> `users` collection.
3. Create a document with ID = User's UID.
4. Fields:
   - `email`: `500012345@hostel.local`
   - `role`: `student`
   - `sapId`: `500012345` (Optional, for reference)

### 4. Security Rules
Copy the contents of `firestore.rules` to your Firebase Firestore Rules tab to ensure data security.

### 5. Run the Project
```bash
npm run dev
```

## Features
- **Student Login**: Uses **SAP ID** (mapped to `@student.hostel.com` internally).
- **Admin Login**: Uses **Email**.
- **Student Dashboard**: Raise grievances, view status.
- **Admin Dashboard**: View all grievances, analytics, update status, add remarks.
- **Role-based Authentication**: Secure routes for Admin and Student.
=======
# Hostel_grievance_site
A portal that allows students to raise any hostel related issues. The admin dashboard will display all the issues and analytics.
- Authentication

Current Features
SAP ID + password login

Role-based access (Student / Admin)

Secure authentication using Firebase

- Student Dashboard

Raise hostel grievances easily

View grievance status:

Submitted

Ongoing

Resolved

Filter grievances by status

Clear status tags and last-updated info

View admin remarks and updates

- Admin Dashboard

View and manage all grievances

Update grievance status and add remarks

Categorize issues by type

- Analytics (Admin)

Total, resolved, and pending grievance stats

Visually enhanced, dashboard-style analytics


Future Implementations
- student review/suggestion column

Tech Stack:
- React
- Firebase
- Tailwind CSS
>>>>>>> f518b644abed7754a6c598a47328d11d6a84892a
