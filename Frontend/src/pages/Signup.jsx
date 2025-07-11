import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';

function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    secondName: '',
    email: '',
    password: ''
  });

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(formData);
      navigate('/dashboard');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background-main">
      <Navbar />
      <section className="container mx-auto p-spacing-lg">
        <h1 className="text-3xl font-sans font-bold text-text-primary mb-spacing-md">
          Sign Up
        </h1>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First Name"
            className="w-full p-spacing-sm mb-spacing-sm border border-secondary-light rounded"
          />
          <input
            type="text"
            name="secondName"
            value={formData.secondName}
            onChange={handleChange}
            placeholder="Last Name"
            className="w-full p-spacing-sm mb-spacing-sm border border-secondary-light rounded"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full p-spacing-sm mb-spacing-sm border border-secondary-light rounded"
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full p-spacing-sm mb-spacing-sm border border-secondary-light rounded"
          />
          <Button text="Sign Up" type="submit" className="w-full" />
        </form>
      </section>
      <Footer />
    </div>
  );
}

export default Signup;
