import React, { useState, useEffect, memo, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Lazy load components for better performance
const Preloader = lazy(() => import("./templates/Preloader"));

// Memoized components to prevent unnecessary re-renders
const FeatureItem = memo(({ icon, children }) => (
  <motion.li
    className="flex items-center"
    initial={{ opacity: 0, x: -10 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.3 }}
  >
    <i className={`${icon} text-[#00b1b3] mr-2`}></i>
    {children}
  </motion.li>
));

const ContactItem = memo(({ icon, title, content, links }) => (
  <motion.div
    className="flex flex-col items-center text-center"
    whileHover={{ y: -5 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className="w-16 h-16 rounded-full bg-zinc-700/50 flex items-center justify-center mb-3 shadow-lg">
      <i className={`${icon} text-3xl text-[#00b1b3]`}></i>
    </div>
    <h4 className="text-lg font-semibold mb-2">{title}</h4>
    {content && <p>{content}</p>}
    {links && (
      <div className="flex space-x-4 mt-2">
        {links.map((link, index) => (
          <motion.a
            key={index}
            href={link.url}
            className="text-2xl hover:text-[#00b1b3] transition-colors"
            whileHover={{ scale: 1.2, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <i className={link.icon}></i>
          </motion.a>
        ))}
      </div>
    )}
  </motion.div>
));

const InfoCard = memo(({ title, children, delay = 0 }) => (
  <motion.div
    className="bg-zinc-800/40 p-6 sm:p-8 rounded-lg border-l-4 border-[#00b1b3] hover:shadow-[0_0_15px_rgba(0,177,179,0.3)] transition duration-300 relative overflow-hidden group"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-[#00b1b3]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

    <h3 className="text-xl sm:text-2xl font-bold mb-4 text-[#00b1b3] flex items-center">
      {title}
    </h3>

    <div className="relative z-10">{children}</div>
  </motion.div>
));

const AboutUs = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
    document.title = "About Us | MODB";

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
      if (window.resizeTimer) clearTimeout(window.resizeTimer);
    };
  }, []);

  // Social media links
  const socialLinks = [
    { icon: "ri-twitter-fill", url: "#" },
    { icon: "ri-facebook-fill", url: "#" },
    { icon: "ri-instagram-line", url: "#" },
    { icon: "ri-youtube-fill", url: "#" },
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
          {Array.from({ length: 20 }).map((_, i) => (
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
        className="w-full h-[40vh] bg-gradient-to-b from-[#00b1b3]/20 to-zinc-900 flex items-center justify-center relative overflow-hidden"
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
            className="text-4xl sm:text-6xl font-bold mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="text-[#00b1b3]">MODB</span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl max-w-2xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Your ultimate destination for discovering movies and TV shows
          </motion.p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
          {/* Our Story */}
          <InfoCard title="Our Story" delay={0.1}>
            <p className="mb-4 text-zinc-300">
              MODB was founded in 2023 with a simple mission: to create the most
              comprehensive and user-friendly database of movies and TV shows.
            </p>
            <p className="text-zinc-300">
              What started as a passion project has grown into a platform loved
              by entertainment enthusiasts worldwide, offering detailed
              information on thousands of titles.
            </p>
          </InfoCard>

          {/* Our Mission */}
          <InfoCard title="Our Mission" delay={0.2}>
            <p className="mb-4 text-zinc-300">
              We believe that finding your next favorite movie or TV show should
              be an enjoyable experience. Our mission is to provide accurate,
              comprehensive information in an intuitive interface.
            </p>
            <p className="text-zinc-300">
              We're committed to helping you discover content that matches your
              interests, from blockbuster hits to hidden gems.
            </p>
          </InfoCard>

          {/* Features */}
          <InfoCard title="What We Offer" delay={0.3}>
            <ul className="space-y-3">
              <FeatureItem icon="ri-check-line">
                Comprehensive database of movies and TV shows
              </FeatureItem>
              <FeatureItem icon="ri-check-line">
                Detailed information including cast, crew, and ratings
              </FeatureItem>
              <FeatureItem icon="ri-check-line">
                Personalized recommendations based on your preferences
              </FeatureItem>
              <FeatureItem icon="ri-check-line">
                Integration with major streaming platforms
              </FeatureItem>
              <FeatureItem icon="ri-check-line">
                User reviews and community discussions
              </FeatureItem>
            </ul>
          </InfoCard>

          {/* Team */}
          <InfoCard title="Our Team" delay={0.4}>
            <p className="mb-4 text-zinc-300">
              Behind MODB is a team of passionate film buffs, TV enthusiasts,
              and talented developers dedicated to creating the best
              entertainment database.
            </p>
            <p className="text-zinc-300">
              We're constantly working to improve our platform, add new
              features, and expand our database to ensure you have access to the
              most up-to-date information.
            </p>
          </InfoCard>
        </div>

        {/* Contact Section */}
        <motion.div
          className="mt-12 sm:mt-16 bg-zinc-800/40 p-6 sm:p-8 rounded-lg border-l-4 border-[#00b1b3] hover:shadow-[0_0_15px_rgba(0,177,179,0.3)] transition duration-300 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {/* Background glow */}
          <div className="absolute -inset-[100px] bg-[#00b1b3]/5 rounded-full blur-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

          <h3 className="text-xl sm:text-2xl font-bold mb-6 text-[#00b1b3] flex items-center">
            Get In Touch
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative z-10">
            <ContactItem
              icon="ri-mail-line"
              title="Email Us"
              content="contact@MOdb.com"
            />

            <ContactItem
              icon="ri-customer-service-2-line"
              title="Support"
              content="support@MOdb.com"
            />

            <ContactItem
              icon="ri-global-line"
              title="Follow Us"
              links={socialLinks}
            />
          </div>
        </motion.div>

        {/* Newsletter Section */}
        <motion.div
          className="mt-12 bg-[#00b1b3]/10 p-6 sm:p-8 rounded-lg relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="absolute -inset-[100px] bg-[#00b1b3]/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="md:w-1/2">
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-[#00b1b3]">
                Stay Updated
              </h3>
              <p className="text-zinc-300">
                Subscribe to our newsletter to get the latest updates on new
                releases, features, and exclusive content.
              </p>
            </div>

            <div className="w-full md:w-1/2">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-grow px-4 py-3 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b1b3] transition-all"
                />
                <motion.button
                  className="px-6 py-3 bg-[#00b1b3] text-zinc-900 font-medium rounded-lg hover:bg-[#00c8ca] transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Subscribe
                </motion.button>
              </div>
              <p className="text-xs text-zinc-400 mt-2">
                We respect your privacy. Unsubscribe at any time.
              </p>
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
            <Link to="/about" className="text-[#00b1b3]">
              About
            </Link>
            <Link
              to="/contact"
              className="hover:text-[#00b1b3] transition-colors"
            >
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

export default AboutUs;
