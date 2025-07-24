# **LearnSphere: A Comprehensive Online Learning Platform**

## **Project Overview**

LearnSphere is a full-stack Learning Management System (LMS) designed to provide a rich and interactive online learning experience, inspired by platforms like Udemy and Coursera. It connects passionate instructors with eager learners, offering robust course management, engaging content delivery, and intuitive user dashboards.

This project is built with a strong focus on modularity, scalability, and a clean user interface.

## **Features**

LearnSphere offers a wide array of features for different user roles:

### **A. Core Platform Features**

* **User Authentication & Authorization:** Secure signup, login, and role-based access control (Learner, Instructor, Admin).  
* **Custom Notification System:** Rich, custom modal pop-ups for important user feedback (e.g., login success/failure, enrollment confirmation).  
* **Global Styling:** A custom, minimal Tailwind CSS theme with a unique color palette and Poppins font for a consistent and modern look.

### **B. Learner Features**

* **Course Discovery:**  
  * Browse all available courses.  
  * Search courses by keywords (title, description), category, instructor name, and price range.  
  * Filter courses using a dedicated sidebar.  
* **Course Details:** View comprehensive course information, including description, curriculum, instructor profile, and student reviews.  
* **Enrollment & Purchase:** Enroll in free courses or proceed to a mock checkout for paid courses.  
* **Course Learning:**  
  * Access enrolled course content (sections and lectures).  
  * View various lecture types: video (with progress tracking), text.  
  * **Quiz Assessment:** Take interactive quizzes, submit answers, get instant scores, and view past attempts.  
  * **Assignment Submission:** Submit assignments (text or URL-based) and view submission status.  
  * **Progress Tracking:** Mark lectures as complete, and view overall course progress percentage.  
* **User Dashboard:** View a personalized dashboard with all enrolled courses and their progress.  
* **User Profile:** View and update personal information (first name, last name, bio, profile picture) and change password.  
* **Reviews:** Add and view reviews for enrolled courses, with review sorting and rating distribution breakdown.

### **C. Instructor Features**

* **Instructor Dashboard:** View and manage all created courses.  
* **Course Creation & Management:**  
  * Create new courses with detailed information (title, description, price, image, category, status).  
  * Edit existing course details.  
  * Delete courses (with cascade deletion of associated content).  
* **Course Content Management:**  
  * Create, update, and delete course sections.  
  * Create, update, and delete individual lectures (video, text, quiz, assignment) within sections.  
* **Quiz & Question Management:**  
  * Create, update, and delete quizzes for 'quiz' type lectures.  
  * Add, update, and delete questions (multiple-choice, true/false, short-answer) within quizzes.  
* **Assignment Grading:** View submitted assignments from learners and provide grades and feedback.

### **D. Admin Features**

* **User Management:**  
  * View all users on the platform.  
  * Update user roles (learner, instructor, admin).  
  * Manage user status (e.g., activate/deactivate).  
  * Force delete any user (with extensive cascade deletion of all associated data).  
* **Course Moderation:**  
  * View all courses (including drafts and archived).  
  * Change course status (e.g., publish a draft course).  
  * Force delete any course (with extensive cascade deletion of all associated content).  
* **Category Management:**  
  * Create, update, and delete course categories.  
  * Deleting a category can cascade to deleting associated courses.

## **Technologies Used**

### **Frontend**

* **React.js:** A JavaScript library for building user interfaces.  
* **React Router DOM:** For declarative routing in React applications.  
* **Tailwind CSS:** A utility-first CSS framework for rapid styling.  
* **Framer Motion:** For smooth animations and transitions (used in modals, toasts, and page transitions).  
* **Axios:** A promise-based HTTP client for making API requests.  
* **tailwind-merge & class-variance-authority:** Utilities for robust Tailwind class management.

### **Backend**

* **Node.js:** JavaScript runtime for server-side logic.  
* **Express.js:** A fast, unopinionated, minimalist web framework for Node.js.  
* **MongoDB:** A NoSQL document database for data storage.  
* **Mongoose:** An ODM (Object Data Modeling) library for MongoDB and Node.js.  
* **Zod:** A TypeScript-first schema declaration and validation library.  
* **bcryptjs:** For hashing and salting passwords securely.  
* **jsonwebtoken (JWT):** For secure user authentication and authorization.  
* **dotenv:** For loading environment variables from a .env file.  
* **cors:** Node.js middleware for enabling Cross-Origin Resource Sharing.

