import React, { useState } from 'react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext'; 

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const { showModal } = useAuth(); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    console.log("Contact Form Submitted:", formData);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
      showModal({
        isOpen: true,
        title: "Message Sent!",
        message: "Thank you for contacting us. We will get back to you shortly.",
        type: "success",
      });
      setFormData({ name: '', email: '', subject: '', message: '' }); 
    } catch (error) {
      showModal({
        isOpen: true,
        title: "Submission Failed",
        message: "There was an error sending your message. Please try again later.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-main p-lg font-sans">
      <div className="container mx-auto bg-background-card p-xl rounded-lg shadow-md border border-gray-100">
        <h1 className="text-4xl font-bold text-text-primary text-center mb-xl">Contact Us</h1>
        
        <section className="mb-xl text-center">
          <p className="text-lg text-text-secondary mb-md">
            Have questions, feedback, or need support? Reach out to us!
          </p>
          <p className="text-text-primary mb-sm">
            Email: <a href="mailto:support@learnsphere.com" className="text-primary-main hover:underline">support@learnsphere.com</a>
          </p>
          <p className="text-text-primary">
            Phone: +91-123-456-789
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-text-primary mb-lg border-b pb-sm text-center">Send Us a Message</h2>
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-md">
            <div>
              <label htmlFor="name" className="block text-text-primary text-sm font-semibold mb-sm">Your Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-md py-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-text-primary text-sm font-semibold mb-sm">Your Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-md py-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-text-primary text-sm font-semibold mb-sm">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-md py-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-text-primary text-sm font-semibold mb-sm">Your Message</label>
              <textarea
                id="message"
                name="message"
                rows="6"
                value={formData.message}
                onChange={handleChange}
                className="w-full px-md py-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
                required
                disabled={submitting}
              ></textarea>
            </div>
            <Button
              text={submitting ? 'Sending Message...' : 'Send Message'}
              type="submit"
              className="w-full px-lg py-md text-lg"
              disabled={submitting}
            />
          </form>
        </section>
      </div>
    </div>
  );
}

export default Contact;
