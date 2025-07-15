import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Button from "../components/common/Button";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background-main mb-spacing-xl">
      <Navbar />
      <section className="container mx-auto p-md">
        <h1 className="text-3xl font-sans font-bold text-text-primary mb-md text-center">
          Login
        </h1>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-sm mb-sm border border-secondary-light rounded"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-sm mb-sm border border-secondary-light rounded"
          />
          <Button text="Login" type="submit" className="w-full" />
        </form>
      </section>
      <Footer />
    </div>
  );
}

export default Login;
