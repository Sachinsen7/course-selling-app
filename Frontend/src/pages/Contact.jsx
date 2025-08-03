import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

function Contact() {
  const { showModal } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      showModal({
        isOpen: true,
        title: 'Message Sent',
        message: 'We have received your message and will respond soon.',
        type: 'success',
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      showModal({
        isOpen: true,
        title: 'Submission Failed',
        message: 'An error occurred. Please try again later.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: 'How do I enroll in a course?',
      answer: 'Go to the course listing, select a course, and click "Enroll Now" or "Buy Now." Log in or sign up to proceed.',
    },
    {
      question: 'Can I teach on LearnSphere?',
      answer: 'Yes, register as an instructor and submit your course for review via the Instructor Dashboard.',
    },
    {
      question: 'What is the refund policy?',
      answer: 'We provide a 30-day refund. Email support@learnsphere.com to request one.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans">
      <motion.section
        className="bg-gradient-to-r from-[#1B3C53] to-[#456882] text-[#FFFFFF] py-12 md:py-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-base md:text-lg text-[#FFFFFF]/80 max-w-xl mx-auto">
            Need help or have a question? Send us a message, and we’ll respond within 24 hours.
          </p>
        </div>
      </motion.section>

      <motion.section
        className="container mx-auto px-4 md:px-6 py-12 md:py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="max-w-lg mx-auto bg-[#F9FAFB] p-6 md:p-8 rounded-xl shadow-md border border-[#E5E7EB]">
          <h2 className="text-xl md:text-2xl font-bold text-[#1B3C53] mb-6 text-center">
            Send a Message
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-[#1B3C53] text-sm font-semibold mb-2"
              >
                Name
              </label>
              <motion.input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] text-[#1B3C53] disabled:bg-[#E5E7EB] disabled:cursor-not-allowed"
                required
                disabled={submitting}
                whileFocus={{ scale: 1.02 }}
                aria-describedby="name-error"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-[#1B3C53] text-sm font-semibold mb-2"
              >
                Email
              </label>
              <motion.input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] text-[#1B3C53] disabled:bg-[#E5E7EB] disabled:cursor-not-allowed"
                required
                disabled={submitting}
                whileFocus={{ scale: 1.02 }}
                aria-describedby="email-error"
              />
            </div>
            <div>
              <label
                htmlFor="subject"
                className="block text-[#1B3C53] text-sm font-semibold mb-2"
              >
                Subject
              </label>
              <motion.input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full p-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] text-[#1B3C53] disabled:bg-[#E5E7EB] disabled:cursor-not-allowed"
                required
                disabled={submitting}
                whileFocus={{ scale: 1.02 }}
                aria-describedby="subject-error"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-[#1B3C53] text-sm font-semibold mb-2"
              >
                Message
              </label>
              <motion.textarea
                id="message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                className="w-full p-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] text-[#1B3C53] disabled:bg-[#E5E7EB] disabled:cursor-not-allowed"
                required
                disabled={submitting}
                whileFocus={{ scale: 1.02 }}
                aria-describedby="message-error"
              />
            </div>
            <Button
              text={submitting ? 'Sending...' : 'Send Message'}
              type="submit"
              className="w-full px-6 py-3 bg-[#1B3C53] text-[#FFFFFF] hover:bg-[#456882] rounded-md font-semibold transition-all duration-200 transform hover:scale-105 shadow-md"
              disabled={submitting}
              aria-label="Send message"
            />
          </form>
        </div>
      </motion.section>

      <motion.section
        className="container mx-auto px-4 md:px-6 py-12 md:py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-xl md:text-2xl font-bold text-[#1B3C53] mb-6 text-center">
          Frequently Asked Questions
        </h2>
        <div className="max-w-lg mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="bg-[#F9FAFB] p-4 rounded-md shadow-sm border border-[#E5E7EB] hover:shadow-md transition-shadow duration-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <button
                className="flex justify-between items-center w-full text-sm font-semibold text-[#1B3C53] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4A8292]"
                onClick={() => toggleFaq(index)}
                aria-expanded={openFaq === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span>{faq.question}</span>
                <motion.span
                  animate={{ rotate: openFaq === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.span>
              </button>
              <AnimatePresence>
                {openFaq === index && (
                  <motion.p
                    id={`faq-answer-${index}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-[#6B7280] text-sm px-4 py-2"
                  >
                    {faq.answer}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}

export default Contact;
