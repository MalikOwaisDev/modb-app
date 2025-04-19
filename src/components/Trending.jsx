import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  memo,
  lazy,
  Suspense,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "../utils/axios";
import InfiniteScroll from "react-infinite-scroll-component";
import TopNav from "./templates/TopNav";
import Dropdown from "./templates/Dropdown";
import Cards from "./templates/Cards";
import SideNav from "./templates/sideNav";

// Lazy load components that aren't needed immediately
const Preloader = lazy(() => import("./templates/Preloader"));

// Memoized components for better performance
const ErrorDisplay = memo(({ error, refreshHandler, mousePosition }) => (
  <motion.div
    className="flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 text-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    style={{
      transform: `perspective(1000px) rotateX(${
        mousePosition.y * -0.5
      }deg) rotateY(${mousePosition.x * 0.5}deg)`,
      transformStyle: "preserve-3d",
    }}
  >
    <motion.div
      className="relative"
      animate={{
        rotateZ: [0, -3, 0, 3, 0],
        y: [0, -3, 0, -3, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: "loop",
      }}
      style={{ transform: "translateZ(30px)" }}
    >
      <i
        className="ri-error-warning-line text-[#00b1b3] text-4xl sm:text-5xl mb-3 sm:mb-4 block"
        style={{
          textShadow: "0 0 20px rgba(0, 177, 179, 0.5)",
        }}
      ></i>
    </motion.div>

    <h2
      className="text-lg sm:text-xl font-bold text-white mb-2"
      style={{
        textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
        transform: "translateZ(20px)",
      }}
    >
      Something went wrong
    </h2>

    <p
      className="text-zinc-400 mb-4 sm:mb-6 text-sm sm:text-base"
      style={{ transform: "translateZ(15px)" }}
    >
      {error}
    </p>

    <motion.button
      onClick={refreshHandler}
      className="px-4 sm:px-6 py-2 bg-[#00b1b3] hover:cursor-pointer text-white rounded-lg hover:bg-[#00b1b3]/80 transition-colors relative overflow-hidden group text-sm sm:text-base"
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      style={{
        boxShadow:
          "0 8px 20px rgba(0, 0, 0, 0.2), 0 0 15px rgba(0, 177, 179, 0.2)",
        transform: "translateZ(25px)",
      }}
    >
      <span className="relative z-10">Try Again</span>
      <div className="absolute inset-0 bg-gradient-to-r from-[#00b1b3] to-[#00d4d6] opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </motion.button>
  </motion.div>
));

// Memoized loader component
const Loader = memo(() => (
  <div className="flex justify-center items-center p-4 sm:p-8">
    <div className="w-8 h-8 sm:w-12 sm:h-12 border-3 sm:border-4 border-zinc-700 border-t-[#00b1b3] rounded-full animate-spin"></div>
  </div>
));

// Memoized end message component
const EndMessage = memo(({ category, duration }) => (
  <div className="text-center p-4 sm:p-8 text-zinc-500 text-sm sm:text-base">
    <p>
      You've seen all trending{" "}
      {category === "all"
        ? "content"
        : category === "movie"
        ? "movies"
        : "TV shows"}{" "}
      for {duration === "day" ? "today" : "this week"}
    </p>
  </div>
));

// Memoized particles component for better performance
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
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
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

