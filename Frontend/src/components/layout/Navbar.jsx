// src/layout/Navbar.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../common/Button";
import { AUTH_ROUTES, PROTECTED_ROUTES, PUBLIC_ROUTES } from "../../routes";

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Helper to get user's profile picture or a placeholder
  const getProfilePicture = () => {
    return user?.profilePicture || `https://placehold.co/40x40/F9F3EF/1B3C53?text=${user?.firstName ? user.firstName[0].toUpperCase() : 'U'}`;
  };

  // Determine the primary dashboard link based on role
  const getPrimaryDashboardLink = () => {
    if (!user) return PROTECTED_ROUTES.dashboard; // Default fallback
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'instructor') return PROTECTED_ROUTES.instructor;
    return PROTECTED_ROUTES.dashboard; // Learner dashboard
  };

  return (
    <nav className="bg-background-main text-background-card p-md shadow-md font-sans relative z-10"> {/* Added relative and z-index */}
      <div className="container mx-auto flex justify-between items-center">
        <Link to={PUBLIC_ROUTES.home} className="text-2xl font-bold text-text-primary hover:text-primary-light transition-colors duration-200">
          LearnSphere
        </Link>
        <div className="flex items-center space-x-md">
          {/* Main Navigation Links */}
          <Link
            to={PUBLIC_ROUTES.courseListing}
            className="text-text-primary hover:text-primary-light transition-colors duration-200"
          >
            Courses
          </Link>
          <Link
            to={PUBLIC_ROUTES.about}
            className="text-text-primary hover:text-primary-light transition-colors duration-200"
          >
            About
          </Link>
          <Link
            to={PUBLIC_ROUTES.contact}
            className="text-text-primary hover:text-primary-light transition-colors duration-200"
          >
            Contact
          </Link>

          <svg
          className="text-text-primary hover:text-primary-light transition-colors duration-200 cursor-pointer"
          xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#333333"><path d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Zm0-108q96-86 158-147.5t98-107q36-45.5 50-81t14-70.5q0-60-40-100t-100-40q-47 0-87 26.5T518-680h-76q-15-41-55-67.5T300-774q-60 0-100 40t-40 100q0 35 14 70.5t50 81q36 45.5 98 107T480-228Zm0-273Z"/></svg>
          <svg
          className="text-text-primary hover:text-primary-light transition-colors duration-200 cursor-pointer"
          xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#333333"><path d="M280-80q-33 0-56.5-23.5T200-160q0-33 23.5-56.5T280-240q33 0 56.5 23.5T360-160q0 33-23.5 56.5T280-80Zm400 0q-33 0-56.5-23.5T600-160q0-33 23.5-56.5T680-240q33 0 56.5 23.5T760-160q0 33-23.5 56.5T680-80ZM246-720l96 200h280l110-200H246Zm-38-80h590q23 0 35 20.5t1 41.5L692-482q-11 20-29.5 31T622-440H324l-44 80h480v80H280q-45 0-68-39.5t-2-78.5l54-98-144-304H40v-80h130l38 80Zm134 280h280-280Z"/></svg>
          <svg
          className="text-text-primary hover:text-primary-light transition-colors duration-200 cursor-pointer"
          xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#333333"><path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z"/></svg>

          {/* Authenticated User Section */}
          {isAuthenticated ? (
            <div
              className="relative ml-md cursor-pointer"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              {/* Profile Picture */}
              <img
                src={getProfilePicture()}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm transition-transform duration-200 hover:scale-105"
              />

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-background-card rounded-md shadow-lg border border-gray-100 py-2 text-text-primary z-20">
                  {/* User Info (Optional, but nice touch) */}
                  <div className="px-4 py-2 border-b border-gray-100 mb-2">
                    <p className="font-semibold">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-text-secondary">{user.email}</p>
                  </div>
                  
                  {/* Dropdown Links */}
                  <Link
                    to={getPrimaryDashboardLink()}
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 hover:bg-gray-100 transition-colors duration-150"
                  >
                    My Learning / Dashboard
                  </Link>
                  <Link
                    to={PROTECTED_ROUTES.checkout}
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 hover:bg-gray-100 transition-colors duration-150"
                  >
                    My Cart
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 hover:bg-gray-100 transition-colors duration-150"
                  >
                    My Wishlist
                  </Link>
                  <Link
                    to={PROTECTED_ROUTES.profile}
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 hover:bg-gray-100 transition-colors duration-150"
                  >
                    Account Settings
                  </Link>
                  <Link
                    to="/payment-methods"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 hover:bg-gray-100 transition-colors duration-150"
                  >
                    Payment Methods
                  </Link>
                  <Link
                    to="/help-support"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 hover:bg-gray-100 transition-colors duration-150"
                  >
                    Help and Support
                  </Link>
                  
                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      logout();
                      setIsDropdownOpen(false); // Close dropdown on logout
                    }}
                    className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 transition-colors duration-150 border-t border-gray-100 mt-2 pt-2"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Not authenticated: Show Login button
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
