import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
import PrivateRoutes from './routes/PrivateRoutes'
import NotFound from './pages/NotFound'



function App() {
  const [count, setCount] = useState(0)



  return (
    <Routes>

      {/* Public Routes */}
      <Route path={PUBLIC_ROUTES.home} element={<HomePage />}/>
      <Route path={PUBLIC_ROUTES.courseListing} element={<CourseListingPage/>}/>
      <Route path={PUBLIC_ROUTES.searchResult} element={<ResultPage />}/>
      <Route path={PUBLIC_ROUTES.about} element={<About />}/>
      <Route path={PUBLIC_ROUTES.contact} element={<Contact />}/>


    {/* Auth Routes */}
      <Route path={AUTH_ROUTES.login} element={<Login />}/>
      <Route path={AUTH_ROUTES.signup} element={<Signup />}/>
      <Route path={AUTH_ROUTES.ForgotPassword} element={<ForgotPassword />}/>


      {/* Protected Routes */}
      <Route path={PROTECTED_ROUTES.courseLearning} element={<PrivateRoutes component={<CourseLearning />}/>}></Route>
      <Route path={PROTECTED_ROUTES.dashboard} element={<PrivateRoutes component={<UserDashboard />}/>}></Route>
      <Route path={PROTECTED_ROUTES.profile} element={<PrivateRoutes component={<UserProfile />}/>}></Route>
      <Route path={PROTECTED_ROUTES.checkout} element={<PrivateRoutes component={<CheckoutPage />}/>}></Route>
      <Route path={PROTECTED_ROUTES.instructor} element={<PrivateRoutes component={<InstructorDashboard />}/>}></Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