const Trending = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("all");
  const [duration, setDuration] = useState("day");
  const [trending, setTrending] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const mainRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const mouseTimerRef = useRef(null);
  const scrollTimerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

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

  // Format category and duration for display - memoized for performance
  const formatCategory = useCallback((cat) => {
    if (cat === "all") return "All";
    if (cat === "movie") return "Movies";
    if (cat === "tv") return "TV Shows";
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  }, []);

  const formatDuration = useCallback((dur) => {
    return dur === "day" ? "Today" : "This Week";
  }, []);

  // Set document title and visibility
  useEffect(() => {
    document.title = `MODB | Trending ${formatCategory(
      category
    )} - ${formatDuration(duration)}`;
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [category, duration, formatCategory, formatDuration]);

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

  // Fetch trending content - memoized for performance
  const getTrending = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data } = await axios.get(
        `/trending/${category}/${duration}?page=${page}`
      );

      if (data.results.length > 0) {
        setTrending((prev) => [...prev, ...data.results]);
        setPage(page + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch trending content:", error);
      setError("Failed to load trending content. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [category, duration, page, isLoading]);

  // Reset and refresh data when category or duration changes - memoized for performance
  const refreshHandler = useCallback(() => {
    setPage(1);
    setTrending([]);
    setHasMore(true);
    setError(null);
  }, []);

  // Reset when category or duration changes
  useEffect(() => {
    refreshHandler();
  }, [category, duration, refreshHandler]);

  // Fetch initial data when page or trending array changes
  useEffect(() => {
    if (page === 1 && trending.length === 0) {
      getTrending();
    }
  }, [page, trending.length, getTrending]);

  // Add keyframes for animations - only once
  useEffect(() => {
    if (!document.getElementById("trending-animations")) {
      const style = document.createElement("style");
      style.id = "trending-animations";
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
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
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
        ref={mainRef}
        id="scrollableDiv"
        className="h-screen z-10 overflow-y-auto overflow-x-hidden relative"
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
            className="fixed inset-0 pointer-events-none opacity-20"
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

        {/* Header Section */}
        <motion.div
          className="top-0 z-10 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800/50 px-3 sm:px-6 py-3 sm:py-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{
            boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
          }}
        >
          {/* Header background glow */}
          {!isMobile && (
            <div
              className="absolute inset-0 bg-gradient-to-r from-[#00b1b3]/5 to-transparent opacity-70"
              style={{
                transform: `translateY(${scrollPosition * 0.1}px)`,
              }}
            ></div>
          )}

          {!isMobile && !isTablet && (
            <div
              className="absolute -top-20 z-50 -right-20 w-96 h-96 rounded-full bg-[#00b1b3]/5 blur-3xl"
              style={{
                transform: `translate(${mousePosition.x * -10}px, ${
                  mousePosition.y * -10
                }px)`,
                transition: "transform 0.5s ease-out",
              }}
            ></div>
          )}

          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 z-100 sm:gap-4 relative"
            style={{
              transform:
                !isMobile && !isTablet
                  ? `perspective(1000px) rotateX(${
                      mousePosition.y * -0.5
                    }deg) rotateY(${mousePosition.x * 0.5}deg)`
                  : "none",
              transformStyle: "preserve-3d",
              transition: "transform 0.3s ease-out",
            }}
          >
            <div className="flex items-center pl-16 sm:pl-0">
              <motion.button
                onClick={() => navigate(-1)}
                className="mr-2 sm:mr-3 w-8 h-8 hover:cursor-pointer sm:w-10 sm:h-10 hidden sm:flex items-center justify-center rounded-full bg-zinc-800/80 hover:bg-[#00b1b3] transition-all text-white overflow-hidden group relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                  transform:
                    !isMobile && !isTablet ? "translateZ(20px)" : "none",
                }}
              >
                <i className="ri-arrow-left-s-line text-lg sm:text-xl relative z-10"></i>
                <div className="absolute inset-0 bg-[#00b1b3] transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-full"></div>
              </motion.button>

              <div
                style={{
                  transform:
                    !isMobile && !isTablet ? "translateZ(15px)" : "none",
                }}
              >
                <h1
                  className="text-xl sm:text-2xl font-bold text-white flex items-center"
                  style={{
                    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  <i
                    className="ri-trending-up-fill text-[#00b1b3] mr-2"
                    style={{
                      textShadow: "0 0 10px rgba(0, 177, 179, 0.5)",
                    }}
                  ></i>
                  Trending {formatCategory(category)}
                </h1>
                <p className="text-zinc-400 text-xs sm:text-sm">
                  What's trending {formatDuration(duration).toLowerCase()}
                </p>
              </div>
            </div>

            <div
              className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto mt-2 sm:mt-0"
              style={{
                transform: !isMobile && !isTablet ? "translateZ(25px)" : "none",
                zIndex: 20,
              }}
            >
              <div className="relative group w-[calc(50%-0.5rem)] sm:w-auto">
                <Dropdown
                  title="Category"
                  options={["all", "movie", "tv"]}
                  func={(e) => setCategory(e.target.value)}
                  selected={category}
                />
                {!isMobile && !isTablet && (
                  <div
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      boxShadow: "0 0 15px rgba(0, 177, 179, 0.3)",
                    }}
                  ></div>
                )}
              </div>

              <div className="relative group w-[calc(50%-0.5rem)] sm:w-auto">
                <Dropdown
                  title="Time Period"
                  options={["day", "week"]}
                  func={(e) => setDuration(e.target.value)}
                  selected={duration}
                />
                {!isMobile && !isTablet && (
                  <div
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      boxShadow: "0 0 15px rgba(0, 177, 179, 0.3)",
                    }}
                  ></div>
                )}
              </div>

              <motion.button
                onClick={refreshHandler}
                className="p-2 rounded-full bg-zinc-800/80 hover:bg-[#00b1b3] transition-all text-white overflow-hidden group relative ml-auto sm:ml-0"
                whileHover={{ scale: 1.05, rotate: isMobile ? 0 : 180 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                }}
                title="Refresh"
              >
                <i className="ri-refresh-line relative z-10"></i>
                <div className="absolute inset-0 bg-[#00b1b3] transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-full"></div>
              </motion.button>
            </div>
          </div>

          <div className="mt-3 sm:mt-4  z-[100] relative">
            <TopNav />
          </div>
        </motion.div>

        {/* Content Section */}
        {error ? (
          <ErrorDisplay
            error={error}
            refreshHandler={refreshHandler}
            mousePosition={mousePosition}
          />
        ) : trending.length > 0 ? (
          <div className="px-3 sm:px-6 py-3 sm:py-4 relative -z-10">
            <InfiniteScroll
              dataLength={trending.length}
              next={getTrending}
              hasMore={hasMore}
              loader={<Loader />}
              endMessage={
                <EndMessage category={category} duration={duration} />
              }
              scrollableTarget="scrollableDiv"
            >
              <Cards
                data={trending}
                title={category === "all" ? "" : category}
              />
            </InfiniteScroll>
          </div>
        ) : (
          <Suspense fallback={<Loader />}>
            <Preloader />
          </Suspense>
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
};

export default Trending;
