import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../common/Button"; 
import { AUTH_ROUTES, PROTECTED_ROUTES, PUBLIC_ROUTES } from "../../routes"; 

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-secondary-dark text-background-card p-md shadow-md font-inter">
      <div className="container mx-auto flex justify-between items-center">
        <Link to={PUBLIC_ROUTES.home} className="text-2xl font-bold text-white hover:text-primary-light transition-colors duration-200">
          LearnSphere
        </Link>
        <div className="flex items-center space-x-md">
          <Link
            to={PUBLIC_ROUTES.courseListing}
            className="text-background-card hover:text-primary-light transition-colors duration-200"
          >
            Courses
          </Link>
          <Link
            to={PUBLIC_ROUTES.about}
            className="text-background-card hover:text-primary-light transition-colors duration-200"
          >
            About
          </Link>
          <Link
            to={PUBLIC_ROUTES.contact}
            className="text-background-card hover:text-primary-light transition-colors duration-200"
          >
            Contact
          </Link>

          {isAuthenticated ? (
            <>
              {user.role === 'instructor' && (
                <Link
                  to={PROTECTED_ROUTES.instructor}
                  className="text-background-card hover:text-primary-light transition-colors duration-200"
                >
                  Instructor
                </Link>
              )}
              {user.role === 'admin' && (
                <Link
                  to="/admin/dashboard" 
                  className="text-background-card hover:text-primary-light transition-colors duration-200"
                >
                  Admin
                </Link>
              )}
              {user.role === 'learner' && ( 
                 <Link
                    to={PROTECTED_ROUTES.dashboard}
                    className="text-background-card hover:text-primary-light transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
              )}
              <span className="text-primary-light font-medium">
                Hello, {user.firstName || user.email}!
              </span>
              <Button text="Logout" onClick={logout} />
            </>
          ) : (
            <Link to={AUTH_ROUTES.login}>
              <Button text="Login" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
