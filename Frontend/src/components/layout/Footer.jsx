import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-secondary-dark text-background-card p-spacing-md mt-spacing-xl">
      <div className="container mx-auto text-center">
        <div className="flex justify-center space-x-spacing-md mb-spacing-sm">
          <Link
            to="/about"
            className="text-background-card hover:text-primary-light transition-colors duration-200"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-background-card hover:text-primary-light transition-colors duration-200"
          >
            Contact
          </Link>
          <Link
            to="/privacy"
            className="text-background-card hover:text-primary-light transition-colors duration-200"
          >
            Privacy Policy
          </Link>
        </div>
        <p className="text-sm font-inter">
          &copy; {new Date().getFullYear()} LearnSphere. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
