import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  memo,
  lazy,
  Suspense,
} from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "../utils/axios";
import TopNav from "./templates/TopNav";
import Dropdown from "./templates/Dropdown";
import Cards from "./templates/Cards";
import SideNav from "./templates/sideNav";

// Lazy load components that aren't needed immediately
const Preloader = lazy(() => import("./templates/Preloader"));

// Memoized error component for better performance
const ErrorDisplay = memo(
  ({ error, refreshHandler, mousePosition, isVisible }) => (
    <motion.div
      className="flex flex-col items-center justify-center p-6 sm:p-12 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div
        className="relative p-6 sm:p-8 rounded-2xl bg-zinc-800/20 backdrop-blur-sm border border-zinc-700/30 max-w-md"
        style={{
          boxShadow: "0 20px 40px -20px rgba(0, 0, 0, 0.4)",
          transform: `perspective(1000px) rotateX(${
            mousePosition.y * -1
          }deg) rotateY(${mousePosition.x * 1}deg)`,
          transformStyle: "preserve-3d",
          transition: "transform 0.3s ease-out",
        }}
      >
        <i
          className="ri-error-warning-line text-[#00b1b3] text-4xl sm:text-5xl mb-3 sm:mb-4"
          style={{
            textShadow: "0 0 15px rgba(0, 177, 179, 0.5)",
          }}
        ></i>
        <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
          Something went wrong
        </h2>
        <p className="text-zinc-400 mb-4 sm:mb-6 text-sm sm:text-base">
          {error}
        </p>
        <motion.button
          onClick={refreshHandler}
          className="px-5 py-2 bg-[#00b1b3] text-white rounded-lg hover:bg-[#00b1b3]/80 transition-colors text-sm sm:text-base"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Try Again
        </motion.button>

        {/* Decorative elements */}
        <div className="absolute -bottom-3 -right-3 w-24 sm:w-32 h-12 sm:h-16 bg-[#00b1b3]/10 rounded-full blur-md pointer-events-none"></div>
        <div className="absolute -top-3 -left-3 w-16 sm:w-24 h-16 sm:h-24 bg-[#00b1b3]/5 rounded-full blur-md pointer-events-none"></div>
      </div>
    </motion.div>
  )
);

// Memoized loader component
const Loader = memo(() => (
  <div className="flex justify-center items-center p-6 sm:p-8">
    <div className="w-10 h-10 sm:w-12 sm:h-12 border-3 sm:border-4 border-zinc-700 border-t-[#00b1b3] rounded-full animate-spin"></div>
  </div>
));

// Memoized end message component
const EndMessage = memo(() => (
  <div className="text-center p-6 sm:p-8 text-zinc-500 text-sm sm:text-base">
    <p>You've seen all available movies in this category</p>
  </div>
));

