import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import { AUTH_ROUTES, PROTECTED_ROUTES, PUBLIC_ROUTES } from '../../routes';

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-secondary-main text-text-primary p-md shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to={PUBLIC_ROUTES.home}
          className="text-2xl font-sans font-bold text-text-primary hover:text-primary-light transition-colors duration-200"
        >
          LearnSphere
        </Link>
        <div className="flex items-center space-x-lg">
          <Link
            to={PUBLIC_ROUTES.courseListing}
            className="text-text-primary hover:text-primary-light transition-colors duration-200 text-sm font-medium"
          >
            Courses
          </Link>
          <Link
            to={PUBLIC_ROUTES.about}
            className="text-text-primary hover:text-primary-light transition-colors duration-200 text-sm font-medium"
          >
            About
          </Link>
          <Link
            to={PUBLIC_ROUTES.contact}
            className="text-text-primary hover:text-primary-light transition-colors duration-200 text-sm font-medium"
          >
            Contact
          </Link>
          {isAuthenticated ? (
            <>
              {user.role === 'instructor' && (
                <Link
                  to={PROTECTED_ROUTES.instructor}
                  className="text-text-primary hover:text-primary-light transition-colors duration-200 text-sm font-medium"
                >
                  Instructor
                </Link>
              )}
              {user.role === 'admin' && (
                <Link
                  to={PROTECTED_ROUTES.admin}
                  className="text-text-primary hover:text-primary-light transition-colors duration-200 text-sm font-medium"
                >
                  Admin
                </Link>
              )}
              {user.role === 'learner' && (
                <Link
                  to={PROTECTED_ROUTES.dashboard}
                  className="text-text-primary hover:text-primary-light transition-colors duration-200 text-sm font-medium"
                >
                  Dashboard
                </Link>
              )}
              <span className="text-text-secondary font-medium text-sm">
                Hello, {user.firstName || user.email}!
              </span>
              <Button text="Logout" onClick={logout} className="px-sm" />
            </>
          ) : (
            <Link to={AUTH_ROUTES.login}>
              <Button text="Login" className="px-sm" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;