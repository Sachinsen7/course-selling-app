import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

function HelpSupportPage() {
  const { showModal } = useAuth();
  const [activeTab, setActiveTab] = useState('faq');
  const [openFaq, setOpenFaq] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const tabs = [
    { id: 'faq', name: 'FAQ', icon: '❓' },
    { id: 'contact', name: 'Contact Us', icon: '📧' },
    { id: 'guides', name: 'User Guides', icon: '📚' },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: '🔧' },
  ];

  const faqData = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'How do I create an account?',
          a: 'Click the "Sign Up" button in the top right corner, fill in your details, and verify your email address. You can choose to register as a learner or instructor.'
        },
        {
          q: 'How do I enroll in a course?',
          a: 'Browse our course catalog, click on a course you\'re interested in, and click "Enroll Now" or "Buy Now". You\'ll be guided through the payment process.'
        },
        {
          q: 'Can I preview courses before purchasing?',
          a: 'Yes! Most courses offer preview videos and detailed curriculum information. You can also read reviews from other students.'
        }
      ]
    },
    {
      category: 'Payments & Billing',
      questions: [
        {
          q: 'What payment methods do you accept?',
          a: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers in supported regions.'
        },
        {
          q: 'Can I get a refund?',
          a: 'Yes, we offer a 30-day money-back guarantee for all courses. If you\'re not satisfied, contact our support team for a full refund.'
        },
        {
          q: 'Do you offer student discounts?',
          a: 'Yes! We offer special pricing for students with valid .edu email addresses. Contact support to verify your student status.'
        }
      ]
    },
    {
      category: 'Learning Experience',
      questions: [
        {
          q: 'How long do I have access to a course?',
          a: 'Once you enroll in a course, you have lifetime access to all course materials, including future updates and additions.'
        },
        {
          q: 'Can I download course videos?',
          a: 'Course videos can be viewed online through our platform. Offline viewing is available through our mobile app for premium courses.'
        },
        {
          q: 'Do I get a certificate upon completion?',
          a: 'Yes! You\'ll receive a certificate of completion for each course you finish. Certificates can be shared on LinkedIn and other platforms.'
        }
      ]
    },
    {
      category: 'Technical Issues',
      questions: [
        {
          q: 'Videos won\'t play or are buffering',
          a: 'Try refreshing the page, clearing your browser cache, or switching to a different browser. Ensure you have a stable internet connection.'
        },
        {
          q: 'I can\'t access my purchased courses',
          a: 'Make sure you\'re logged into the correct account. If the issue persists, contact support with your order details.'
        },
        {
          q: 'The website is running slowly',
          a: 'Clear your browser cache and cookies, disable browser extensions, or try using an incognito/private browsing window.'
        }
      ]
    }
  ];

  const userGuides = [
    {
      title: 'Getting Started Guide',
      description: 'Complete walkthrough for new users',
      icon: '🚀',
      topics: ['Creating an account', 'Navigating the platform', 'Finding courses', 'Making your first purchase']
    },
    {
      title: 'Learning Effectively',
      description: 'Tips for maximizing your learning experience',
      icon: '🎯',
      topics: ['Setting learning goals', 'Taking notes', 'Engaging with content', 'Tracking progress']
    },
    {
      title: 'For Instructors',
      description: 'Guide for course creators and instructors',
      icon: '👨‍🏫',
      topics: ['Creating courses', 'Managing content', 'Student engagement', 'Analytics and insights']
    },
    {
      title: 'Mobile App Guide',
      description: 'Using LearnSphere on mobile devices',
      icon: '📱',
      topics: ['App installation', 'Offline learning', 'Notifications', 'Syncing progress']
    }
  ];

  const troubleshootingSteps = [
    {
      issue: 'Login Problems',
      steps: [
        'Verify your email and password are correct',
        'Check if Caps Lock is enabled',
        'Try resetting your password',
        'Clear browser cookies and cache',
        'Contact support if issue persists'
      ]
    },
    {
      issue: 'Video Playback Issues',
      steps: [
        'Check your internet connection speed',
        'Try a different browser or device',
        'Disable browser extensions',
        'Update your browser to the latest version',
        'Contact technical support'
      ]
    },
    {
      issue: 'Payment Failures',
      steps: [
        'Verify your payment information is correct',
        'Check if your card has sufficient funds',
        'Try a different payment method',
        'Contact your bank if needed',
        'Reach out to our billing support'
      ]
    }
  ];

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showModal({
        isOpen: true,
        title: 'Message Sent!',
        message: 'Thank you for contacting us. We\'ll get back to you within 24 hours.',
        type: 'success',
      });

      setContactForm({
        name: '',
        email: '',
        subject: '',
        category: 'general',
        message: '',
      });
    } catch (error) {
      showModal({
        isOpen: true,
        title: 'Error',
        message: 'Failed to send message. Please try again.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help & Support</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're here to help you succeed. Find answers to common questions or get in touch with our support team.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 mx-2 mb-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary-main text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'faq' && (
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                {faqData.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                      {category.category}
                    </h3>
                    <div className="space-y-3">
                      {category.questions.map((faq, faqIndex) => {
                        const faqId = `${categoryIndex}-${faqIndex}`;
                        return (
                          <div key={faqId} className="bg-white rounded-lg border border-gray-200">
                            <button
                              onClick={() => setOpenFaq(openFaq === faqId ? null : faqId)}
                              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                            >
                              <span className="font-medium text-gray-900">{faq.q}</span>
                              <svg
                                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                                  openFaq === faqId ? 'rotate-180' : ''
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            <AnimatePresence>
                              {openFaq === faqId && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-6 pb-4 text-gray-700 border-t border-gray-100">
                                    {faq.a}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Our Support Team</h2>
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={contactForm.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={contactForm.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        name="category"
                        value={contactForm.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="technical">Technical Support</option>
                        <option value="billing">Billing & Payments</option>
                        <option value="course">Course Content</option>
                        <option value="account">Account Issues</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={contactForm.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        value={contactForm.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                        placeholder="Please describe your issue or question in detail..."
                      />
                    </div>

                    <Button
                      type="submit"
                      text={submitting ? 'Sending...' : 'Send Message'}
                      disabled={submitting}
                      className="w-full"
                    />
                  </form>

                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Other Ways to Reach Us</h3>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-center">
                        <span className="mr-3">📧</span>
                        <span>support@learnsphere.com</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-3">📞</span>
                        <span>+1 (555) 123-4567</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-3">💬</span>
                        <span>Live chat available 9 AM - 6 PM EST</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'guides' && (
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">User Guides</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userGuides.map((guide, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center mb-4">
                        <span className="text-3xl mr-3">{guide.icon}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{guide.title}</h3>
                          <p className="text-gray-600">{guide.description}</p>
                        </div>
                      </div>
                      <ul className="space-y-2 mb-4">
                        {guide.topics.map((topic, topicIndex) => (
                          <li key={topicIndex} className="flex items-center text-gray-700">
                            <span className="w-2 h-2 bg-primary-main rounded-full mr-3"></span>
                            {topic}
                          </li>
                        ))}
                      </ul>
                      <Button
                        text="Read Guide"
                        variant="outline"
                        className="w-full"
                        onClick={() => showModal({
                          isOpen: true,
                          title: 'Coming Soon',
                          message: 'Detailed user guides are coming soon!',
                          type: 'info',
                        })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'troubleshooting' && (
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Troubleshooting</h2>
                <div className="space-y-6">
                  {troubleshootingSteps.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{item.issue}</h3>
                      <ol className="space-y-2">
                        {item.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start">
                            <span className="flex-shrink-0 w-6 h-6 bg-primary-main text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                              {stepIndex + 1}
                            </span>
                            <span className="text-gray-700">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default HelpSupportPage;
