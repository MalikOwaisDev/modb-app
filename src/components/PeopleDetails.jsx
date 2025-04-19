import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  memo,
  lazy,
  Suspense,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { asyncLoadPeople, removePeople } from "../store/actions/peopleActions";
// import TopNav from "./templates/TopNav";
import SideNav from "./templates/sideNav";
import { motion, AnimatePresence } from "framer-motion";
import Search from "./templates/Search";

// Lazy load components for better performance
const Preloader = lazy(() => import("./templates/Preloader"));
const HorizontalCards = lazy(() => import("./templates/HorizontalCards"));

// Memoized components to prevent unnecessary re-renders
const ParticlesBackground = memo(({ isMobile }) => {
  // Generate particles once and store them
  const particles = useRef(
    Array.from({ length: isMobile ? 5 : 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      opacity: Math.random() * 0.3 + 0.1,
      scale: Math.random() * 1.5 + 0.5,
      duration: Math.random() * 10 + 20,
      delay: Math.random() * 10,
    }))
  ).current;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 rounded-full bg-[#00b1b3]/20"
          style={{
            left: particle.left,
            top: particle.top,
            opacity: particle.opacity,
            transform: `scale(${particle.scale})`,
            animation: `float ${particle.duration}s linear infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        ></div>
      ))}
    </div>
  );
});

// Memoized media card component
const MediaCard = memo(({ item, type, index }) => {
  return (
    <motion.div
      className="bg-zinc-700/30 rounded-lg overflow-hidden group"
      whileHover={{
        scale: 1.03,
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: "easeOut",
      }}
    >
      <Link to={`/${type}/${item.id}`}>
        <div className="aspect-[2/3] relative">
          {item.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
              alt={item.title || item.name}
              className="w-full h-full object-cover transition-transform duration-500 "
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
              <i className="ri-image-line text-3xl text-zinc-600"></i>
            </div>
          )}

          {/* Rating badge */}
          {item.vote_average > 0 && (
            <div className="absolute top-2 right-2 bg-black/50 text-xs px-2 py-1 rounded-full backdrop-blur-sm flex items-center">
              <i className="ri-star-fill text-yellow-500 mr-1 text-xs"></i>
              {item.vote_average.toFixed(1)}
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
            <div className="w-full">
              <div className="text-xs bg-zinc-900/70 px-2 py-1 rounded backdrop-blur-sm inline-block">
                View Details
              </div>
            </div>
          </div>
        </div>

        <div className="p-2">
          <h4 className="text-sm font-medium truncate">
            {item.title || item.name}
          </h4>
          {(item.release_date || item.first_air_date) && (
            <p className="text-xs text-zinc-400">
              {new Date(item.release_date || item.first_air_date).getFullYear()}
            </p>
          )}
          {item.character && (
            <p className="text-xs text-zinc-300 italic truncate">
              as {item.character}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
});

const PeopleDetails = () => {
  const [searchVisible, setSearchVisible] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isVisible, setIsVisible] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const mainRef = useRef(null);
  const mouseTimerRef = useRef(null);
  const scrollTimerRef = useRef(null);

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();

  const { info } = useSelector((state) => state.people);

  // Check if mobile/tablet on mount and when window resizes
  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    // Initial check
    checkDeviceType();

    // Add event listener with debounce
    const handleResize = () => {
      if (window.resizeTimer) clearTimeout(window.resizeTimer);
      window.resizeTimer = setTimeout(checkDeviceType, 100);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Track mouse position for 3D effects - throttled for performance
  const handleMouseMove = useCallback(
    (e) => {
      if (isMobile || isTablet) return;

      if (mouseTimerRef.current) return;

      mouseTimerRef.current = setTimeout(() => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        const x = (clientX / innerWidth) * 2 - 1;
        const y = (clientY / innerHeight) * 2 - 1;
        setMousePosition({ x, y });
        mouseTimerRef.current = null;
      }, 50); // Throttle to 50ms
    },
    [isMobile, isTablet]
  );

  // Track scroll position for parallax effects - throttled for performance
  const handleScroll = useCallback(() => {
    if (!mainRef.current || scrollTimerRef.current) return;

    scrollTimerRef.current = setTimeout(() => {
      setScrollPosition(mainRef.current.scrollTop);
      scrollTimerRef.current = null;
    }, 50); // Throttle to 50ms
  }, []);

  // Format date - memoized for performance
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  // Calculate age
  const calculateAge = useCallback((birthDate, deathDate = null) => {
    if (!birthDate) return null;

    const birth = new Date(birthDate);
    const end = deathDate ? new Date(deathDate) : new Date();

    let age = end.getFullYear() - birth.getFullYear();
    const monthDiff = end.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }, []);

  useEffect(() => {
    dispatch(asyncLoadPeople(id));
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setIsVisible(true), 100);

    return () => {
      dispatch(removePeople());
      clearTimeout(timer);
    };
  }, [id, dispatch]);

  // Add scroll event listener
  useEffect(() => {
    const mainElement = mainRef.current;
    if (mainElement) {
      mainElement.addEventListener("scroll", handleScroll);
      return () => {
        mainElement.removeEventListener("scroll", handleScroll);
      };
    }
  }, [handleScroll]);

  // Set document title
  useEffect(() => {
    if (info && info.details) {
      document.title = info.details.name
        ? `${info.details.name} | MODB People`
        : "MODB | People";
    } else {
      document.title = "MODB | Loading Person";
    }
  }, [info]);

  // Add keyframes for animations - only once
  useEffect(() => {
    if (!document.getElementById("people-details-animations")) {
      const style = document.createElement("style");
      style.id = "people-details-animations";
      style.textContent = `
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

        /* Custom scrollbar */
        main::-webkit-scrollbar {
          width: 6px;
        }

        main::-webkit-scrollbar-track {
          background: #1e1e1e;
        }

        main::-webkit-scrollbar-thumb {
          background-color: #00b1b3;
          border-radius: 6px;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      // Clear any pending timers
      if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  // Calculate sidebar width based on screen size
  const mainWidth = isMobile ? "100%" : isTablet ? "100%" : "100%";
  const mainMargin = isMobile ? "0%" : isTablet ? "0%" : "4%";

  if (!info)
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

  // Group credits by media type and sort by popularity
  const groupedCredits = {
    movie: [],
    tv: [],
  };

  if (info.combinedCredits) {
    if (info.combinedCredits.cast) {
      info.combinedCredits.cast.forEach((credit) => {
        const type =
          credit.media_type || (credit.first_air_date ? "tv" : "movie");
        if (groupedCredits[type]) {
          groupedCredits[type].push({ ...credit, role: "cast" });
        }
      });
    }

    if (info.combinedCredits.crew) {
      info.combinedCredits.crew.forEach((credit) => {
        const type =
          credit.media_type || (credit.first_air_date ? "tv" : "movie");
        if (groupedCredits[type]) {
          groupedCredits[type].push({ ...credit, role: "crew" });
        }
      });
    }

    // Sort by popularity and release date
    Object.keys(groupedCredits).forEach((type) => {
      groupedCredits[type].sort((a, b) => {
        // First by popularity
        if (b.popularity !== a.popularity) {
          return b.popularity - a.popularity;
        }

        // Then by release date (newest first)
        const dateA = a.release_date || a.first_air_date || "0";
        const dateB = b.release_date || b.first_air_date || "0";
        return dateB.localeCompare(dateA);
      });

      // Remove duplicates (same movie/show but different roles)
      const uniqueIds = new Set();
      groupedCredits[type] = groupedCredits[type].filter((item) => {
        if (uniqueIds.has(item.id)) {
          return false;
        }
        uniqueIds.add(item.id);
        return true;
      });
    });
  }

  return (
    <div
      className="flex w-full min-h-screen bg-zinc-900 text-white overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* SideNav - hidden on mobile */}
      {!isMobile && <SideNav />}

      <main
        ref={mainRef}
        className="min-h-screen overflow-y-auto overflow-x-hidden pb-16 relative"
        style={{
          width: mainWidth,
          marginLeft: isMobile ? "0" : mainMargin,
          scrollbarWidth: "thin",
          scrollbarColor: "#00b1b3 #1e1e1e",
        }}
      >
        {/* Background ambient glow - only on desktop */}
        {!isMobile && !isTablet && (
          <div
            className="fixed inset-0 pointer-events-none opacity-20 z-0"
            style={{
              background: `radial-gradient(circle at ${
                50 + mousePosition.x * 20
              }% ${
                50 + mousePosition.y * 20
              }%, rgba(0, 177, 179, 0.15), transparent 70%)`,
              transition: "background 0.3s ease-out",
            }}
          ></div>
        )}

        {/* Floating particles - optimized with memoization */}
        <ParticlesBackground isMobile={isMobile} />

        {/* Hero Section with Profile Image */}
        <div className="relative w-full h-[25vh] sm:h-[30vh] md:h-[40vh] bg-cover bg-center bg-no-repeat overflow-hidden">
          {/* Backdrop fallback if no image */}
          {!info.details?.profile_path && (
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900"></div>
          )}

          {/* Gradient Overlay with enhanced depth */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/70 to-transparent"
            style={{
              background: `linear-gradient(to top,
                rgb(24, 24, 27) 0%,
                rgba(24, 24, 27, 0.8) 40%,
                rgba(24, 24, 27, 0.4) 70%,
                rgba(24, 24, 27, 0.1) 90%,
                rgba(0, 0, 0, 0) 100%)`,
            }}
          ></div>

          {/* Floating accent lights - only on desktop */}
          {!isMobile && !isTablet && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div
                className="absolute w-64 h-64 rounded-full bg-[#00b1b3]/10 blur-3xl"
                style={{
                  left: `${40 + mousePosition.x * 5}%`,
                  top: `${30 + mousePosition.y * 5}%`,
                  opacity: 0.4,
                  transform: `translateZ(10px)`,
                  transition: "left 0.5s ease-out, top 0.5s ease-out",
                }}
              ></div>
              <div
                className="absolute w-48 h-48 rounded-full bg-purple-500/10 blur-3xl"
                style={{
                  right: `${30 - mousePosition.x * 5}%`,
                  top: `${60 - mousePosition.y * 5}%`,
                  opacity: 0.3,
                  transform: `translateZ(5px)`,
                  transition: "right 0.5s ease-out, top 0.5s ease-out",
                }}
              ></div>
            </div>
          )}

          {/* Navigation Bar */}
          <motion.div
            className="absolute top-0 left-0 w-full px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex justify-between items-center z-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="flex items-center space-x-3 sm:space-x-6">
              <motion.button
                onClick={() => navigate(-1)}
                className="w-8 h-8 sm:w-10 hover:cursor-pointer sm:h-10 flex items-center justify-center rounded-full bg-zinc-800/80 hover:bg-[#00b1b3] transition-all text-white overflow-hidden group relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                }}
              >
                <i className="ri-arrow-left-s-line text-lg sm:text-xl relative z-10"></i>
                <div className="absolute inset-0 bg-[#00b1b3] transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-full"></div>
              </motion.button>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/"
                  className="text-[#00b1b3] hover:text-white transition-colors flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-zinc-800/50 rounded-full"
                  style={{
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <i className="ri-home-4-line text-lg sm:text-xl"></i>
                </Link>
              </motion.div>
            </div>

            <div className="relative">
              <motion.button
                onClick={() => setSearchVisible(!searchVisible)}
                className="w-8 h-8 sm:w-10 hover:cursor-pointer sm:h-10 flex items-center justify-center rounded-full bg-zinc-800/80 hover:bg-[#00b1b3] transition-all text-white overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                }}
              >
                <i
                  className={`${
                    searchVisible ? "ri-close-line" : "ri-search-line"
                  } text-lg sm:text-xl relative z-10`}
                ></i>
                <div className="absolute inset-0 bg-[#00b1b3] transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-full"></div>
              </motion.button>

              <AnimatePresence>
                {searchVisible && (
                  <motion.div
                    className="absolute right-0 top-12 w-[90vw] sm:w-[400px] md:w-[500px] bg-zinc-800/95 backdrop-blur-md rounded-lg shadow-xl z-100 p-2"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                      transformOrigin: "top right",
                    }}
                  >
                    <Search />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Person Name and Quick Info */}
          <motion.div
            className="absolute bottom-0 left-0 w-full px-4 sm:px-8 md:px-12 pb-6 sm:pb-8 md:pb-12 z-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          >
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              {info.details?.known_for_department && (
                <motion.span
                  className="text-xs sm:text-sm bg-[#00b1b3]/80 px-2 sm:px-3 py-1 rounded-full"
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(0, 177, 179, 0.9)",
                  }}
                  style={{
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {info.details.known_for_department}
                </motion.span>
              )}

              {info.details?.birthday && (
                <motion.span
                  className="text-xs sm:text-sm bg-zinc-800/80 px-2 sm:px-3 py-1 rounded-full"
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(39, 39, 42, 0.9)",
                  }}
                  style={{
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {calculateAge(info.details.birthday, info.details.deathday)}{" "}
                  years old
                </motion.span>
              )}

              {info.details?.place_of_birth && (
                <motion.span
                  className="text-xs sm:text-sm bg-zinc-800/80 px-2 sm:px-3 py-1 rounded-full"
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(39, 39, 42, 0.9)",
                  }}
                  style={{
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <i className="ri-map-pin-line mr-1"></i>
                  {info.details.place_of_birth}
                </motion.span>
              )}
            </div>

            <h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 leading-tight"
              style={{
                textShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
              }}
            >
              {info.details?.name}
            </h1>

            {info.details?.also_known_as &&
              info.details.also_known_as.length > 0 && (
                <p
                  className="text-sm sm:text-base text-zinc-300 mb-3 sm:mb-4"
                  style={{
                    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  Also known as: {info.details.also_known_as[0]}
                  {info.details.also_known_as.length > 1 &&
                    ` and ${info.details.also_known_as.length - 1} more`}
                </p>
              )}

            <div className="flex flex-wrap gap-3 sm:gap-4">
              {info.externalIds?.imdb_id && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <a
                    href={`https://www.imdb.com/name/${info.externalIds.imdb_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-[#f5c518] hover:bg-[#f5c518]/90 transition-colors rounded-full text-black font-medium group relative overflow-hidden text-sm sm:text-base"
                    style={{
                      boxShadow:
                        "0 8px 20px rgba(0, 0, 0, 0.3), 0 0 15px rgba(245, 197, 24, 0.3)",
                    }}
                  >
                    <span className="relative z-10 flex items-center">
                      <i className="ri-film-line text-lg sm:text-xl mr-1 sm:mr-2"></i>
                      IMDb Profile
                    </span>

                    {/* Animated glow effect */}
                    <span className="absolute inset-0 overflow-hidden">
                      <span
                        className="absolute -inset-[10px] bg-[#f5c518] opacity-30 blur-md group-hover:opacity-50 transition-opacity"
                        style={{
                          transform: "translateZ(-5px)",
                        }}
                      ></span>
                    </span>

                    {/* Hover effect */}
                    <span
                      className="absolute inset-0 bg-gradient-to-r from-[#f5c518]/80 to-[#ffdd4d]/80 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        transform: "translateZ(0)",
                      }}
                    ></span>
                  </a>
                </motion.div>
              )}

              {info.externalIds?.instagram_id && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <a
                    href={`https://www.instagram.com/${info.externalIds.instagram_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-[#E1306C]/80 hover:bg-[#E1306C] transition-colors rounded-full text-white font-medium group relative overflow-hidden text-sm sm:text-base"
                    style={{
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <span className="relative z-10 flex items-center">
                      <i className="ri-instagram-line mr-1 sm:mr-2"></i>
                      Instagram
                    </span>

                    {/* Hover effect */}
                    <span
                      className="absolute inset-0 bg-gradient-to-r from-[#E1306C]/80 to-[#F77737]/80 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        transform: "translateZ(0)",
                      }}
                    ></span>
                  </a>
                </motion.div>
              )}

              {info.externalIds?.twitter_id && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <a
                    href={`https://twitter.com/${info.externalIds.twitter_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-[#1DA1F2]/80 hover:bg-[#1DA1F2] transition-colors rounded-full text-white font-medium group relative overflow-hidden text-sm sm:text-base"
                    style={{
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <span className="relative z-10 flex items-center">
                      <i className="ri-twitter-x-line mr-1 sm:mr-2"></i>
                      Twitter
                    </span>

                    {/* Hover effect */}
                    <span
                      className="absolute inset-0 bg-gradient-to-r from-[#1DA1F2]/80 to-[#0D8BD9]/80 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        transform: "translateZ(0)",
                      }}
                    ></span>
                  </a>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <motion.div
          className="px-4 sm:px-8 md:px-12 py-6 sm:py-8 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        >
          {/* Tabs Navigation */}
          <div
            className="flex overflow-x-auto overflow-y-hidden border-b border-zinc-700 mb-6 sm:mb-8 relative"
            style={{
              transform: `perspective(1000px) rotateX(${
                mousePosition.y * -0.5
              }deg) rotateY(${mousePosition.x * 0.5}deg)`,
              transformStyle: "preserve-3d",
              transition: "transform 0.3s ease-out",
            }}
          >
            {["overview", "movies", "tv", "photos"].map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 hover:cursor-pointer sm:px-6 py-2 sm:py-3 font-medium transition-colors relative whitespace-nowrap ${
                  activeTab === tab
                    ? "text-[#00b1b3]"
                    : "text-zinc-400 hover:text-white"
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                style={{
                  transform:
                    activeTab === tab ? "translateZ(10px)" : "translateZ(0)",
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}

                {/* Active indicator with glow effect */}
                {activeTab === tab && (
                  <motion.div
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00b1b3]"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      boxShadow: "0 0 10px rgba(0, 177, 179, 0.5)",
                    }}
                  ></motion.div>
                )}
              </motion.button>
            ))}

            {/* Decorative glow under tabs */}
            <div
              className="absolute -bottom-1 left-0 right-0 h-[1px] bg-[#00b1b3]/10"
              style={{
                boxShadow: "0 0 8px rgba(0, 177, 179, 0.3)",
              }}
            ></div>
          </div>

          {/* Tab Content */}
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
            {/* Left Column - Profile Image and Quick Info */}
            <div className="w-full lg:w-1/3 flex flex-col">
              {/* Profile Image */}
              <motion.div
                className="relative group overflow-hidden rounded-xl shadow-2xl mb-4 sm:mb-6"
                whileHover={{ scale: 1.02 }}
                style={{
                  boxShadow:
                    "0 20px 40px -20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 177, 179, 0.1)",
                  transform: `perspective(1000px) rotateX(${
                    mousePosition.y * -1
                  }deg) rotateY(${mousePosition.x * 1}deg)`,
                  transformStyle: "preserve-3d",
                  transition:
                    "transform 0.3s ease-out, box-shadow 0.3s ease-out",
                }}
              >
                {info.details?.profile_path ? (
                  <img
                    className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={`https://image.tmdb.org/t/p/w500/${info.details.profile_path}`}
                    alt={info.details.name || "Person profile"}
                    style={{
                      transform: "translateZ(20px)",
                    }}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-zinc-800 flex items-center justify-center">
                    <i className="ri-user-3-line text-3xl sm:text-4xl md:text-5xl text-zinc-600"></i>
                  </div>
                )}

                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4"
                  style={{
                    transform: "translateZ(30px)",
                  }}
                >
                  <div className="text-center">
                    <span className="text-white text-xs sm:text-sm bg-zinc-900/50 px-3 py-1 rounded-full backdrop-blur-sm">
                      View Full Size
                    </span>
                  </div>
                </div>

                {/* Edge glow effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    boxShadow: "inset 0 0 15px rgba(0, 177, 179, 0.5)",
                    transform: "translateZ(10px)",
                  }}
                ></div>
              </motion.div>

              {/* Quick Info */}
              <motion.div
                className="bg-zinc-800/50 rounded-xl p-4 sm:p-6 relative overflow-hidden"
                style={{
                  boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
                  backdropFilter: "blur(10px)",
                  transform: `perspective(1000px) rotateX(${
                    mousePosition.y * -0.5
                  }deg) rotateY(${mousePosition.x * 0.5}deg)`,
                  transformStyle: "preserve-3d",
                  transition: "transform 0.3s ease-out",
                }}
              >
                {/* Background glow */}
                <div
                  className="absolute -inset-[100px] bg-[#00b1b3]/5 rounded-full blur-3xl pointer-events-none"
                  style={{
                    transform: "translateZ(-10px)",
                  }}
                ></div>

                <h3
                  className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center relative"
                  style={{
                    transform: "translateZ(10px)",
                  }}
                >
                  <i
                    className="ri-information-line text-[#00b1b3] mr-2"
                    style={{
                      textShadow: "0 0 10px rgba(0, 177, 179, 0.5)",
                    }}
                  ></i>
                  Personal Info
                </h3>

                <div
                  className="space-y-3 sm:space-y-4 relative"
                  style={{
                    transform: "translateZ(5px)",
                  }}
                >
                  <motion.div
                    className="p-2 sm:p-3 rounded-lg hover:bg-zinc-700/30 transition-colors"
                    whileHover={{ scale: 1.01 }}
                  >
                    <h4 className="text-xs sm:text-sm text-zinc-400">
                      Known For
                    </h4>
                    <p className="font-medium text-sm sm:text-base">
                      {info.details?.known_for_department || "Acting"}
                    </p>
                  </motion.div>

                  {info.details?.birthday && (
                    <motion.div
                      className="p-2 sm:p-3 rounded-lg hover:bg-zinc-700/30 transition-colors"
                      whileHover={{ scale: 1.01 }}
                    >
                      <h4 className="text-xs sm:text-sm text-zinc-400">
                        Birthday
                      </h4>
                      <p className="font-medium text-sm sm:text-base">
                        {formatDate(info.details.birthday)}
                        {info.details.deathday
                          ? ""
                          : ` (${calculateAge(
                              info.details.birthday
                            )} years old)`}
                      </p>
                    </motion.div>
                  )}

                  {info.details?.deathday && (
                    <motion.div
                      className="p-2 sm:p-3 rounded-lg hover:bg-zinc-700/30 transition-colors"
                      whileHover={{ scale: 1.01 }}
                    >
                      <h4 className="text-xs sm:text-sm text-zinc-400">Died</h4>
                      <p className="font-medium text-sm sm:text-base">
                        {formatDate(info.details.deathday)}
                        {` (at age ${calculateAge(
                          info.details.birthday,
                          info.details.deathday
                        )})`}
                      </p>
                    </motion.div>
                  )}

                  {info.details?.place_of_birth && (
                    <motion.div
                      className="p-2 sm:p-3 rounded-lg hover:bg-zinc-700/30 transition-colors"
                      whileHover={{ scale: 1.01 }}
                    >
                      <h4 className="text-xs sm:text-sm text-zinc-400">
                        Place of Birth
                      </h4>
                      <p className="font-medium text-sm sm:text-base">
                        {info.details.place_of_birth}
                      </p>
                    </motion.div>
                  )}

                  {info.details?.gender && (
                    <motion.div
                      className="p-2 sm:p-3 rounded-lg hover:bg-zinc-700/30 transition-colors"
                      whileHover={{ scale: 1.01 }}
                    >
                      <h4 className="text-xs sm:text-sm text-zinc-400">
                        Gender
                      </h4>
                      <p className="font-medium text-sm sm:text-base">
                        {info.details.gender === 1
                          ? "Female"
                          : info.details.gender === 2
                          ? "Male"
                          : "Non-binary"}
                      </p>
                    </motion.div>
                  )}

                  {info.details?.also_known_as &&
                    info.details.also_known_as.length > 0 && (
                      <motion.div
                        className="p-2 sm:p-3 rounded-lg hover:bg-zinc-700/30 transition-colors"
                        whileHover={{ scale: 1.01 }}
                      >
                        <h4 className="text-xs sm:text-sm text-zinc-400">
                          Also Known As
                        </h4>
                        <div className="space-y-1 mt-1">
                          {info.details.also_known_as
                            .slice(0, 3)
                            .map((name, index) => (
                              <p key={index} className="text-sm">
                                {name}
                              </p>
                            ))}
                          {info.details.also_known_as.length > 3 && (
                            <p className="text-xs text-zinc-400">
                              +{info.details.also_known_as.length - 3} more
                              names
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}

                  {/* External Links */}
                  {info.externalIds && (
                    <div
                      className="pt-3 sm:pt-4 border-t border-zinc-700"
                      style={{
                        borderImage:
                          "linear-gradient(to right, transparent, rgba(63, 63, 70, 0.5), transparent) 1",
                      }}
                    >
                      <h4 className="text-xs sm:text-sm text-zinc-400 mb-2 sm:mb-3 flex items-center">
                        <i className="ri-links-line text-[#00b1b3] mr-2 text-xs"></i>
                        Social Media
                      </h4>
                      <div className="flex gap-2 sm:gap-3">
                        {info.externalIds.facebook_id && (
                          <motion.a
                            href={`https://www.facebook.com/${info.externalIds.facebook_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-zinc-700/50 hover:bg-[#1877F2]/20 rounded-lg transition-colors overflow-hidden group"
                            title="Facebook"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                            }}
                          >
                            <i className="ri-facebook-fill text-[#1877F2] relative z-10"></i>
                            <div className="absolute inset-0 bg-[#1877F2]/10 transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-lg"></div>
                          </motion.a>
                        )}

                        {info.externalIds.instagram_id && (
                          <motion.a
                            href={`https://www.instagram.com/${info.externalIds.instagram_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-zinc-700/50 hover:bg-[#E1306C]/20 rounded-lg transition-colors overflow-hidden group"
                            title="Instagram"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                            }}
                          >
                            <i className="ri-instagram-line text-[#E1306C] relative z-10"></i>
                            <div className="absolute inset-0 bg-[#E1306C]/10 transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-lg"></div>
                          </motion.a>
                        )}

                        {info.externalIds.twitter_id && (
                          <motion.a
                            href={`https://twitter.com/${info.externalIds.twitter_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-zinc-700/50 hover:bg-[#1DA1F2]/20 rounded-lg transition-colors overflow-hidden group"
                            title="Twitter"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                            }}
                          >
                            <i className="ri-twitter-x-line text-[#1DA1F2] relative z-10"></i>
                            <div className="absolute inset-0 bg-[#1DA1F2]/10 transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-lg"></div>
                          </motion.a>
                        )}

                        {info.externalIds.imdb_id && (
                          <motion.a
                            href={`https://www.imdb.com/name/${info.externalIds.imdb_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-zinc-700/50 hover:bg-[#f5c518]/20 rounded-lg transition-colors overflow-hidden group"
                            title="IMDb"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                            }}
                          >
                            <i className="ri-film-line text-[#f5c518] relative z-10"></i>
                            <div className="absolute inset-0 bg-[#f5c518]/10 transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-lg"></div>
                          </motion.a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Tab Content */}
            <div className="w-full lg:w-2/3">
              <AnimatePresence mode="wait">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Biography */}
                    <motion.div
                      className="bg-zinc-800/50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 relative overflow-hidden"
                      style={{
                        boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
                        backdropFilter: "blur(10px)",
                        transform: `perspective(1000px) rotateX(${
                          mousePosition.y * -0.5
                        }deg) rotateY(${mousePosition.x * 0.5}deg)`,
                        transformStyle: "preserve-3d",
                        transition: "transform 0.3s ease-out",
                      }}
                    >
                      {/* Background glow */}
                      <div
                        className="absolute -inset-[100px] bg-[#00b1b3]/5 rounded-full blur-3xl pointer-events-none"
                        style={{
                          transform: "translateZ(-10px)",
                        }}
                      ></div>

                      <h3
                        className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center relative"
                        style={{
                          transform: "translateZ(10px)",
                        }}
                      >
                        <i
                          className="ri-file-text-line text-[#00b1b3] mr-2"
                          style={{
                            textShadow: "0 0 10px rgba(0, 177, 179, 0.5)",
                          }}
                        ></i>
                        Biography
                      </h3>

                      <div
                        className="relative"
                        style={{
                          transform: "translateZ(5px)",
                        }}
                      >
                        {info.details?.biography ? (
                          <div>
                            <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
                              {showFullBio
                                ? info.details.biography
                                : info.details.biography.slice(0, 300)}
                              {!showFullBio &&
                                info.details.biography.length > 300 && (
                                  <motion.button
                                    onClick={() => setShowFullBio(true)}
                                    className="ml-1 hover:cursor-pointer text-[#00b1b3] hover:underline"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    Read more
                                  </motion.button>
                                )}
                            </p>
                            {showFullBio &&
                              info.details.biography.length > 300 && (
                                <motion.button
                                  onClick={() => setShowFullBio(false)}
                                  className="mt-2 text-[#00b1b3] hover:underline text-sm"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  Show less
                                </motion.button>
                              )}
                          </div>
                        ) : (
                          <p className="text-zinc-400 italic">
                            No biography available for this person.
                          </p>
                        )}

                        {/* Decorative element */}
                        <div className="absolute -bottom-3 -right-3 w-24 sm:w-32 h-12 sm:h-16 bg-[#00b1b3]/10 rounded-full blur-md pointer-events-none"></div>
                      </div>
                    </motion.div>

                    {/* Known For */}
                    {info.combinedCredits && (
                      <motion.div
                        className="bg-zinc-800/50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 relative overflow-hidden"
                        style={{
                          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
                          backdropFilter: "blur(10px)",
                          transform: `perspective(1000px) rotateX(${
                            mousePosition.y * -0.5
                          }deg) rotateY(${mousePosition.x * 0.5}deg)`,
                          transformStyle: "preserve-3d",
                          transition: "transform 0.3s ease-out",
                        }}
                      >
                        {/* Background glow */}
                        <div
                          className="absolute -inset-[100px] bg-[#00b1b3]/5 rounded-full blur-3xl pointer-events-none"
                          style={{
                            transform: "translateZ(-10px)",
                          }}
                        ></div>

                        <h3
                          className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center relative"
                          style={{
                            transform: "translateZ(10px)",
                          }}
                        >
                          <i
                            className="ri-award-line text-[#00b1b3] mr-2"
                            style={{
                              textShadow: "0 0 10px rgba(0, 177, 179, 0.5)",
                            }}
                          ></i>
                          Known For
                        </h3>

                        <div
                          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 relative overflow-hidden"
                          style={{
                            transform: "translateZ(5px)",
                          }}
                        >
                          {/* Get top 4 most popular credits */}
                          {[...groupedCredits.movie, ...groupedCredits.tv]
                            .sort((a, b) => b.popularity - a.popularity)
                            .slice(0, 4)
                            .map((item, index) => (
                              <MediaCard
                                key={index}
                                item={item}
                                type={
                                  item.media_type ||
                                  (item.first_air_date ? "tv" : "movie")
                                }
                                index={index}
                              />
                            ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Changes */}
                    {info.changes && Object.keys(info.changes).length > 0 && (
                      <motion.div
                        className="bg-zinc-800/50 rounded-xl p-4 sm:p-6 relative overflow-hidden"
                        style={{
                          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
                          backdropFilter: "blur(10px)",
                          transform: `perspective(1000px) rotateX(${
                            mousePosition.y * -0.5
                          }deg) rotateY(${mousePosition.x * 0.5}deg)`,
                          transformStyle: "preserve-3d",
                          transition: "transform 0.3s ease-out",
                        }}
                      >
                        {/* Background glow */}
                        <div
                          className="absolute -inset-[100px] bg-[#00b1b3]/5 rounded-full blur-3xl pointer-events-none"
                          style={{
                            transform: "translateZ(-10px)",
                          }}
                        ></div>

                        <h3
                          className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center relative"
                          style={{
                            transform: "translateZ(10px)",
                          }}
                        >
                          <i
                            className="ri-history-line text-[#00b1b3] mr-2"
                            style={{
                              textShadow: "0 0 10px rgba(0, 177, 179, 0.5)",
                            }}
                          ></i>
                          Recent Updates
                        </h3>

                        <div
                          className="space-y-3 relative"
                          style={{
                            transform: "translateZ(5px)",
                          }}
                        >
                          {Object.entries(info.changes).map(
                            ([key, changes], index) => (
                              <motion.div
                                key={index}
                                className="bg-zinc-700/30 p-3 rounded-lg"
                                whileHover={{
                                  scale: 1.01,
                                  backgroundColor: "rgba(63, 63, 70, 0.5)",
                                }}
                              >
                                <h4 className="text-sm font-medium mb-2 capitalize">
                                  {key.replace(/_/g, " ")}
                                </h4>
                                <div className="space-y-2">
                                  {changes.slice(0, 3).map((change, idx) => (
                                    <div
                                      key={idx}
                                      className="text-xs text-zinc-300"
                                    >
                                      <span className="text-[#00b1b3]">
                                        {new Date(
                                          change.time
                                        ).toLocaleDateString()}
                                      </span>
                                      : {change.action}
                                      {change.value && ` - ${change.value}`}
                                    </div>
                                  ))}
                                  {changes.length > 3 && (
                                    <p className="text-xs text-zinc-400">
                                      +{changes.length - 3} more changes
                                    </p>
                                  )}
                                </div>
                              </motion.div>
                            )
                          )}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Movies Tab */}
                {activeTab === "movies" && (
                  <motion.div
                    key="movies"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    {/* Acting */}
                    {groupedCredits.movie.filter((c) => c.role === "cast")
                      .length > 0 && (
                      <motion.div
                        className="bg-zinc-800/50 rounded-xl p-4 sm:p-6 relative overflow-hidden"
                        style={{
                          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
                          backdropFilter: "blur(10px)",
                          transform: `perspective(1000px) rotateX(${
                            mousePosition.y * -0.5
                          }deg) rotateY(${mousePosition.x * 0.5}deg)`,
                          transformStyle: "preserve-3d",
                          transition: "transform 0.3s ease-out",
                        }}
                      >
                        {/* Background glow */}
                        <div
                          className="absolute -inset-[100px] bg-[#00b1b3]/5 rounded-full blur-3xl pointer-events-none"
                          style={{
                            transform: "translateZ(-10px)",
                          }}
                        ></div>

                        <div className="flex justify-between items-center mb-4">
                          <h3
                            className="text-lg sm:text-xl font-semibold flex items-center relative"
                            style={{
                              transform: "translateZ(10px)",
                            }}
                          >
                            <i
                              className="ri-user-3-line text-[#00b1b3] mr-2"
                              style={{
                                textShadow: "0 0 10px rgba(0, 177, 179, 0.5)",
                              }}
                            ></i>
                            Acting (
                            {
                              groupedCredits.movie.filter(
                                (c) => c.role === "cast"
                              ).length
                            }
                            )
                          </h3>
                          {groupedCredits.movie.filter((c) => c.role === "cast")
                            .length > 8 && (
                            <motion.button
                              className="text-xs sm:text-sm text-[#00b1b3] hover:text-[#00d8da] transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              View All
                            </motion.button>
                          )}
                        </div>

                        <div
                          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 relative"
                          style={{
                            transform: "translateZ(5px)",
                          }}
                        >
                          {groupedCredits.movie
                            .filter((c) => c.role === "cast")
                            .slice(0, 8)
                            .map((item, index) => (
                              <MediaCard
                                key={item.id}
                                item={item}
                                type="movie"
                                index={index}
                              />
                            ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Production */}
                    {groupedCredits.movie.filter(
                      (c) => c.role === "crew" && c.department === "Production"
                    ).length > 0 && (
                      <motion.div
                        className="bg-zinc-800/50 rounded-xl p-4 sm:p-6 relative overflow-hidden"
                        style={{
                          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
                          backdropFilter: "blur(10px)",
                          transform: `perspective(1000px) rotateX(${
                            mousePosition.y * -0.5
                          }deg) rotateY(${mousePosition.x * 0.5}deg)`,
                          transformStyle: "preserve-3d",
                          transition: "transform 0.3s ease-out",
                        }}
                      >
                        {/* Background glow */}
                        <div
                          className="absolute -inset-[100px] bg-[#00b1b3]/5 rounded-full blur-3xl pointer-events-none"
                          style={{
                            transform: "translateZ(-10px)",
                          }}
                        ></div>

                        <div className="flex justify-between items-center mb-4">
                          <h3
                            className="text-lg sm:text-xl font-semibold flex items-center relative"
                            style={{
                              transform: "translateZ(10px)",
                            }}
                          >
                            <i
                              className="ri-film-line text-[#00b1b3] mr-2"
                              style={{
                                textShadow: "0 0 10px rgba(0, 177, 179, 0.5)",
                              }}
                            ></i>
                            Production (
                            {
                              groupedCredits.movie.filter(
                                (c) =>
                                  c.role === "crew" &&
                                  c.department === "Production"
                              ).length
                            }
                            )
                          </h3>

                          {groupedCredits.movie.filter(
                            (c) =>
                              c.role === "crew" && c.department === "Production"
                          ).length > 8 && (
                            <motion.button
                              className="text-xs sm:text-sm text-[#00b1b3] hover:text-[#00d8da] transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              View All
                            </motion.button>
                          )}
                        </div>

                        <div
                          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 relative"
                          style={{
                            transform: "translateZ(5px)",
                          }}
                        >
                          {groupedCredits.movie
                            .filter(
                              (c) =>
                                c.role === "crew" &&
                                c.department === "Production"
                            )
                            .slice(0, 8)
                            .map((item, index) => (
                              <MediaCard
                                key={item.id}
                                item={item}
                                type="movie"
                                index={index}
                              />
                            ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Directing */}
                    {groupedCredits.movie.filter(
                      (c) => c.role === "crew" && c.department === "Directing"
                    ).length > 0 && (
                      <motion.div
                        className="bg-zinc-800/50 rounded-xl p-4 sm:p-6 relative overflow-hidden"
                        style={{
                          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
                          backdropFilter: "blur(10px)",
                          transform: `perspective(1000px) rotateX(${
                            mousePosition.y * -0.5
                          }deg) rotateY(${mousePosition.x * 0.5}deg)`,
                          transformStyle: "preserve-3d",
                          transition: "transform 0.3s ease-out",
                        }}
                      >
                        {/* Background glow */}
                        <div
                          className="absolute -inset-[100px] bg-[#00b1b3]/5 rounded-full blur-3xl pointer-events-none"
                          style={{
                            transform: "translateZ(-10px)",
                          }}
                        ></div>

                        <div className="flex justify-between items-center mb-4">
                          <h3
                            className="text-lg sm:text-xl font-semibold flex items-center relative"
                            style={{
                              transform: "translateZ(10px)",
                            }}
                          >
                            <i
                              className="ri-movie-line text-[#00b1b3] mr-2"
                              style={{
                                textShadow: "0 0 10px rgba(0, 177, 179, 0.5)",
                              }}
                            ></i>
                            Directing (
                            {
                              groupedCredits.movie.filter(
                                (c) =>
                                  c.role === "crew" &&
                                  c.department === "Directing"
                              ).length
                            }
                            )
                          </h3>

                          {groupedCredits.movie.filter(
                            (c) =>
                              c.role === "crew" && c.department === "Directing"
                          ).length > 8 && (
                            <motion.button
                              className="text-xs sm:text-sm text-[#00b1b3] hover:text-[#00d8da] transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              View All
                            </motion.button>
                          )}
                        </div>

                        <div
                          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 relative"
                          style={{
                            transform: "translateZ(5px)",
                          }}
                        >
                          {groupedCredits.movie
                            .filter(
                              (c) =>
                                c.role === "crew" &&
                                c.department === "Directing"
                            )
                            .slice(0, 8)
                            .map((item, index) => (
                              <MediaCard
                                key={item.id}
                                item={item}
                                type="movie"
                                index={index}
                              />
                            ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Writing */}
                    {groupedCredits.movie.filter(
                      (c) => c.role === "crew" && c.department === "Writing"
                    ).length > 0 && (
                      <motion.div
                        className="bg-zinc-800/50 rounded-xl p-4 sm:p-6 relative overflow-hidden"
                        style={{
                          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
                          backdropFilter: "blur(10px)",
                          transform: `perspective(1000px) rotateX(${
                            mousePosition.y * -0.5
                          }deg) rotateY(${mousePosition.x * 0.5}deg)`,
                          transformStyle: "preserve-3d",
                          transition: "transform 0.3s ease-out",
                        }}
                      >
                        {/* Background glow */}
                        <div
                          className="absolute -inset-[100px] bg-[#00b1b3]/5 rounded-full blur-3xl pointer-events-none"
                          style={{
                            transform: "translateZ(-10px)",
                          }}
                        ></div>

                        <div className="flex justify-between items-center mb-4">
                          <h3
                            className="text-lg sm:text-xl font-semibold flex items-center relative"
                            style={{
                              transform: "translateZ(10px)",
                            }}
                          >
                            <i
                              className="ri-edit-line text-[#00b1b3] mr-2"
                              style={{
                                textShadow: "0 0 10px rgba(0, 177, 179, 0.5)",
                              }}
                            ></i>
                            Writing (
                            {
                              groupedCredits.movie.filter(
                                (c) =>
                                  c.role === "crew" &&
                                  c.department === "Writing"
                              ).length
                            }
                            )
                          </h3>

                          {groupedCredits.movie.filter(
                            (c) =>
                              c.role === "crew" && c.department === "Writing"
                          ).length > 8 && (
                            <motion.button
                              className="text-xs sm:text-sm text-[#00b1b3] hover:text-[#00d8da] transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              View All
                            </motion.button>
                          )}
                        </div>

                        <div
                          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 relative"
                          style={{
                            transform: "translateZ(5px)",
                          }}
                        >
                          {groupedCredits.movie
                            .filter(
                              (c) =>
                                c.role === "crew" && c.department === "Writing"
                            )
                            .slice(0, 8)
                            .map((item, index) => (
                              <MediaCard
                                key={item.id}
                                item={item}
                                type="movie"
                                index={index}
                              />
                            ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Other Crew */}
                    {groupedCredits.movie.filter(
                      (c) =>
                        c.role === "crew" &&
                        !["Production", "Directing", "Writing"].includes(
                          c.department
                        )
                    ).length > 0 && (
                      <motion.div
                        className="bg-zinc-800/50 rounded-xl p-4 sm:p-6 relative overflow-hidden"
                        style={{
                          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
                          backdropFilter: "blur(10px)",
                          transform: `perspective(1000px) rotateX(${
                            mousePosition.y * -0.5
                          }deg) rotateY(${mousePosition.x * 0.5}deg)`,
                          transformStyle: "preserve-3d",
                          transition: "transform 0.3s ease-out",
                        }}
                      >
                        {/* Background glow */}
                        <div
                          className="absolute -inset-[100px] bg-[#00b1b3]/5 rounded-full blur-3xl pointer-events-none"
                          style={{
                            transform: "translateZ(-10px)",
                          }}
                        ></div>

                        <div className="flex justify-between items-center mb-4">
                          <h3
                            className="text-lg sm:text-xl font-semibold flex items-center relative"
                            style={{
                              transform: "translateZ(10px)",
                            }}
                          >
                            <i
                              className="ri-tools-line text-[#00b1b3] mr-2"
                              style={{
                                textShadow: "0 0 10px rgba(0, 177, 179, 0.5)",
                              }}
                            ></i>
                            Other Crew (
                            {
                              groupedCredits.movie.filter(
                                (c) =>
                                  c.role === "crew" &&
                                  ![
                                    "Production",
                                    "Directing",
                                    "Writing",
                                  ].includes(c.department)
                              ).length
                            }
                            )
                          </h3>

                          {groupedCredits.movie.filter(
                            (c) =>
                              c.role === "crew" &&
                              !["Production", "Directing", "Writing"].includes(
                                c.department
                              )
                          ).length > 8 && (
                            <motion.button
                              className="text-xs sm:text-sm text-[#00b1b3] hover:text-[#00d8da] transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              View All
                            </motion.button>
                          )}
                        </div>

                        <div
                          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 relative"
                          style={{
                            transform: "translateZ(5px)",
                          }}
                        >
                          {groupedCredits.movie
                            .filter(
                              (c) =>
                                c.role === "crew" &&
                                ![
                                  "Production",
                                  "Directing",
                                  "Writing",
                                ].includes(c.department)
                            )
                            .slice(0, 8)
                            .map((item, index) => (
                              <MediaCard
                                key={item.id}
                                item={item}
                                type="movie"
                                index={index}
                              />
                            ))}
                        </div>
                      </motion.div>
                    )}

                    {/* No movies message */}
                    {groupedCredits.movie.length === 0 && (
                      <div className="bg-zinc-800/50 rounded-xl p-6 text-center">
                        <i className="ri-film-line text-4xl text-zinc-600 mb-2"></i>
                        <p className="text-zinc-400">
                          No movie credits found for this person.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* TV Shows Tab */}
                {activeTab === "tv" && (
                  <motion.div
                    key="tv"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    {/* Acting */}
                    {groupedCredits.tv.filter((c) => c.role === "cast").length >
                      0 && (
                      <motion.div
                        className="bg-zinc-800/50 rounded-xl p-4 sm:p-6 relative overflow-hidden"
                        style={{
                          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
                          backdropFilter: "blur(10px)",
                          transform: `perspective(1000px) rotateX(${
                            mousePosition.y * -0.5
                          }deg) rotateY(${mousePosition.x * 0.5}deg)`,
                          transformStyle: "preserve-3d",
                          transition: "transform 0.3s ease-out",
                        }}
                      >
                        {/* Background glow */}
                        <div
                          className="absolute -inset-[100px] bg-[#00b1b3]/5 rounded-full blur-3xl pointer-events-none"
                          style={{
                            transform: "translateZ(-10px)",
                          }}
                        ></div>

                        <div className="flex justify-between items-center mb-4">
                          <h3
                            className="text-lg sm:text-xl font-semibold flex items-center relative"
                            style={{
                              transform: "translateZ(10px)",
                            }}
                          >
                            <i
                              className="ri-user-3-line text-[#00b1b3] mr-2"
                              style={{
                                textShadow: "0 0 10px rgba(0, 177, 179, 0.5)",
                              }}
                            ></i>
                            Acting (
                            {
                              groupedCredits.tv.filter((c) => c.role === "cast")
                                .length
                            }
                            )
                          </h3>

                          {groupedCredits.tv.filter((c) => c.role === "cast")
                            .length > 8 && (
                            <motion.button
                              className="text-xs sm:text-sm text-[#00b1b3] hover:text-[#00d8da] transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              View All
                            </motion.button>
                          )}
                        </div>

                        <div
                          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 relative"
                          style={{
                            transform: "translateZ(5px)",
                          }}
                        >
                          {groupedCredits.tv
                            .filter((c) => c.role === "cast")
                            .slice(0, 8)
                            .map((item, index) => (
                              <MediaCard
                                key={item.id}
                                item={item}
                                type="tv"
                                index={index}
                              />
                            ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Production */}
                    {groupedCredits.tv.filter(
                      (c) => c.role === "crew" && c.department === "Production"
                    ).length > 0 && (
                      <motion.div
                        className="bg-zinc-800/50 rounded-xl p-4 sm:p-6 relative overflow-hidden"
                        style={{
                          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
                          backdropFilter: "blur(10px)",
                          transform: `perspective(1000px) rotateX(${
                            mousePosition.y * -0.5
                          }deg) rotateY(${mousePosition.x * 0.5}deg)`,
                          transformStyle: "preserve-3d",
                          transition: "transform 0.3s ease-out",
                        }}
                      >
                        {/* Background glow */}
                        <div
                          className="absolute -inset-[100px] bg-[#00b1b3]/5 rounded-full blur-3xl pointer-events-none"
                          style={{
                            transform: "translateZ(-10px)",
                          }}
                        ></div>

                        <div className="flex justify-between items-center mb-4">
                          <h3
                            className="text-lg sm:text-xl font-semibold flex items-center relative"
                            style={{
                              transform: "translateZ(10px)",
                            }}
                          >
                            <i
                              className="ri-tv-line text-[#00b1b3] mr-2"
                              style={{
                                textShadow: "0 0 10px rgba(0, 177, 179, 0.5)",
                              }}
                            ></i>
                            Production (
                            {
                              groupedCredits.tv.filter(
                                (c) =>
                                  c.role === "crew" &&
                                  c.department === "Production"
                              ).length
                            }
                            )
                          </h3>

                          {groupedCredits.tv.filter(
                            (c) =>
                              c.role === "crew" && c.department === "Production"
                          ).length > 8 && (
                            <motion.button
                              className="text-xs sm:text-sm text-[#00b1b3] hover:text-[#00d8da] transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              View All
                            </motion.button>
                          )}
                        </div>

                        <div
                          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 relative"
                          style={{
                            transform: "translateZ(5px)",
                          }}
                        >
                          {groupedCredits.tv
                            .filter(
                              (c) =>
                                c.role === "crew" &&
                                c.department === "Production"
                            )
                            .slice(0, 8)
                            .map((item, index) => (
                              <MediaCard
                                key={item.id}
                                item={item}
                                type="tv"
                                index={index}
                              />
                            ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Directing */}
                    {groupedCredits.tv.filter(
                      (c) => c.role === "crew" && c.department === "Directing"
                    ).length > 0 && (
                      <motion.div
                        className="bg-zinc-800/50 rounded-xl p-4 sm:p-6 relative overflow-hidden"
                        style={{
                          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
                          backdropFilter: "blur(10px)",
                          transform: `perspective(1000px) rotateX(${
                            mousePosition.y * -0.5
                          }deg) rotateY(${mousePosition.x * 0.5}deg)`,
                          transformStyle: "preserve-3d",
                          transition: "transform 0.3s ease-out",
                        }}
                      >
                        {/* Background glow */}
                        <div
                          className="absolute -inset-[100px] bg-[#00b1b3]/5 rounded-full blur-3xl pointer-events-none"
                          style={{
                            transform: "translateZ(-10px)",
                          }}
                        ></div>

                        <div className="flex justify-between items-center mb-4">
                          <h3
                            className="text-lg sm:text-xl font-semibold flex items-center relative"
                            style={{
                              transform: "translateZ(10px)",
                            }}
                          >
                            <i
                              className="ri-movie-line text-[#00b1b3] mr-2"
                              style={{
                                textShadow: "0 0 10px rgba(0, 177, 179, 0.5)",
                              }}
                            ></i>
                            Directing (
                            {
                              groupedCredits.tv.filter(
                                (c) =>
                                  c.role === "crew" &&
                                  c.department === "Directing"
                              ).length
                            }
                            )
                          </h3>

                          {groupedCredits.tv.filter(
                            (c) =>
                              c.role === "crew" && c.department === "Directing"
                          ).length > 8 && (
                            <motion.button
                              className="text-xs sm:text-sm text-[#00b1b3] hover:text-[#00d8da] transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              View All
                            </motion.button>
                          )}
                        </div>

                        <div
                          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 relative"
                          style={{
                            transform: "translateZ(5px)",
                          }}
                        >
                          {groupedCredits.tv
                            .filter(
                              (c) =>
                                c.role === "crew" &&
                                c.department === "Directing"
                            )
                            .slice(0, 8)
                            .map((item, index) => (
                              <MediaCard
                                key={item.id}
                                item={item}
                                type="tv"
                                index={index}
                              />
                            ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Writing */}
                    {groupedCredits.tv.filter(
                      (c) => c.role === "crew" && c.department === "Writing"
                    ).length > 0 && (
                      <motion.div
                        className="bg-zinc-800/50 rounded-xl p-4 sm:p-6 relative overflow-hidden"
                        style={{
                          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
                          backdropFilter: "blur(10px)",
                          transform: `perspective(1000px) rotateX(${
                            mousePosition.y * -0.5
                          }deg) rotateY(${mousePosition.x * 0.5}deg)`,
                          transformStyle: "preserve-3d",
                          transition: "transform 0.3s ease-out",
                        }}
                      >
                        {/* Background glow */}
                        <div
                          className="absolute -inset-[100px] bg-[#00b1b3]/5 rounded-full blur-3xl pointer-events-none"
                          style={{
                            transform: "translateZ(-10px)",
                          }}
                        ></div>

                        <div className="flex justify-between items-center mb-4">
                          <h3
                            className="text-lg sm:text-xl font-semibold flex items-center relative"
                            style={{
                              transform: "translateZ(10px)",
                            }}
                          >
                            <i
                              className="ri-edit-line text-[#00b1b3] mr-2"
                              style={{
                                textShadow: "0 0 10px rgba(0, 177, 179, 0.5)",
                              }}
                            ></i>
                            Writing (
                            {
                              groupedCredits.tv.filter(
                                (c) =>
                                  c.role === "crew" &&
                                  c.department === "Writing"
                              ).length
                            }
                            )
                          </h3>

                          {groupedCredits.tv.filter(
                            (c) =>
                              c.role === "crew" && c.department === "Writing"
                          ).length > 8 && (
                            <motion.button
                              className="text-xs sm:text-sm text-[#00b1b3] hover:text-[#00d8da] transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              View All
                            </motion.button>
                          )}
                        </div>

                        <div
                          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 relative"
                          style={{
                            transform: "translateZ(5px)",
                          }}
                        >
                          {groupedCredits.tv
                            .filter(
                              (c) =>
                                c.role === "crew" && c.department === "Writing"
                            )
                            .slice(0, 8)
                            .map((item, index) => (
                              <MediaCard
                                key={item.id}
                                item={item}
                                type="tv"
                                index={index}
                              />
                            ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Other Crew */}
                    {groupedCredits.tv.filter(
                      (c) =>
                        c.role === "crew" &&
                        !["Production", "Directing", "Writing"].includes(
                          c.department
                        )
                    ).length > 0 && (
                      <motion.div
                        className="bg-zinc-800/50 rounded-xl p-4 sm:p-6 relative overflow-hidden"
                        style={{
                          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
                          backdropFilter: "blur(10px)",
                          transform: `perspective(1000px) rotateX(${
                            mousePosition.y * -0.5
                          }deg) rotateY(${mousePosition.x * 0.5}deg)`,
                          transformStyle: "preserve-3d",
                          transition: "transform 0.3s ease-out",
                        }}
                      >
                        {/* Background glow */}
                        <div
                          className="absolute -inset-[100px] bg-[#00b1b3]/5 rounded-full blur-3xl pointer-events-none"
                          style={{
                            transform: "translateZ(-10px)",
                          }}
                        ></div>

                        <div className="flex justify-between items-center mb-4">
                          <h3
                            className="text-lg sm:text-xl font-semibold flex items-center relative"
                            style={{
                              transform: "translateZ(10px)",
                            }}
                          >
                            <i
                              className="ri-tools-line text-[#00b1b3] mr-2"
                              style={{
                                textShadow: "0 0 10px rgba(0, 177, 179, 0.5)",
                              }}
                            ></i>
                            Other Crew (
                            {
                              groupedCredits.tv.filter(
                                (c) =>
                                  c.role === "crew" &&
                                  ![
                                    "Production",
                                    "Directing",
                                    "Writing",
                                  ].includes(c.department)
                              ).length
                            }
                            )
                          </h3>

                          {groupedCredits.tv.filter(
                            (c) =>
                              c.role === "crew" &&
                              !["Production", "Directing", "Writing"].includes(
                                c.department
                              )
                          ).length > 8 && (
                            <motion.button
                              className="text-xs sm:text-sm text-[#00b1b3] hover:text-[#00d8da] transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              View All
                            </motion.button>
                          )}
                        </div>

                        <div
                          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 relative"
                          style={{
                            transform: "translateZ(5px)",
                          }}
                        >
                          {groupedCredits.tv
                            .filter(
                              (c) =>
                                c.role === "crew" &&
                                ![
                                  "Production",
                                  "Directing",
                                  "Writing",
                                ].includes(c.department)
                            )
                            .slice(0, 8)
                            .map((item, index) => (
                              <MediaCard
                                key={item.id}
                                item={item}
                                type="tv"
                                index={index}
                              />
                            ))}
                        </div>
                      </motion.div>
                    )}

                    {/* No TV shows message */}
                    {groupedCredits.tv.length === 0 && (
                      <div className="bg-zinc-800/50 rounded-xl p-6 text-center">
                        <i className="ri-tv-line text-4xl text-zinc-600 mb-2"></i>
                        <p className="text-zinc-400">
                          No TV show credits found for this person.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Photos Tab */}
                {activeTab === "photos" && (
                  <motion.div
                    key="photos"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {info.images &&
                    info.images.profiles &&
                    info.images.profiles.length > 0 ? (
                      <div className="space-y-4 sm:space-y-6">
                        <motion.div
                          className="bg-zinc-800/50 rounded-xl p-4 sm:p-6 relative overflow-hidden"
                          style={{
                            boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
                            backdropFilter: "blur(10px)",
                            transform: `perspective(1000px) rotateX(${
                              mousePosition.y * -0.5
                            }deg) rotateY(${mousePosition.x * 0.5}deg)`,
                            transformStyle: "preserve-3d",
                            transition: "transform 0.3s ease-out",
                          }}
                        >
                          {/* Background glow */}
                          <div
                            className="absolute -inset-[100px] bg-[#00b1b3]/5 rounded-full blur-3xl pointer-events-none"
                            style={{
                              transform: "translateZ(-10px)",
                            }}
                          ></div>

                          <h3
                            className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center relative"
                            style={{
                              transform: "translateZ(10px)",
                            }}
                          >
                            <i
                              className="ri-image-line text-[#00b1b3] mr-2"
                              style={{
                                textShadow: "0 0 10px rgba(0, 177, 179, 0.5)",
                              }}
                            ></i>
                            Profile Images ({info.images.profiles.length})
                          </h3>

                          <div
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 relative"
                            style={{
                              transform: "translateZ(5px)",
                            }}
                          >
                            {info.images.profiles.map((image, index) => (
                              <motion.div
                                key={index}
                                className="relative group overflow-hidden rounded-lg shadow-lg"
                                whileHover={{ scale: 1.03, zIndex: 1 }}
                                style={{
                                  boxShadow:
                                    "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
                                }}
                              >
                                <img
                                  src={`https://image.tmdb.org/t/p/w500${image.file_path}`}
                                  alt={`${
                                    info.details?.name || "Person"
                                  } profile ${index + 1}`}
                                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                                  loading="lazy"
                                />

                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                  <div className="w-full">
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs bg-zinc-900/70 px-2 py-1 rounded backdrop-blur-sm">
                                        {image.width} × {image.height}
                                      </span>
                                      <motion.button
                                        className="w-8 h-8 flex items-center justify-center bg-zinc-900/70 rounded-full backdrop-blur-sm"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                      >
                                        <i className="ri-download-line text-sm"></i>
                                      </motion.button>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      </div>
                    ) : (
                      <div className="bg-zinc-800/50 rounded-xl p-6 text-center">
                        <i className="ri-image-line text-4xl text-zinc-600 mb-2"></i>
                        <p className="text-zinc-400">
                          No photos available for this person.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default PeopleDetails;
