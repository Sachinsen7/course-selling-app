import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password, name }); 
      navigate('/dashboard');
    } catch (err) {
      alert('Signup failed');
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full p-spacing-sm mb-spacing-sm border border-secondary-light rounded"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-spacing-sm mb-spacing-sm border border-secondary-light rounded"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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