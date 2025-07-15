import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../common/Button";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-secondary-dark text-background-card p-spacing-md h-16 flex w-full">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-sans font-bold">
          LearnSphere
        </Link>
        <div className="flex space-x-spacing-md gap-5 justify-center">
          <Link
            to="/courses"
            className="text-background-card hover:text-primary-light"
          >
            Courses
          </Link>
          <Link
            to="/about"
            className="text-background-card hover:text-primary-light"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-background-card hover:text-primary-light"
          >
            Contact
          </Link>
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="text-background-card hover:text-primary-light"
              >
                Dashboard
              </Link>
              <Button text="Logout" onClick={logout} />
            </>
          ) : (
            <Link to="/login">
              <Button text="Login" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
