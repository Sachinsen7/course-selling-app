function Footer() {
  return (
    <footer className="bg-secondary-dark text-background-card p-spacing-md mt-spacing-lg">
      <div className="container mx-auto text-center">
        <p className="text-sm font-sans">
          &copy; 2025 LearnSphere. All rights reserved.
        </p>
        <div className="flex justify-center space-x-spacing-md mt-spacing-sm">
          <a href="/about" className="text-background-card hover:text-primary-light">
            About
          </a>
          <a href="/contact" className="text-background-card hover:text-primary-light">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;