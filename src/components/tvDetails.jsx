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
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { asyncLoadTv, removeTv } from "../store/actions/tvActions";
// import TopNav from "./templates/TopNav";
import SideNav from "./templates/sideNav";
import { motion, AnimatePresence } from "framer-motion";
import Search from "./templates/Search";

// Lazy load components that aren't needed immediately
const Preloader = lazy(() => import("./templates/Preloader"));
const HorizontalCards = lazy(() => import("./templates/HorizontalCards"));

// Memoized components for better performance
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

// Memoized card component for similar/recommended shows
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
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
          {item.first_air_date && (
            <p className="text-xs text-zinc-400">
              {new Date(item.first_air_date).getFullYear()}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
});

// Memoized cast card component
const CastCard = memo(({ person, index }) => {
  return (
    <motion.div
      key={index}
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
      <Link to={`/people/${person.id}`}>
        <div className="aspect-[2/3] relative">
          {person.profile_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w200${person.profile_path}`}
              alt={person.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
              <i className="ri-user-3-line text-3xl text-zinc-600"></i>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
            <div className="w-full">
              <div className="text-xs bg-zinc-900/70 px-2 py-1 rounded backdrop-blur-sm inline-block">
                View Profile
              </div>
            </div>
          </div>
        </div>

        <div className="p-2">
          <h4 className="text-sm font-medium truncate">{person.name}</h4>
          <p className="text-xs text-zinc-400 truncate">{person.character}</p>
        </div>
      </Link>
    </motion.div>
  );
});

// Memoized video card component
const VideoCard = memo(({ video, index, pathname, videoKey }) => {
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
        delay: index * 0.1,
        ease: "easeOut",
      }}
    >
      <Link to={`https://www.youtube.com/watch?v=${videoKey}`}>
        <div className="aspect-video relative">
          <img
            src={`https://img.youtube.com/vi/${videoKey}/mqdefault.jpg`}
            alt={video.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm group-hover:bg-[#00b1b3]/80 transition-colors">
              <i className="ri-play-fill text-2xl sm:text-3xl"></i>
            </div>
          </div>

          {/* Video type badge */}
          <div className="absolute top-2 right-2 bg-black/50 text-xs px-2 py-1 rounded backdrop-blur-sm">
            {video.type}
          </div>
        </div>

        <div className="p-2 sm:p-3">
          <h4 className="text-sm font-medium line-clamp-1">{video.name}</h4>
        </div>
      </Link>
    </motion.div>
  );
});

const TvDetails = () => {
  const [searchVisible, setSearchVisible] = useState(false);
  const [showFullOverview, setShowFullOverview] = useState(false);
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

  const { info } = useSelector((state) => state.tv);

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

  useEffect(() => {
    dispatch(asyncLoadTv(id));
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setIsVisible(true), 100);

    return () => {
      dispatch(removeTv());
      clearTimeout(timer);
    };
  }, [id, pathname, dispatch]);

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
      const title =
        info.details.original_title ||
        info.details.title ||
        info.details.original_name ||
        info.details.name;

      document.title = title ? `${title} | MODB TV Series` : "MODB | TV Series";
    } else {
      document.title = "MODB | Loading TV Series";
    }
  }, [info]);

  // Add keyframes for animations - only once
  useEffect(() => {
    if (!document.getElementById("tv-details-animations")) {
      const style = document.createElement("style");
      style.id = "tv-details-animations";
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

        {/* Hero Section with Backdrop */}
        <div
          className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] bg-cover bg-center bg-no-repeat "
          style={{
            backgroundImage: info.details?.backdrop_path
              ? `url(https://image.tmdb.org/t/p/original/${info.details.backdrop_path})`
              : "none",
            backgroundPosition: `center ${0 + scrollPosition * 0.05}px`, // Parallax effect
          }}
        >
          {/* Backdrop fallback if no image */}
          {!info.details?.backdrop_path && (
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

          {/* TV Show Title and Quick Info */}
          <motion.div
            className="absolute bottom-0 left-0 w-full px-4 sm:px-8 md:px-12 pb-6 sm:pb-8 md:pb-12 z-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          >
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              {info.details?.first_air_date && (
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
                  {new Date(info.details.first_air_date).getFullYear()}
                </motion.span>
              )}

              {info.details?.number_of_seasons && (
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
                  {info.details.number_of_seasons}{" "}
                  {info.details.number_of_seasons === 1 ? "Season" : "Seasons"}
                </motion.span>
              )}

              {info.details?.vote_average && (
                <motion.span
                  className="flex items-center text-xs sm:text-sm bg-yellow-500/90 text-zinc-900 px-2 sm:px-3 py-1 rounded-full font-medium"
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(234, 179, 8, 1)",
                  }}
                  style={{
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <i className="ri-star-fill mr-1"></i>
                  {info.details.vote_average.toFixed(1)}
                </motion.span>
              )}

              {info.details?.status && (
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
                  {info.details.status}
                </motion.span>
              )}
            </div>

            <h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 leading-tight"
              style={{
                textShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
              }}
            >
              {info.details?.name || info.details?.original_name}
            </h1>

            {info.details?.tagline && (
              <p
                className="text-sm sm:text-base md:text-lg lg:text-xl text-zinc-300 italic mb-3 sm:mb-4"
                style={{
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                }}
              >
                {info.details.tagline}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
              {info.details?.genres &&
                info.details.genres.map((genre, index) => (
                  <motion.span
                    key={index}
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
                    {genre.name}
                  </motion.span>
                ))}
            </div>

            <div className="flex flex-wrap gap-3 sm:gap-4">
              {info.videost && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={`${pathname}/trailer`}
                    className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-[#00b1b3] hover:bg-[#00b1b3]/80 transition-colors rounded-full text-white font-medium group relative overflow-hidden text-sm sm:text-base"
                    style={{
                      boxShadow:
                        "0 8px 20px rgba(0, 0, 0, 0.3), 0 0 15px rgba(0, 177, 179, 0.3)",
                    }}
                  >
                    <span className="relative z-10 flex items-center">
                      <i className="ri-play-fill text-lg sm:text-xl mr-1 sm:mr-2"></i>
                      Watch Trailer
                    </span>

                    {/* Animated glow effect */}
                    <span className="absolute inset-0 overflow-hidden">
                      <span
                        className="absolute -inset-[10px] bg-[#00b1b3] opacity-30 blur-md group-hover:opacity-50 transition-opacity"
                        style={{
                          transform: "translateZ(-5px)",
                        }}
                      ></span>
                    </span>

                    {/* Hover effect */}
                    <span
                      className="absolute inset-0 bg-gradient-to-r from-[#00b1b3]/80 to-[#00d4d6]/80 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        transform: "translateZ(0)",
                      }}
                    ></span>
                  </Link>
                </motion.div>
              )}

              {info.details?.homepage && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <a
                    href={info.details.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-zinc-800/80 hover:bg-zinc-700 transition-colors rounded-full text-white font-medium group relative overflow-hidden text-sm sm:text-base"
                    style={{
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <span className="relative z-10 flex items-center">
                      <i className="ri-external-link-line mr-1 sm:mr-2"></i>
                      Official Site
                    </span>

                    {/* Hover effect */}
                    <span
                      className="absolute inset-0 bg-gradient-to-r from-zinc-700/80 to-zinc-600/80 opacity-0 group-hover:opacity-100 transition-opacity"
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
            {["overview", "seasons", "watch", "more"].map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 sm:px-6 py-2 sm:py-3 hover:cursor-pointer font-medium transition-colors relative whitespace-nowrap ${
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
            {/* Left Column - Poster and Quick Info */}
            <div className="w-full lg:w-1/3 flex flex-col">
              {/* Poster */}
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
                {info.details?.poster_path ? (
                  <img
                    className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={`https://image.tmdb.org/t/p/w500/${info.details.poster_path}`}
                    alt={info.details.name || "TV show poster"}
                    style={{
                      transform: "translateZ(20px)",
                    }}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-zinc-800 flex items-center justify-center">
                    <i className="ri-image-line text-3xl sm:text-4xl md:text-5xl text-zinc-600"></i>
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
                  Quick Info
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
                      First Aired
                    </h4>
                    <p className="font-medium text-sm sm:text-base">
                      {formatDate(info.details?.first_air_date)}
                    </p>
                  </motion.div>

                  {info.details?.last_air_date && (
                    <motion.div
                      className="p-2 sm:p-3 rounded-lg hover:bg-zinc-700/30 transition-colors"
                      whileHover={{ scale: 1.01 }}
                    >
                      <h4 className="text-xs sm:text-sm text-zinc-400">
                        Last Aired
                      </h4>
                      <p className="font-medium text-sm sm:text-base">
                        {formatDate(info.details.last_air_date)}
                      </p>
                    </motion.div>
                  )}

                  <motion.div
                    className="p-2 sm:p-3 rounded-lg hover:bg-zinc-700/30 transition-colors"
                    whileHover={{ scale: 1.01 }}
                  >
                    <h4 className="text-xs sm:text-sm text-zinc-400">Status</h4>
                    <p className="font-medium text-sm sm:text-base">
                      {info.details?.status}
                    </p>
                  </motion.div>

                  <motion.div
                    className="p-2 sm:p-3 rounded-lg hover:bg-zinc-700/30 transition-colors"
                    whileHover={{ scale: 1.01 }}
                  >
                    <h4 className="text-xs sm:text-sm text-zinc-400">
                      Network
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {info.details?.networks &&
                        info.details.networks.map((network, index) => (
                          <motion.div
                            key={index}
                            className="bg-zinc-700/50 p-2 rounded-lg"
                            whileHover={{
                              scale: 1.05,
                              boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
                            }}
                            style={{
                              transformStyle: "preserve-3d",
                            }}
                          >
                            {network.logo_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w200${network.logo_path}`}
                                alt={network.name}
                                className="h-5 sm:h-6 object-contain"
                                style={{
                                  transform: "translateZ(5px)",
                                }}
                                loading="lazy"
                              />
                            ) : (
                              <span
                                className="text-xs sm:text-sm"
                                style={{
                                  transform: "translateZ(5px)",
                                }}
                              >
                                {network.name}
                              </span>
                            )}
                          </motion.div>
                        ))}
                    </div>
                  </motion.div>

                  <motion.div
                    className="p-2 sm:p-3 rounded-lg hover:bg-zinc-700/30 transition-colors"
                    whileHover={{ scale: 1.01 }}
                  >
                    <h4 className="text-xs sm:text-sm text-zinc-400">Type</h4>
                    <p className="font-medium text-sm sm:text-base">
                      {info.details?.type || "TV Series"}
                    </p>
                  </motion.div>

                  <motion.div
                    className="p-2 sm:p-3 rounded-lg hover:bg-zinc-700/30 transition-colors"
                    whileHover={{ scale: 1.01 }}
                  >
                    <h4 className="text-xs sm:text-sm text-zinc-400">
                      Original Language
                    </h4>
                    <p className="font-medium text-sm sm:text-base">
                      {info.details?.original_language?.toUpperCase() ||
                        "Unknown"}
                    </p>
                  </motion.div>

                  {/* External Links */}
                  <div
                    className="pt-3 sm:pt-4 border-t border-zinc-700"
                    style={{
                      borderImage:
                        "linear-gradient(to right, transparent, rgba(63, 63, 70, 0.5), transparent) 1",
                    }}
                  >
                    <h4 className="text-xs sm:text-sm text-zinc-400 mb-2 sm:mb-3 flex items-center">
                      <i className="ri-links-line text-[#00b1b3] mr-2 text-xs"></i>
                      External Links
                    </h4>
                    <div className="flex gap-2 sm:gap-3">
                      {info.externalId?.imdb_id && (
                        <motion.a
                          href={`https://www.imdb.com/title/${info.externalId.imdb_id}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-zinc-700/50 hover:bg-[#00b1b3]/20 rounded-lg transition-colors overflow-hidden group"
                          title="IMDb"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                          }}
                        >
                          <i className="ri-film-line text-[#00b1b3] relative z-10"></i>
                          <div className="absolute inset-0 bg-[#00b1b3]/10 transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-lg"></div>
                        </motion.a>
                      )}

                      {info.externalId?.wikidata_id && (
                        <motion.a
                          href={`https://www.wikidata.org/wiki/${info.externalId.wikidata_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-zinc-700/50 hover:bg-[#00b1b3]/20 rounded-lg transition-colors overflow-hidden group"
                          title="Wikidata"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                          }}
                        >
                          <i className="ri-global-line text-[#00b1b3] relative z-10"></i>
                          <div className="absolute inset-0 bg-[#00b1b3]/10 transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-lg"></div>
                        </motion.a>
                      )}
                    </div>
                  </div>
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
                    {/* Overview */}
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
                        Overview
                      </h3>

                      <div
                        className="relative"
                        style={{
                          transform: "translateZ(5px)",
                        }}
                      >
                        <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
                          {showFullOverview
                            ? info.details?.overview
                            : info.details?.overview?.slice(0, 300)}
                          {!showFullOverview &&
                            info.details?.overview?.length > 300 && (
                              <motion.button
                                onClick={() => setShowFullOverview(true)}
                                className="ml-1 hover:cursor-pointer text-[#00b1b3] hover:underline"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Read more
                              </motion.button>
                            )}
                        </p>

                        {/* Decorative element */}
                        <div className="absolute -bottom-3 -right-3 w-24 sm:w-32 h-12 sm:h-16 bg-[#00b1b3]/10 rounded-full blur-md pointer-events-none"></div>
                      </div>
                    </motion.div>

                    {/* Next Episode */}
                    {info.details?.next_episode_to_air && (
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
                            className="ri-calendar-event-line text-[#00b1b3] mr-2"
                            style={{
                              textShadow: "0 0 10px rgba(0, 177, 179, 0.5)",
                            }}
                          ></i>
                          Upcoming Episode
                        </h3>

                        <div
                          className="flex flex-col md:flex-row gap-4 relative"
                          style={{
                            transform: "translateZ(5px)",
                          }}
                        >
                          <div className="w-full md:w-1/4">
                            <motion.div
                              className="aspect-video bg-zinc-700 rounded-lg flex items-center justify-center relative overflow-hidden"
                              whileHover={{ scale: 1.03 }}
                              style={{
                                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                              }}
                            >
                              <i className="ri-tv-2-line text-3xl sm:text-4xl text-zinc-500"></i>

                              {/* Decorative elements */}
                              <div className="absolute inset-0 bg-gradient-to-br from-[#00b1b3]/5 to-transparent opacity-50"></div>
                              <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-[#00b1b3]/10 rounded-full blur-md"></div>
                            </motion.div>
                          </div>

                          <div className="w-full md:w-3/4">
                            <h4
                              className="text-base sm:text-lg font-medium mb-1"
                              style={{
                                textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                              }}
                            >
                              S{info.details.next_episode_to_air.season_number}{" "}
                              · E
                              {info.details.next_episode_to_air.episode_number}{" "}
                              -{" "}
                              {info.details.next_episode_to_air.name ||
                                "Upcoming Episode"}
                            </h4>

                            <div className="flex items-center text-zinc-400 mb-2 sm:mb-3 text-xs sm:text-sm">
                              <i className="ri-calendar-line mr-1 text-[#00b1b3]/70"></i>
                              <span>
                                {formatDate(
                                  info.details.next_episode_to_air.air_date
                                )}
                              </span>
                            </div>

                            {info.details.next_episode_to_air.overview && (
                              <p className="text-zinc-300 text-xs sm:text-sm">
                                {info.details.next_episode_to_air.overview}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Last Episode */}
                    {info.details?.last_episode_to_air && (
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
                          Last Episode
                        </h3>

                        <div
                          className="flex flex-col md:flex-row gap-4 relative"
                          style={{
                            transform: "translateZ(5px)",
                          }}
                        >
                          <div className="w-full md:w-1/4">
                            {info.details.last_episode_to_air.still_path ? (
                              <motion.div
                                className="rounded-lg overflow-hidden"
                                whileHover={{ scale: 1.03 }}
                                style={{
                                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                                }}
                              >
                                <img
                                  src={`https://image.tmdb.org/t/p/w300${info.details.last_episode_to_air.still_path}`}
                                  alt={info.details.last_episode_to_air.name}
                                  className="w-full rounded-lg"
                                  loading="lazy"
                                />
                              </motion.div>
                            ) : (
                              <motion.div
                                className="aspect-video bg-zinc-700 rounded-lg flex items-center justify-center relative overflow-hidden"
                                whileHover={{ scale: 1.03 }}
                                style={{
                                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                                }}
                              >
                                <i className="ri-tv-2-line text-3xl sm:text-4xl text-zinc-500"></i>

                                {/* Decorative elements */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[#00b1b3]/5 to-transparent opacity-50"></div>
                                <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-[#00b1b3]/10 rounded-full blur-md"></div>
                              </motion.div>
                            )}
                          </div>

                          <div className="w-full md:w-3/4">
                            <h4
                              className="text-base sm:text-lg font-medium mb-1"
                              style={{
                                textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                              }}
                            >
                              S{info.details.last_episode_to_air.season_number}{" "}
                              · E
                              {info.details.last_episode_to_air.episode_number}{" "}
                              -{" "}
                              {info.details.last_episode_to_air.name ||
                                "Last Episode"}
                            </h4>

                            <div className="flex items-center text-zinc-400 mb-2 sm:mb-3 text-xs sm:text-sm">
                              <i className="ri-calendar-line mr-1 text-[#00b1b3]/70"></i>
                              <span>
                                {formatDate(
                                  info.details.last_episode_to_air.air_date
                                )}
                              </span>
                            </div>

                            {info.details.last_episode_to_air.overview && (
                              <p className="text-zinc-300 text-xs sm:text-sm">
                                {info.details.last_episode_to_air.overview}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Seasons Tab */}
                {/* Seasons Tab */}
                {activeTab === "seasons" && (
                  <motion.div
                    key="seasons"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center">
                      <i className="ri-film-line text-[#00b1b3] mr-2"></i>
                      Seasons ({info.details?.number_of_seasons || 0})
                    </h3>

                    {info.details?.seasons &&
                    info.details.seasons.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4 sm:gap-6">
                        {info.details.seasons.map((season, index) => (
                          <motion.div
                            key={index}
                            className="bg-zinc-800/50 rounded-xl overflow-hidden flex flex-col sm:flex-row"
                            whileHover={{ scale: 1.01 }}
                            style={{
                              boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
                              backdropFilter: "blur(10px)",
                              transform: `perspective(1000px) rotateX(${
                                mousePosition.y * -0.3
                              }deg) rotateY(${mousePosition.x * 0.3}deg)`,
                              transformStyle: "preserve-3d",
                              transition:
                                "transform 0.3s ease-out, box-shadow 0.3s ease-out",
                            }}
                          >
                            <div className="w-full sm:w-1/4 md:w-1/5">
                              {season.poster_path ? (
                                <img
                                  src={`https://image.tmdb.org/t/p/w300${season.poster_path}`}
                                  alt={season.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full aspect-[2/3] bg-zinc-700 flex items-center justify-center">
                                  <i className="ri-image-line text-3xl text-zinc-600"></i>
                                </div>
                              )}
                            </div>

                            <div className="p-4 sm:p-5 w-full sm:w-3/4 md:w-4/5 flex flex-col">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-base sm:text-lg font-medium">
                                  {season.name}
                                </h4>
                                <span className="text-xs sm:text-sm bg-zinc-700/80 px-2 py-1 rounded-full">
                                  {season.episode_count} Episodes
                                </span>
                              </div>

                              <div className="text-xs sm:text-sm text-zinc-400 mb-2">
                                {season.air_date ? (
                                  <span>
                                    {new Date(season.air_date).getFullYear()}
                                  </span>
                                ) : (
                                  <span>Coming Soon</span>
                                )}
                              </div>

                              <p className="text-zinc-300 text-xs sm:text-sm mb-3 line-clamp-3">
                                {season.overview ||
                                  "No overview available for this season."}
                              </p>

                              <div className="mt-auto">
                                <motion.button
                                  className="text-xs sm:text-sm bg-zinc-700/80 hover:bg-[#00b1b3]/80 px-3 py-1.5 rounded-lg transition-colors flex items-center"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <i className="ri-information-line mr-1"></i>
                                  View Details
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-zinc-800/50 rounded-xl p-6 text-center">
                        <i className="ri-film-line text-4xl text-zinc-600 mb-2"></i>
                        <p className="text-zinc-400">
                          No season information available
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Watch Tab */}
                {activeTab === "watch" && (
                  <motion.div
                    key="watch"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    {/* Videos Section */}
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
                          className="ri-video-line text-[#00b1b3] mr-2"
                          style={{
                            textShadow: "0 0 10px rgba(0, 177, 179, 0.5)",
                          }}
                        ></i>
                        Videos
                      </h3>

                      {info.videos && info.videos.length > 0 ? (
                        <div
                          className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative"
                          style={{
                            transform: "translateZ(5px)",
                          }}
                        >
                          {info.videos.slice(0, 4).map((video, index) => (
                            <VideoCard
                              video={video} // ✅ pass the whole video object
                              index={index}
                              pathname={pathname}
                              videoKey={video.key} // ✅ pass the YouTube key with a safe prop name
                              key={video.key} // ✅ use key properly here
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <i className="ri-video-line text-4xl text-zinc-600 mb-2"></i>
                          <p className="text-zinc-400">No videos available</p>
                        </div>
                      )}

                      {info.videos && info.videos.length > 4 && (
                        <div className="mt-4 text-center">
                          <motion.button
                            className="px-4 py-2 bg-zinc-700/80 hover:bg-[#00b1b3]/80 rounded-lg transition-colors text-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            View All Videos ({info.videos.length})
                          </motion.button>
                        </div>
                      )}
                    </motion.div>

                    {/* Watch Providers */}
                    {info.watchProviders &&
                      Object.keys(info.watchProviders).length > 0 && (
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
                              className="ri-play-circle-line text-[#00b1b3] mr-2"
                              style={{
                                textShadow: "0 0 10px rgba(0, 177, 179, 0.5)",
                              }}
                            ></i>
                            Where to Watch
                          </h3>

                          <div
                            className="space-y-4 relative"
                            style={{
                              transform: "translateZ(5px)",
                            }}
                          >
                            {info.watchProviders && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">
                                  United States
                                </h4>

                                {info.watchProviders.flatrate && (
                                  <div className="mb-3">
                                    <p className="text-xs text-zinc-400 mb-1">
                                      Subscription
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {info.watchProviders.flatrate.map(
                                        (provider, index) => (
                                          <motion.div
                                            key={index}
                                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-zinc-700"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                          >
                                            <img
                                              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                                              alt={provider.provider_name}
                                              className="w-full h-full object-cover"
                                              loading="lazy"
                                            />
                                          </motion.div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                                {info.watchProviders.rent && (
                                  <div className="mb-3">
                                    <p className="text-xs text-zinc-400 mb-1">
                                      Rent
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {info.watchProviders.rent.map(
                                        (provider, index) => (
                                          <motion.div
                                            key={index}
                                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-zinc-700"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                          >
                                            <img
                                              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                                              alt={provider.provider_name}
                                              className="w-full h-full object-cover"
                                              loading="lazy"
                                            />
                                          </motion.div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                                {info.watchProviders.buy && (
                                  <div>
                                    <p className="text-xs text-zinc-400 mb-1">
                                      Buy
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {info.watchProviders.buy.map(
                                        (provider, index) => (
                                          <motion.div
                                            key={index}
                                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-zinc-700"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                          >
                                            <img
                                              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                                              alt={provider.provider_name}
                                              className="w-full h-full object-cover"
                                              loading="lazy"
                                            />
                                          </motion.div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {info.watchProviders.link && (
                              <div className="pt-3 border-t border-zinc-700">
                                <a
                                  href={info.watchProviders.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#00b1b3] hover:underline text-sm flex items-center"
                                >
                                  <i className="ri-external-link-line mr-1"></i>
                                  View more watch options
                                </a>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                  </motion.div>
                )}

                {/* More Tab */}
                {activeTab === "more" && (
                  <motion.div
                    key="more"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    {/* Cast Section */}
                    {info.credits?.cast && info.credits.cast.length > 0 && (
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
                            Cast
                          </h3>

                          {info.credits.cast.length > 6 && (
                            <motion.button
                              className="text-xs sm:text-sm text-[#00b1b3] hover:text-white transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              View All
                            </motion.button>
                          )}
                        </div>

                        <div
                          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 relative"
                          style={{
                            transform: "translateZ(5px)",
                          }}
                        >
                          {info.credits.cast
                            .slice(0, 6)
                            .map((person, index) => (
                              <CastCard
                                key={index}
                                person={person}
                                index={index}
                              />
                            ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Crew Section */}
                    {info.credits?.crew && info.credits.crew.length > 0 && (
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
                            className="ri-user-settings-line text-[#00b1b3] mr-2"
                            style={{
                              textShadow: "0 0 10px rgba(0, 177, 179, 0.5)",
                            }}
                          ></i>
                          Crew
                        </h3>

                        <div
                          className="space-y-4 relative"
                          style={{
                            transform: "translateZ(5px)",
                          }}
                        >
                          {/* Group crew by department */}
                          {(() => {
                            const departments = {};
                            info.credits.crew.forEach((person) => {
                              if (!departments[person.department]) {
                                departments[person.department] = [];
                              }
                              departments[person.department].push(person);
                            });

                            return Object.keys(departments)
                              .slice(0, 3)
                              .map((department, index) => (
                                <div key={index} className="mb-4">
                                  <h4 className="text-sm font-medium mb-2">
                                    {department}
                                  </h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {departments[department]
                                      .slice(0, 4)
                                      .map((person, idx) => (
                                        <motion.div
                                          key={idx}
                                          className="bg-zinc-700/30 p-2 sm:p-3 rounded-lg flex items-center gap-3"
                                          whileHover={{
                                            scale: 1.02,
                                            backgroundColor:
                                              "rgba(63, 63, 70, 0.5)",
                                          }}
                                        >
                                          <Link
                                            to={`/people/${person.id}`}
                                            className="flex items-center gap-3 w-full"
                                          >
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-zinc-600 flex-shrink-0">
                                              {person.profile_path ? (
                                                <img
                                                  src={`https://image.tmdb.org/t/p/w200${person.profile_path}`}
                                                  alt={person.name}
                                                  className="w-full h-full object-cover"
                                                  loading="lazy"
                                                />
                                              ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                  <i className="ri-user-3-line text-zinc-400"></i>
                                                </div>
                                              )}
                                            </div>
                                            <div>
                                              <h5 className="text-sm font-medium">
                                                {person.name}
                                              </h5>
                                              <p className="text-xs text-zinc-400">
                                                {person.job}
                                              </p>
                                            </div>
                                          </Link>
                                        </motion.div>
                                      ))}
                                  </div>
                                </div>
                              ));
                          })()}

                          {Object.keys(
                            (() => {
                              const departments = {};
                              info.credits.crew.forEach((person) => {
                                if (!departments[person.department]) {
                                  departments[person.department] = [];
                                }
                                departments[person.department].push(person);
                              });
                              return departments;
                            })()
                          ).length > 3 && (
                            <motion.button
                              className="w-full py-2 bg-zinc-700/50 hover:bg-[#00b1b3]/20 rounded-lg transition-colors text-sm"
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              View All Crew
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
            {/* Similar Shows Section */}
            {info.similar && info.similar.length > 0 && (
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
                    Similar Shows
                  </h3>

                  {info.similar.length > 6 && (
                    <motion.button
                      className="text-xs sm:text-sm text-[#00b1b3] hover:text-white transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View All
                    </motion.button>
                  )}
                </div>

                <div
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 relative"
                  style={{
                    transform: "translateZ(5px)",
                  }}
                >
                  {info.similar.slice(0, 6).map((item, index) => (
                    <MediaCard
                      key={index}
                      item={item}
                      type="tv"
                      index={index}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Recommendations Section */}
            {info.recommendations && info.recommendations.length > 0 && (
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
                      className="ri-award-line text-[#00b1b3] mr-2"
                      style={{
                        textShadow: "0 0 10px rgba(0, 177, 179, 0.5)",
                      }}
                    ></i>
                    Recommendations
                  </h3>

                  {info.recommendations.length > 6 && (
                    <motion.button
                      className="text-xs sm:text-sm text-[#00b1b3] hover:text-white transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View All
                    </motion.button>
                  )}
                </div>

                <div
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 relative"
                  style={{
                    transform: "translateZ(5px)",
                  }}
                >
                  {info.recommendations.slice(0, 6).map((item, index) => (
                    <MediaCard
                      key={index}
                      item={item}
                      type="tv"
                      index={index}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Outlet for nested routes (trailers, etc.) */}
        <Outlet />
      </main>
    </div>
  );
};

export default TvDetails;