## **Project Structure**

### **Frontend (/frontend/src)**

frontend/  
├── src/  
│   ├── assets/  
│   ├── components/  
│   │   ├── common/      (Button, Loader, Modal)  
│   │   ├── course/      (CourseCard, CourseCurriculum, Review, Category)  
│   │   ├── layout/      (Navbar, Footer)  
│   │   ├── learning/    (VideoPlayer, QuizComponent, AssignmentComponent, ProgressTracker)  
│   │   └── user/        (SearchBar, InstructorProfile, FilterSidebar, UserProfileCard)  
│   ├── context/         (AuthContext)  
│   ├── hooks/           (useToast \- removed, now integrated directly into Modal/AuthContext)  
│   ├── pages/           (About, Contact, CourseDetailsPage, CourseLearning, CourseListingPage,  
│   │                    Dashboard, ForgotPassword, HomePage, InstructorDashboard,  
│   │                    InstructorCourseFormPage, Login, NotFound, Signup, UserProfile)  
│   ├── routes/          (index.js for route definitions, PrivateRoutes.jsx)  
│   ├── services/        (api.js, auth.js)  
│   └── utils/           (constant.js, theme.js)  
│   ├── App.jsx  
│   ├── index.css  
│   └── main.jsx  
├── package.json  
├── tailwind.config.js  
└── postcss.config.js

### **Backend (/backend)**

backend/  
├── db/              (db.js \- Mongoose connection and model exports)  
├── middleware/      (auth.js \- JWT verification, admin.js \- admin role check)  
├── models/          (user.js, course.js, category.js, section.js, lecture.js,  
│                    purchase.js, review.js, quiz.js, question.js,  
│                    userQuizAttempt.js, assignmentSubmission.js, userLectureProgress.js)  
├── routes/          (auth.js, enrollment.js, instructor.js, search.js,  
│                    payment.js, review.js, admin.js, user.js)  
├── .env             (Environment variables)  
├── .env.example  
├── index.js         (Main Express app entry point)  
└── package.json

## **Setup Instructions**

### **Prerequisites**

* Node.js (v18 or higher recommended)  
* npm or Yarn  
* MongoDB (local instance or cloud service like MongoDB Atlas)  
* Postman or similar API testing tool

### **1\. Backend Setup**

1. **Clone the repository:**  
   git clone \<your-repo-url\>  
   cd backend

2. **Install dependencies:**  
   npm install  
   \# or yarn install