// Main Movie component
function Movie() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("now_playing");
  const [movie, setMovie] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isOpen, setIsOpen] = useState(false);

  // Refs for performance optimization
  const mouseTimerRef = useRef(null);
  const particlesRef = useRef(
    Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      opacity: Math.random() * 0.3 + 0.1,
      scale: Math.random() * 1.5 + 0.5,
      duration: Math.random() * 10 + 20,
      delay: Math.random() * 10,
    }))
  );

  // Check if mobile/tablet on mount and when window resizes
  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    // Initial check
    checkDeviceType();

    // Add event listener
    window.addEventListener("resize", checkDeviceType);

    // Cleanup
    return () => window.removeEventListener("resize", checkDeviceType);
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

  // Format category name for display - memoized for performance
  const formatCategoryName = useCallback((cat) => {
    return cat
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, []);

  // Set document title
  useEffect(() => {
    document.title = `MODB | Movies - ${formatCategoryName(category)}`;
  }, [category, formatCategoryName]);

  // Fetch movies data - memoized for performance
  const getMovie = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data } = await axios.get(`/movie/${category}?page=${page}`);

      if (data.results.length > 0) {
        setMovie((prev) => [...prev, ...data.results]);
        setPage(page + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch movies:", error);
      setError("Failed to load movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [category, page, isLoading]);

  // Reset and refresh data when category changes - memoized for performance
  const refreshHandler = useCallback(() => {
    setPage(1);
    setMovie([]);
    setHasMore(true);
    setError(null);
  }, []);

  // Reset when category changes
  useEffect(() => {
    refreshHandler();
  }, [category, refreshHandler]);

  // Fetch initial data when page or movies array changes
  useEffect(() => {
    if (page === 1 && movie.length === 0) {
      getMovie();
    }
  }, [page, movie.length, getMovie]);

  // Set visibility after a short delay for entrance animations
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Add keyframes for animations - only once
  useEffect(() => {
    if (!document.getElementById("movie-animations")) {
      const style = document.createElement("style");
      style.id = "movie-animations";
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
      `;
      document.head.appendChild(style);
    }

    return () => {
      // Clear any pending timers
      if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
    };
  }, []);

  // Calculate sidebar width based on screen size
  const sidebarWidth = isMobile ? "0%" : isTablet ? "15%" : "20%";
  const mainWidth = isMobile ? "100%" : isTablet ? "100%" : "100%";
  const mainMargin = isMobile ? "0%" : isTablet ? "0%" : "4%";

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className="flex w-full h-screen bg-zinc-900 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <SideNav isMobile={isMobile} isOpen={isOpen} toggleMenu={toggleMenu} />

      <main
        id="scrollableDiv"
        className={`h-screen overflow-y-auto overflow-x-hidden relative`}
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

        {/* Floating particles - reduced on mobile */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          {particlesRef.current.slice(0, isMobile ? 3 : 10).map((particle) => (
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

        {/* Header Section with 3D effect */}
        <motion.div
          className="top-0 z-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="relative">
            {/* Background layer with 3D effect */}
            <div
              className="absolute inset-0 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800/50"
              style={{
                boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
                transform:
                  !isMobile && !isTablet
                    ? `perspective(1000px) rotateX(${
                        mousePosition.y * -0.5
                      }deg) rotateY(${mousePosition.x * 0.5}deg)`
                    : "perspective(1000px) rotateX(0deg) rotateY(0deg)",
                transformStyle: "preserve-3d",
                transition: "transform 0.3s ease-out",
              }}
            ></div>

            {/* Content layer */}
            <div className="relative px-3 sm:px-6 py-3 sm:py-4 z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center pl-16 sm:pl-0">
                  <motion.button
                    onClick={() => navigate(-1)}
                    className="mr-2 sm:mr-3 w-8 h-8 hover:cursor-pointer sm:w-10 sm:h-10 hidden sm:flex items-center justify-center  rounded-full bg-zinc-800 hover:bg-[#00b1b3] transition-all text-white overflow-hidden group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <i className="ri-arrow-left-s-line text-lg sm:text-xl relative z-10"></i>
                    <div className="absolute inset-0 bg-[#00b1b3] transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-full"></div>
                  </motion.button>

                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                      <i
                        className="ri-movie-2-fill text-[#00b1b3] mr-2"
                        style={{
                          textShadow: "0 0 10px rgba(0, 177, 179, 0.3)",
                        }}
                      ></i>
                      Movies
                    </h1>
                    <p className="text-zinc-400 text-xs sm:text-sm">
                      Browse {formatCategoryName(category)} movies
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto mt-2 z-60 sm:mt-0">
                  <div className="w-32 sm:w-40 z-20">
                    <Dropdown
                      title="Category"
                      options={[
                        "now_playing",
                        "popular",
                        "top_rated",
                        "upcoming",
                      ]}
                      func={(e) => setCategory(e.target.value)}
                    />
                  </div>

                  <motion.button
                    onClick={refreshHandler}
                    className="p-2 rounded-full bg-zinc-800 hover:cursor-pointer hover:bg-[#00b1b3] transition-all text-white overflow-hidden group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Refresh"
                    style={{
                      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <i className="ri-refresh-line relative z-10"></i>
                    <div className="absolute inset-0 bg-[#00b1b3] transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-full"></div>
                  </motion.button>
                </div>
              </div>

              <div className="mt-3 sm:mt-4">
                <TopNav />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Section */}
        {error ? (
          <ErrorDisplay
            error={error}
            refreshHandler={refreshHandler}
            mousePosition={mousePosition}
            isVisible={isVisible}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="relative z-10 px-3 sm:px-6 py-3 sm:py-4"
          >
            <InfiniteScroll
              dataLength={movie.length}
              next={getMovie}
              hasMore={hasMore}
              loader={<Loader />}
              endMessage={<EndMessage />}
              scrollableTarget="scrollableDiv"
            >
              <Cards data={movie} title="movie" />
            </InfiniteScroll>
          </motion.div>
        )}
      </main>

      {/* Custom scrollbar styles */}
      <style jsx>{`
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
      `}</style>
    </div>
  );
}

export default Movie;
