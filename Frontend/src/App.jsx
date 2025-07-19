import { Children, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import HomePage from './pages/HomePage'
import { PUBLIC_ROUTES, AUTH_ROUTES, PROTECTED_ROUTES } from './routes'
import CourseListingPage from './pages/CourseListingPage'
import ResultPage from './pages/ResultPage'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import CourseLearning from './pages/CourseLearning'
import UserDashboard from './pages/UserDashboard'
import UserProfile from './pages/UserProfile'
import CheckoutPage from './pages/CheckoutPage'
import InstructorDashboard from './pages/InstructorDashboard'
import NotFound from './pages/NotFound'

import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import CourseDetailsPage from './pages/CourseDetailsPage'

const PrivateRoutes = ({children, allowedRoles = []}) => {
  const [isAuthenticated, user, loading] = useAuth()


  if(loading){
    return (
      <div className="flex justify-center items-center h-screen text-xl font-inter text-gray-700">
          Loading authentication...
      </div>
    )
  }

  if (!isAuthenticated) {
        return <Navigate to={AUTH_ROUTES.login} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children
}


function App() {
 return (
     <div className="min-h-screen flex flex-col font-inter">
      <Navbar /> {/* Global Navigation Bar */}
      <main className="flex-grow"> {/* Main content area */}
        <Routes>
          {/* Public Routes */}
          <Route path={PUBLIC_ROUTES.home} element={<HomePage />} />
          <Route path={PUBLIC_ROUTES.courseListing} element={<CourseListingPage />} />
          <Route path={PUBLIC_ROUTES.courseDetail} element={<CourseDetailsPage />} /> 
          <Route path={PUBLIC_ROUTES.searchResult} element={<ResultPage />} />
          <Route path={PUBLIC_ROUTES.about} element={<About />} />
          <Route path={PUBLIC_ROUTES.contact} element={<Contact />} />

          {/* Auth Routes */}
          <Route path={AUTH_ROUTES.login} element={<Login />} />
          <Route path={AUTH_ROUTES.signup} element={<Signup />} />
          <Route path={AUTH_ROUTES.ForgotPassword} element={<ForgotPassword />} />

          {/* Protected Routes - Wrapped with PrivateRoutes */}
          <Route
            path={PROTECTED_ROUTES.dashboard}
            element={
              <PrivateRoutes allowedRoles={['learner', 'instructor', 'admin']}>
                <UserDashboard />
              </PrivateRoutes>
            }
          />
          {/* Course Learning Page */}
          <Route
            path={PROTECTED_ROUTES.courseLearning}
            element={
              <PrivateRoutes allowedRoles={['learner', 'instructor', 'admin']}> {/* Instructors can also view their own courses */}
                <CourseLearning />
              </PrivateRoutes>
            }
          />
          {/* User Profile Page */}
          <Route
            path={PROTECTED_ROUTES.profile}
            element={
              <PrivateRoutes allowedRoles={['learner', 'instructor', 'admin']}>
                <UserProfile />
              </PrivateRoutes>
            }
          />
          {/* Checkout Page */}
          <Route
            path={PROTECTED_ROUTES.checkout}
            element={
              <PrivateRoutes allowedRoles={['learner']}> 
                <CheckoutPage />
              </PrivateRoutes>
            }
          />
          {/* Instructor Dashboard */}
          <Route
            path={PROTECTED_ROUTES.instructor}
            element={
              <PrivateRoutes allowedRoles={['instructor', 'admin']}>
                <InstructorDashboard />
              </PrivateRoutes>
            }
          />

          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer /> 
    </div>
  )
}

export default App