3. Create .env file:  
   Create a file named .env in the backend directory and add your environment variables:  
   MONGO\_URI="your\_mongodb\_connection\_string"  
   JWT\_SECRET="a\_very\_strong\_secret\_key\_for\_jwt\_signing"  
   PORT=3000

   Replace your\_mongodb\_connection\_string with your MongoDB connection URI (e.g., mongodb://localhost:27017/learnsphere or your Atlas connection string).  
   Replace a\_very\_strong\_secret\_key\_for\_jwt\_signing with a long, random string.  
4. **Backend Adjustments (Important for Admin/Categories):**  
   * **Temporarily allow 'admin' signup:** In backend/routes/auth.js, temporarily change z.enum(\['learner', 'instructor'\]) to z.enum(\['learner', 'instructor', 'admin'\]) in userSignupSchema.  
   * **Make GET /api/admin/categories accessible:** In backend/routes/admin.js, move the adminRouter.get("/categories", ...) route definition *before* the adminRouter.use(authMiddleware); adminRouter.use(adminMiddleware); lines. This makes it publicly accessible for the frontend to fetch categories.  
5. **Start the backend server:**  
   npm run dev  
   \# or yarn dev

   The server should start on http://localhost:3000.

### **2\. Initial Data Seeding (via Postman)**

Before using the frontend, you need to create an admin user and some categories.

1. **Register an Admin User:**  
   * **Method:** POST  
   * **URL:** http://localhost:3000/api/auth/signup  
   * **Body (JSON):** {"email": "admin@example.com", "password": "AdminPassword123\!", "firstName": "Super", "lastName": "Admin", "role": "admin"}  
   * **Save the token from the response.**  
2. **Create Categories:**  
   * **Method:** POST  
   * **URL:** http://localhost:3000/api/admin/category  
   * **Headers:** Authorization: Bearer \<YOUR\_ADMIN\_TOKEN\>  
   * **Body (JSON):** {"name": "Web Development", "description": "..."} (Repeat for "Data Science", "Design", etc.)  
3. **Revert auth.js (Security):** After creating your admin user, **revert the change** in backend/routes/auth.js back to z.enum(\['learner', 'instructor'\]).default('learner') and restart your backend.

### **3\. Frontend Setup**

1. **Navigate to the frontend directory:**  
   cd ../frontend

2. **Install dependencies:**  
   npm install  
   \# or yarn install

3. Configure Tailwind CSS:  
   Ensure your tailwind.config.js and src/index.css are updated as per the latest instructions for the minimal theme and Poppins font.  
   * tailwind.config.js should extend colors from src/utils/theme.js and set fontFamily.sans: \['Poppins', ...defaultTheme.fontFamily.sans\].  
   * src/index.css should have @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900\&display=swap'); at the top and body { font-family: "Poppins", sans-serif; ... }.  
4. **Start the frontend development server:**  
   npm run dev  
   \# or yarn dev

   The frontend should start on http://localhost:5173 (or a similar port).

## **API Endpoints**

A comprehensive list of all backend API endpoints, their methods, and expected data structures can be found in the API Routes Summary immersive document generated during development. (This would typically be a separate Postman collection export or a detailed API documentation file).

## **Key Design Decisions**

* **Monorepo Structure:** Frontend and backend are in separate directories for clear separation of concerns.  
* **Role-Based Access Control (RBAC):** Users are assigned roles (learner, instructor, admin) which dictate their permissions.  
* **Modular Backend:** Backend routes are organized by resource, and middleware is used for authentication and authorization.  
* **Data Validation:** Zod is extensively used on the backend for robust input validation.  
* **Centralized Error Handling:** Consistent API error responses and frontend error display.  
* **Cascade Deletion:** Critical data deletions (user, course, category) are designed to automatically clean up related data across collections.  
* **Component-Based Frontend:** React components are organized by feature and reusability (common, course, learning, user).  
* **Global State Management:** React Context (AuthContext) is used for managing user authentication state.  
* **Custom UI/UX:** Tailored design with a custom theme and rich modal notifications for a distinct brand identity.  
* **API Service Layer:** axios is used with interceptors for centralized API calls and token management.

## **Future Enhancements**

* **Real Payment Gateway Integration:** Replace mock payment with Stripe, PayPal, etc.  
* **Cloud Storage for Media:** Integrate with AWS S3, Google Cloud Storage for video and image uploads.  
* **Search Optimization:** Implement Elasticsearch or Algolia for advanced, fast search.  
* **Notifications System:** Implement real-time notifications (e.g., WebSockets) and email notifications.  
* **Instructor Payouts:** System for managing instructor earnings and payouts.  
* **Course Analytics:** Detailed dashboards for instructors on student engagement and course performance.  
* **Wishlist & Cart Functionality:** Full shopping cart experience.  
* **Certificate Generation:** Automated certificate generation upon course completion.  
* **Discussion Forums/Q\&A:** More interactive learning features.  
* **Admin Dashboard UI:** Build out the frontend for the Admin Dashboard.  
* **Password Reset Flow:** Implement the full backend logic for forgot password (sending emails, verifying tokens).  
* **Testing:** Comprehensive unit, integration, and end-to-end tests.  
* **Deployment Automation:** CI/CD pipelines for automated deployment.

## **License**

This project is licensed under the MIT License.

MIT License

Copyright (c) \[2025\] \[Sachin Sen\]

Permission is hereby granted, free of charge, to any person obtaining a copy  
of this software and associated documentation files (the "Software"), to deal  
in the Software without restriction, including without limitation the rights  
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell  
copies of the Software, and to permit persons to whom the Software is  
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all  
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE  
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER  
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  
SOFTWARE.  
