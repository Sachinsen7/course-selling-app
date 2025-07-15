function Footer() {
  return (
    <footer className="bg-secondary-dark text-background-card p-spacing-md mt-spacing-xl h-screen flex justify-center items-center">
      <div className="container mx-auto text-center">
        <div className="flex justify-center space-x-spacing-md mt-spacing-sm">
          <a
            href="/about"
            className="text-background-card hover:text-primary-light"
          >
            About
          </a>
          <a
            href="/contact"
            className="text-background-card hover:text-primary-light"
          >
            Contact
          </a>
        </div>
        <p className="text-sm font-sans">
          &copy; 2025 LearnSphere. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
