import React, { useState, useEffect, memo, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Lazy load components for better performance
const Preloader = lazy(() => import("./templates/Preloader"));

// Memoized FAQ item component
const FaqItem = memo(({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="border-b border-zinc-700/50 pb-4"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left font-semibold text-lg mb-2 flex items-center justify-between group"
      >
        <span className="flex items-center">
          <i className="ri-question-line text-[#00b1b3] mr-2"></i>
          {question}
        </span>
        <i
          className={`ri-arrow-${
            isOpen ? "up" : "down"
          }-s-line text-[#00b1b3] transition-transform duration-300 group-hover:scale-110`}
        ></i>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="text-zinc-300 pl-6">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

// Memoized contact info item component
const ContactInfoItem = memo(({ icon, title, children }) => (
  <motion.div
    className="flex items-start"
    initial={{ opacity: 0, x: -10 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.3 }}
  >
    <div className="w-10 h-10 rounded-full bg-zinc-700/50 flex items-center justify-center mr-4 shadow-lg">
      <i className={`${icon} text-xl text-[#00b1b3]`}></i>
    </div>
    <div>
      <h4 className="font-semibold mb-1">{title}</h4>
      {children}
    </div>
  </motion.div>
));

// Memoized social link component
const SocialLink = memo(({ icon, url = "#" }) => (
  <motion.a
    href={url}
    className="w-10 h-10 rounded-full bg-zinc-700/50 flex items-center justify-center text-xl hover:text-[#00b1b3] hover:bg-zinc-700 transition duration-300"
    whileHover={{ scale: 1.1, rotate: 5 }}
    whileTap={{ scale: 0.9 }}
  >
    <i className={icon}></i>
  </motion.a>
));

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkDeviceType = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkDeviceType();

    // Add event listener with debounce
    const handleResize = () => {
      if (window.resizeTimer) clearTimeout(window.resizeTimer);
      window.resizeTimer = setTimeout(checkDeviceType, 100);
    };

    window.addEventListener("resize", handleResize);

    // Set loaded state
    const timer = setTimeout(() => setIsLoaded(true), 500);

    // Set document title
    document.title = "Contact Us | MODB";

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
      if (window.resizeTimer) clearTimeout(window.resizeTimer);
    };
  }, []);

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = "Name is required";

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.subject.trim()) errors.subject = "Subject is required";

    if (!formData.message.trim()) {
      errors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");

      // Reset form after successful submission
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    }, 1500);
  };

  // FAQ data
  const faqItems = [
    {
      question: "How do I report incorrect information?",
      answer:
        "You can report any inaccuracies by using our contact form or by emailing support@MOdb.com with details about the correction.",
    },
    {
      question: "Can I suggest a movie or TV show to add?",
      answer:
        'Absolutely! We welcome suggestions for new content. Please use the contact form with the subject "Content Suggestion."',
    },
    {
      question: "How quickly do you respond to inquiries?",
      answer:
        "We aim to respond to all inquiries within 24-48 hours during business days.",
    },
    {
      question: "Do you offer API access to your database?",
      answer:
        "Yes, we offer API access for developers. Please contact our team at api@MOdb.com for more information about our API documentation and access.",
    },
    {
      question: "How can I become a contributor?",
      answer:
        "We're always looking for passionate movie and TV enthusiasts to join our team. Send us your resume and a cover letter explaining why you'd like to contribute to MODB.",
    },
  ];

  // Social media links
  const socialLinks = [
    { icon: "ri-twitter-fill", url: "#" },
    { icon: "ri-facebook-fill", url: "#" },
    { icon: "ri-instagram-line", url: "#" },
    { icon: "ri-youtube-fill", url: "#" },
    { icon: "ri-linkedin-fill", url: "#" },
  ];

  if (!isLoaded) {
    return (
      <Suspense
        fallback={
          <div className="w-full h-screen bg-zinc-900 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-zinc-700 border-t-[#00b1b3] rounded-full animate-spin"></div>
          </div>
        }
      >
        <Preloader />
      </Suspense>
    );
  }

  return (
    <div className="w-full bg-zinc-900 min-h-screen text-zinc-100 overflow-x-hidden">
      {/* Particle Background - only on desktop */}
      {!isMobile && (
        <div className="fixed inset-0 pointer-events-none z-0">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-[#00b1b3]/20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.3 + 0.1,
                transform: `scale(${Math.random() * 1.5 + 0.5})`,
                animation: `float ${Math.random() * 10 + 20}s linear infinite`,
                animationDelay: `${Math.random() * 10}s`,
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Navigation Bar */}
      <motion.nav
        className="w-full h-[10vh] text-zinc-100 flex items-center gap-4 sm:gap-10 text-xl sticky top-0 z-50 bg-zinc-900/80 backdrop-blur-md"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-[30%] h-full flex items-center gap-4 sm:gap-10 px-3 sm:px-5">
          <Link
            to="/"
            className="hover:text-[#00b1b3] hover:cursor-pointer font-black ri-arrow-left-line transition-colors"
          ></Link>
          <Link to="/" className="hover:text-[#00b1b3] transition-colors">
            <i className="ri-home-line"></i>
          </Link>
          <Link to="/movie" className="hover:text-[#00b1b3] transition-colors">
            <i className="ri-film-line"></i>
          </Link>
          <Link to="/tv" className="hover:text-[#00b1b3] transition-colors">
            <i className="ri-tv-2-line"></i>
          </Link>
        </div>
        <div className="w-[70%] flex justify-end pr-4 sm:pr-8">
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="text-xl sm:text-2xl font-bold text-[#00b1b3] ri-tv-fill"></i>
            <h1 className="text-xl sm:text-2xl font-bold text-[#00b1b3]">
              <span className="px-1"></span>MODB
            </h1>
          </motion.div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.div
        className="w-full h-[30vh] bg-gradient-to-b from-[#00b1b3]/20 to-zinc-900 flex items-center justify-center relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute w-64 h-64 rounded-full bg-[#00b1b3]/10 blur-3xl"
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 15,
              ease: "easeInOut",
            }}
            style={{ left: "30%", top: "20%" }}
          ></motion.div>

          <motion.div
            className="absolute w-48 h-48 rounded-full bg-purple-500/10 blur-3xl"
            animate={{
              x: [0, -20, 0],
              y: [0, 30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 12,
              ease: "easeInOut",
              delay: 1,
            }}
            style={{ right: "25%", bottom: "10%" }}
          ></motion.div>
        </div>

        <div className="text-center z-10 px-4">
          <motion.h1
            className="text-4xl sm:text-5xl font-bold mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="text-[#00b1b3]">Contact</span> Us
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl max-w-2xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            We'd love to hear from you. Get in touch with our team.
          </motion.p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Contact Information */}
          <motion.div
            className="md:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-zinc-800/40 p-6 sm:p-8 rounded-lg border-l-4 border-[#00b1b3] hover:shadow-[0_0_15px_rgba(0,177,179,0.3)] transition duration-300 h-full relative overflow-hidden">
              {/* Background glow */}
              <div className="absolute -inset-[100px] bg-[#00b1b3]/5 rounded-full blur-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

              <h3 className="text-xl sm:text-2xl font-bold mb-6 text-[#00b1b3] flex items-center">
                <i className="ri-contacts-book-line mr-2"></i>
                Contact Information
              </h3>

              <div className="space-y-6 relative z-10">
                <ContactInfoItem icon="ri-map-pin-line" title="Our Location">
                  <p className="text-zinc-300">
                    123 Entertainment Blvd,
                    <br />
                    Los Angeles, CA 90001
                  </p>
                </ContactInfoItem>

                <ContactInfoItem icon="ri-mail-line" title="Email Us">
                  <p className="text-zinc-300">contact@MOdb.com</p>
                  <p className="text-zinc-300">support@MOdb.com</p>
                </ContactInfoItem>

                <ContactInfoItem icon="ri-phone-line" title="Call Us">
                  <p className="text-zinc-300">+1 (555) 123-4567</p>
                  <p className="text-zinc-300">Mon-Fri, 9am-5pm PST</p>
                </ContactInfoItem>

                <ContactInfoItem icon="ri-time-line" title="Working Hours">
                  <p className="text-zinc-300">
                    Monday - Friday: 9am - 5pm
                    <br />
                    Weekend: Closed
                  </p>
                </ContactInfoItem>
              </div>

              <div className="mt-8 relative z-10">
                <h4 className="font-semibold mb-4">Connect With Us</h4>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((link, index) => (
                    <SocialLink key={index} icon={link.icon} url={link.url} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-zinc-800/40 p-6 sm:p-8 rounded-lg border-l-4 border-[#00b1b3] hover:shadow-[0_0_15px_rgba(0,177,179,0.3)] transition duration-300 relative overflow-hidden">
              {/* Background glow */}
              <div className="absolute -inset-[100px] bg-[#00b1b3]/5 rounded-full blur-3xl pointer-events-none"></div>

              <h3 className="text-xl sm:text-2xl font-bold mb-6 text-[#00b1b3] flex items-center relative z-10">
                <i className="ri-mail-send-line mr-2"></i>
                Send Us a Message
              </h3>

              <AnimatePresence>
                {submitStatus === "success" && (
                  <motion.div
                    className="mb-6 p-4 bg-[#00b1b3]/20 border border-[#00b1b3] rounded-md text-center relative z-10"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <p className="text-[#00b1b3] font-semibold flex items-center justify-center">
                      <i className="ri-check-line mr-2"></i>
                      Thank you for your message! We'll get back to you soon.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block mb-2 font-medium">
                      Your Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <i className="ri-user-line text-zinc-400"></i>
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 bg-zinc-700/50 border ${
                          formErrors.name ? "border-red-500" : "border-zinc-600"
                        } rounded-md focus:outline-none focus:border-[#00b1b3] transition`}
                        placeholder="John Doe"
                      />
                    </div>
                    {formErrors.name && (
                      <p className="mt-1 text-red-500 text-sm">
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block mb-2 font-medium">
                      Your Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <i className="ri-mail-line text-zinc-400"></i>
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 bg-zinc-700/50 border ${
                          formErrors.email
                            ? "border-red-500"
                            : "border-zinc-600"
                        } rounded-md focus:outline-none focus:border-[#00b1b3] transition`}
                        placeholder="john@example.com"
                      />
                    </div>
                    {formErrors.email && (
                      <p className="mt-1 text-red-500 text-sm">
                        {formErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="subject" className="block mb-2 font-medium">
                    Subject
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <i className="ri-chat-1-line text-zinc-400"></i>
                    </div>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 bg-zinc-700/50 border ${
                        formErrors.subject
                          ? "border-red-500"
                          : "border-zinc-600"
                      } rounded-md focus:outline-none focus:border-[#00b1b3] transition`}
                      placeholder="How can we help you?"
                    />
                  </div>
                  {formErrors.subject && (
                    <p className="mt-1 text-red-500 text-sm">
                      {formErrors.subject}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label htmlFor="message" className="block mb-2 font-medium">
                    Your Message
                  </label>
                  <div className="relative">
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="5"
                      className={`w-full px-4 py-3 bg-zinc-700/50 border ${
                        formErrors.message
                          ? "border-red-500"
                          : "border-zinc-600"
                      } rounded-md focus:outline-none focus:border-[#00b1b3] transition`}
                      placeholder="Tell us what you need help with..."
                    ></textarea>
                  </div>
                  {formErrors.message && (
                    <p className="mt-1 text-red-500 text-sm">
                      {formErrors.message}
                    </p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-3 bg-[#00b1b3] text-white font-medium rounded-md hover:bg-[#00989a] transition duration-300 flex items-center justify-center ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                >
                  {isSubmitting ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="ri-send-plane-fill mr-2"></i>
                      Send Message
                    </>
                  )}
                </motion.button>
              </form>
            </div>

            {/* FAQ Section */}
            <motion.div
              className="mt-8 bg-zinc-800/40 p-6 sm:p-8 rounded-lg border-l-4 border-[#00b1b3] hover:shadow-[0_0_15px_rgba(0,177,179,0.3)] transition duration-300 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* Background glow */}
              <div className="absolute -inset-[100px] bg-[#00b1b3]/5 rounded-full blur-3xl pointer-events-none"></div>

              <h3 className="text-xl sm:text-2xl font-bold mb-6 text-[#00b1b3] flex items-center relative z-10">
                <i className="ri-question-answer-line mr-2"></i>
                Frequently Asked Questions
              </h3>

              <div className="space-y-4 relative z-10">
                {faqItems.map((item, index) => (
                  <FaqItem
                    key={index}
                    question={item.question}
                    answer={item.answer}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Map Section */}
        <motion.div
          className="mt-12 bg-zinc-800/40 p-6 sm:p-8 rounded-lg border-l-4 border-[#00b1b3] hover:shadow-[0_0_15px_rgba(0,177,179,0.3)] transition duration-300 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Background glow */}
          <div className="absolute -inset-[100px] bg-[#00b1b3]/5 rounded-full blur-3xl pointer-events-none"></div>

          <h3 className="text-xl sm:text-2xl font-bold mb-6 text-[#00b1b3] flex items-center relative z-10">
            <i className="ri-map-pin-line mr-2"></i>
            Find Us
          </h3>

          <div className="w-full h-[300px] bg-zinc-700/50 rounded-md flex items-center justify-center relative z-10 overflow-hidden group">
            {/* Map placeholder with 3D effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-700/80 to-zinc-800/80"></div>

            {/* Grid lines */}
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 pointer-events-none">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={`v-${i}`}
                  className="h-full w-px bg-zinc-600/20"
                ></div>
              ))}
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={`h-${i}`}
                  className="w-full h-px bg-zinc-600/20"
                ></div>
              ))}
            </div>

            {/* Location pin */}
            <motion.div
              className="absolute"
              style={{ left: "50%", top: "50%" }}
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
              }}
            >
              <div className="relative -translate-x-1/2 -translate-y-1/2">
                <div className="w-6 h-6 bg-[#00b1b3] rounded-full flex items-center justify-center shadow-lg shadow-[#00b1b3]/20">
                  <i className="ri-map-pin-fill text-white"></i>
                </div>
                <div className="w-20 h-20 bg-[#00b1b3]/20 rounded-full absolute -inset-7 animate-ping opacity-30"></div>
              </div>
            </motion.div>

            {/* Location info */}
            <div className="absolute bottom-0 left-0 right-0 bg-zinc-800/80 backdrop-blur-sm p-4 text-center transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <p className="text-lg font-medium text-[#00b1b3]">
                MODB Headquarters
              </p>
              <p className="text-zinc-300 text-sm mt-1">
                123 Entertainment Blvd, Los Angeles, CA 90001
              </p>
              <div className="mt-2 flex justify-center gap-4">
                <a
                  href="#"
                  className="text-sm text-[#00b1b3] hover:underline flex items-center"
                >
                  <i className="ri-navigation-line mr-1"></i> Get Directions
                </a>
                <a
                  href="#"
                  className="text-sm text-[#00b1b3] hover:underline flex items-center"
                >
                  <i className="ri-phone-line mr-1"></i> Call
                </a>
              </div>
            </div>

            <div className="text-center z-10">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <i className="ri-map-pin-line text-5xl text-[#00b1b3] mb-3"></i>
                <p className="text-lg">
                  Interactive map would be displayed here
                </p>
                <p className="text-zinc-400 text-sm mt-2">
                  123 Entertainment Blvd, Los Angeles, CA 90001
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        className="w-full py-6 bg-zinc-800/60 mt-12 relative z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-4">
            <Link to="/" className="hover:text-[#00b1b3] transition-colors">
              Home
            </Link>
            <Link
              to="/movie"
              className="hover:text-[#00b1b3] transition-colors"
            >
              Movies
            </Link>
            <Link to="/tv" className="hover:text-[#00b1b3] transition-colors">
              TV Shows
            </Link>
            <Link
              to="/about"
              className="hover:text-[#00b1b3] transition-colors"
            >
              About
            </Link>
            <Link to="/contact" className="text-[#00b1b3]">
              Contact
            </Link>
          </div>

          <div className="flex justify-center space-x-4 mb-4">
            {socialLinks.map((link, index) => (
              <motion.a
                key={index}
                href={link.url}
                className="text-xl hover:text-[#00b1b3] transition-colors"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <i className={link.icon}></i>
              </motion.a>
            ))}
          </div>

          <p className="text-zinc-400">
            © {new Date().getFullYear()} MODB. All rights reserved.
          </p>
        </div>
      </motion.footer>

      {/* Add keyframes for animations - only once */}
      <style jsx="true">{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0) scale(1);
          }
          33% {
            transform: translateY(-15px) translateX(10px) scale(1.1);
          }
          66% {
            transform: translateY(-30px) translateX(-10px) scale(0.9);
          }
          100% {
            transform: translateY(0) translateX(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default ContactUs;
