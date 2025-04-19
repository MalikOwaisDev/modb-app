import axios from "../utils/axios";
import {
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
import TopNav from "./templates/TopNav";
import Cards from "./templates/Cards";
import SideNav from "./templates/sideNav";
import { motion } from "framer-motion";

// Lazy load components that aren't needed immediately
const Preloader = lazy(() => import("./templates/Preloader"));

// Memoized components for better performance
const ParticlesBackground = memo(({ isMobile }) => {
  // Generate particles once and store them
  const particles = useRef(
    Array.from({ length: isMobile ? 5 : 10 }).map((_, i) => ({
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

const PeopleHeader = memo(({ navigate, refreshHandler }) => (
  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
    <div className="flex items-center pl-16 sm:pl-0">
      <motion.button
        onClick={() => navigate(-1)}
        className="mr-3 w-10 h-10 hover:cursor-pointer hidden sm:flex items-center justify-center rounded-full bg-zinc-800 hover:bg-[#00b1b3] transition-all text-white overflow-hidden group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
        }}
      >
        <i className="ri-arrow-left-s-line text-xl relative z-10"></i>
        <div className="absolute inset-0 bg-[#00b1b3] transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-full"></div>
      </motion.button>

      <div>
        <h1 className="text-2xl font-bold text-white flex items-center">
          <i
            className="ri-team-fill text-[#00b1b3] mr-2"
            style={{
              textShadow: "0 0 10px rgba(0, 177, 179, 0.3)",
            }}
          ></i>
          Popular People
        </h1>
        <p className="text-zinc-400 text-sm">
          Discover popular actors, directors and crew members
        </p>
      </div>
    </div>

    <div className="flex items-center  gap-4 w-full md:w-auto">
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
));

const ErrorDisplay = memo(({ error, refreshHandler, mousePosition }) => (
  <motion.div
    className="flex flex-col items-center justify-center p-6 sm:p-12 text-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  >
    <div
      className="relative p-6 sm:p-8 rounded-2xl bg-zinc-800/20 backdrop-blur-sm border border-zinc-700/30"
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
        className="ri-error-warning-line text-[#00b1b3] text-4xl sm:text-5xl mb-4"
        style={{
          textShadow: "0 0 15px rgba(0, 177, 179, 0.5)",
        }}
      ></i>
      <h2 className="text-xl font-bold text-white mb-2">
        Something went wrong
      </h2>
      <p className="text-zinc-400 mb-6">{error}</p>
      <motion.button
        onClick={refreshHandler}
        className="px-6 py-2 bg-[#00b1b3] text-white rounded-lg hover:bg-[#00b1b3]/80 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Try Again
      </motion.button>

      {/* Decorative elements */}
      <div className="absolute -bottom-3 -right-3 w-32 h-16 bg-[#00b1b3]/10 rounded-full blur-md pointer-events-none"></div>
      <div className="absolute -top-3 -left-3 w-24 h-24 bg-[#00b1b3]/5 rounded-full blur-md pointer-events-none"></div>
    </div>
  </motion.div>
));

function People() {
  const navigate = useNavigate();
  const [people, setPeople] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const mouseTimerRef = useRef(null);
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

  // Set document title
  useEffect(() => {
    document.title = "MODB | Popular People";
  }, []);

  // Fetch people data
  const getPeople = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data } = await axios.get(`/person/popular?page=${page}`);

      if (data.results.length > 0) {
        setPeople((prev) => [...prev, ...data.results]);
        setPage(page + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch people:", error);
      setError("Failed to load people. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, page]);

  // Reset and refresh data
  const refreshHandler = useCallback(() => {
    setPage(1);
    setPeople([]);
    setHasMore(true);
    setError(null);
  }, []);

  // Fetch initial data when component mounts
  useEffect(() => {
    if (page === 1 && people.length === 0) {
      getPeople();
    }
  }, [page, people.length, getPeople]);

  // Set visibility after a short delay for entrance animations
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);

    // Add keyframes for animations - only once
    if (!document.getElementById("people-animations")) {
      const style = document.createElement("style");
      style.id = "people-animations";
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
        className="h-screen overflow-y-auto overflow-x-hidden relative"
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
                    : "none",
                transformStyle: "preserve-3d",
                transition: "transform 0.3s ease-out",
              }}
            ></div>

            {/* Content layer */}
            <div className="relative px-4 sm:px-6 py-4 z-10">
              <PeopleHeader
                navigate={navigate}
                refreshHandler={refreshHandler}
              />

              <div className="mt-4">
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
          />
        ) : people.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="relative z-10 px-4 sm:px-6 py-4"
          >
            <InfiniteScroll
              dataLength={people.length}
              next={getPeople}
              hasMore={hasMore}
              loader={
                <div className="flex justify-center items-center p-6 sm:p-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-zinc-700 border-t-[#00b1b3] rounded-full animate-spin"></div>
                </div>
              }
              endMessage={
                <div className="text-center p-6 sm:p-8 text-zinc-500">
                  <p>You've seen all popular people</p>
                </div>
              }
              scrollableTarget="scrollableDiv"
            >
              <Cards data={people} title="person" />
            </InfiniteScroll>
          </motion.div>
        ) : (
          <div className="w-full h-[calc(100vh-200px)] flex items-center justify-center">
            <Suspense
              fallback={
                <div className="w-12 h-12 border-4 border-zinc-700 border-t-[#00b1b3] rounded-full animate-spin"></div>
              }
            >
              <Preloader />
            </Suspense>
          </div>
        )}
      </main>
    </div>
  );
}

export default People;
