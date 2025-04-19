import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  memo,
  lazy,
  Suspense,
} from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "../utils/axios";
import SideNav from "./templates/sideNav";
import TopNav from "./templates/TopNav";
import Header from "./templates/Header";
import HorizontalCards from "./templates/HorizontalCards";
import Dropdown from "./templates/Dropdown";

// Lazy load components that aren't needed immediately
const Preloader = lazy(() => import("./templates/Preloader"));

// Memoized category card component
const CategoryCard = memo(({ category, delay, isVisible, isMobile }) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.5, delay: 0.6 + delay, ease: "easeOut" }}
      className="relative group"
      onMouseEnter={() => !isMobile && setIsHovering(true)}
      onMouseLeave={() => !isMobile && setIsHovering(false)}
    >
      <div
        className="relative overflow-hidden rounded-xl transition-all duration-300 aspect-[4/3] bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/30"
        style={{
          boxShadow: isHovering
            ? "0 15px 30px -10px rgba(0, 0, 0, 0.4), 0 0 15px rgba(0, 177, 179, 0.15)"
            : "0 10px 20px -10px rgba(0, 0, 0, 0.3)",
          transform: isHovering ? "translateY(-5px)" : "translateY(0)",
          transition: "all 0.3s ease-out",
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#00b1b3]/10 flex items-center justify-center mb-2 sm:mb-3"
            style={{
              transform: isHovering ? "scale(1.1)" : "scale(1)",
              transition: "transform 0.3s ease-out",
            }}
          >
            <i
              className={`${category.icon} text-[#00b1b3] text-lg sm:text-xl`}
            ></i>
          </div>

          <h3
            className="text-white text-sm sm:text-base font-medium"
            style={{
              transform: isHovering ? "translateY(-2px)" : "translateY(0)",
              transition: "transform 0.3s ease-out",
            }}
          >
            {category.name}
          </h3>

          <p
            className="text-zinc-400 text-[10px] sm:text-xs mt-1"
            style={{
              opacity: isHovering ? 1 : 0.7,
              transform: isHovering ? "translateY(-2px)" : "translateY(0)",
              transition: "all 0.3s ease-out",
            }}
          >
            {category.count} titles
          </p>
        </div>

        {/* Decorative elements */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00b1b3]/50 to-transparent"
          style={{
            opacity: isHovering ? 1 : 0,
            transition: "opacity 0.3s ease-out",
          }}
        ></div>

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-6 h-6 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-px bg-[#00b1b3]/30"></div>
          <div className="absolute top-0 left-0 h-full w-px bg-[#00b1b3]/30"></div>
        </div>
        <div className="absolute bottom-0 right-0 w-6 h-6 pointer-events-none">
          <div className="absolute bottom-0 right-0 w-full h-px bg-[#00b1b3]/30"></div>
          <div className="absolute bottom-0 right-0 h-full w-px bg-[#00b1b3]/30"></div>
        </div>
      </div>
    </motion.div>
  );
});

// Memoized featured card component
const FeaturedCard = memo(({ item, delay, isVisible, isMobile }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.5, delay: 0.5 + delay, ease: "easeOut" }}
      className="relative group"
      onMouseEnter={() => !isMobile && setIsHovering(true)}
      onMouseLeave={() => !isMobile && setIsHovering(false)}
    >
      <div
        className="relative overflow-hidden rounded-xl transition-all duration-300"
        style={{
          boxShadow: isHovering
            ? "0 20px 40px -20px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 177, 179, 0.2)"
            : "0 10px 30px -15px rgba(0, 0, 0, 0.5)",
          transform: isHovering ? "scale(1.02)" : "scale(1)",
          transition: "all 0.4s ease-out",
        }}
      >
        <div className="aspect-video w-full bg-zinc-800">
          {item.backdrop_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w780${item.backdrop_path}`}
              alt={item.title || item.name}
              className={`w-full h-full object-cover transition-all duration-700 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              style={{
                transform: isHovering ? "scale(1.1)" : "scale(1)",
              }}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
              <i className="ri-image-line text-zinc-700 text-4xl"></i>
            </div>
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80"></div>

        <div
          className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 transition-all duration-300"
          style={{
            transform: isHovering ? "translateY(-5px)" : "translateY(0)",
          }}
        >
          <div className="flex items-center mb-1 sm:mb-2">
            <span className="text-[10px] sm:text-xs bg-[#00b1b3] px-2 py-0.5 sm:py-1 rounded-full text-white font-medium mr-2">
              {item.media_type === "movie" ? "Movie" : "TV Show"}
            </span>

            {item.vote_average > 0 && (
              <span className="text-[10px] sm:text-xs bg-yellow-500/90 text-zinc-900 px-2 py-0.5 sm:py-1 rounded-full font-medium flex items-center">
                <i className="ri-star-fill mr-1"></i>
                {item.vote_average.toFixed(1)}
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-xl font-bold text-white mb-1 line-clamp-1">
            {item.title || item.name}
          </h3>

          <p className="text-zinc-300 text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-3">
            {item.overview}
          </p>

          <div
            className="flex items-center space-x-2 transition-all duration-300"
            style={{
              opacity: isHovering || isMobile ? 1 : 0,
              transform:
                isHovering || isMobile ? "translateY(0)" : "translateY(10px)",
            }}
          >
            <Link
              to={`/${item.media_type}/details/${item.id}`}
              className="bg-[#00b1b3] hover:bg-[#00a0a2] text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center transition-colors"
            >
              <i className="ri-play-fill mr-1"></i> Watch Now
            </Link>

            <button className="bg-zinc-800/80 hover:bg-zinc-700 text-white text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg flex items-center transition-colors">
              <i className="ri-add-line mr-1"></i> Watchlist
            </button>
          </div>
        </div>

        {/* Decorative glow */}
        <div
          className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
          style={{
            boxShadow: "inset 0 0 30px rgba(0, 177, 179, 0.3)",
            opacity: isHovering ? 0.5 : 0,
          }}
        ></div>
      </div>
    </motion.div>
  );
});

// Sample categories data
const categories = [
  { name: "Action", icon: "ri-sword-line", count: 1247 },
  { name: "Comedy", icon: "ri-emotion-laugh-line", count: 856 },
  { name: "Drama", icon: "ri-emotion-sad-line", count: 1532 },
  { name: "Sci-Fi", icon: "ri-rocket-line", count: 723 },
  { name: "Horror", icon: "ri-ghost-line", count: 492 },
  { name: "Romance", icon: "ri-heart-line", count: 814 },
  { name: "Documentary", icon: "ri-film-line", count: 375 },
  { name: "Animation", icon: "ri-brush-line", count: 631 },
];

// Main Home component
const Home = memo(() => {
  // Set document title
  useEffect(() => {
    document.title = "MODB | Homepage";
  }, []);

  // State management
  const [wallpaper, setWallpaper] = useState(null);
  const [trending, setTrending] = useState(null);
  const [category, setCategory] = useState("all");
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isOpen, setIsOpen] = useState(false);

  // Refs
  const mainRef = useRef(null);
  const mouseTimerRef = useRef(null);
  const scrollTimerRef = useRef(null);
  const particlesRef = useRef(
    Array.from({ length: 15 }).map((_, i) => ({
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

  // Track scroll position for parallax effects - throttled for performance
  const handleScroll = useCallback(() => {
    if (!mainRef.current || scrollTimerRef.current) return;

    scrollTimerRef.current = setTimeout(() => {
      const position = mainRef.current.scrollTop;
      setScrollPosition(position);
      scrollTimerRef.current = null;
    }, 50); // Throttle to 50ms
  }, []);

  // Fetch header wallpaper
  const getHeaderWallpaper = useCallback(async () => {
    try {
      const { data } = await axios.get(`/trending/all/day`);
      let randomData =
        data.results[Math.floor(Math.random() * data.results.length)];
      setWallpaper(randomData);
      setLoadingProgress(50);
    } catch (error) {
      console.log(error);
      setLoadingProgress(50);
    }
  }, []);

  // Fetch trending content
  const getTrending = useCallback(async () => {
    try {
      const { data } = await axios.get(`/trending/${category}/day`);
      setTrending(data.results);
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setTimeout(() => setIsVisible(true), 100);
      }, 500);
    } catch (error) {
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setTimeout(() => setIsVisible(true), 100);
      }, 500);
    }
  }, [category]);

  // Initial data fetching
  useEffect(() => {
    getTrending();
    !wallpaper && getHeaderWallpaper();
  }, [category, wallpaper, getTrending, getHeaderWallpaper]);

  // Add scroll event listener
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.addEventListener("scroll", handleScroll, {
        passive: true,
      });
    }
    return () => {
      if (mainRef.current) {
        mainRef.current.removeEventListener("scroll", handleScroll);
      }

      // Clear any pending timers
      if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, [handleScroll]);

  // Add keyframes for animations - only once
  useEffect(() => {
    if (!document.getElementById("home-animations")) {
      const style = document.createElement("style");
      style.id = "home-animations";
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
  }, []);

  // Show preloader while loading
  if (isLoading || !wallpaper || !trending) {
    return (
      <Suspense
        fallback={
          <div className="w-full h-screen bg-zinc-900 flex items-center justify-center">
            Loading...
          </div>
        }
      >
        <Preloader progress={loadingProgress} />
      </Suspense>
    );
  }

  // Calculate sidebar width based on screen size
  const sidebarWidth = isMobile ? "0%" : isTablet ? "15%" : "20%";
  const mainWidth = isMobile ? "100%" : isTablet ? "100%" : "100%";
  const mainMargin = isMobile ? "0%" : isTablet ? "0%" : "4%";

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className="flex w-full h-screen bg-zinc-900 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <SideNav isMobile={isMobile} isOpen={isOpen} toggleMenu={toggleMenu} />

      {/* <div> */}
      {/* Mobile Toggle Button */}
      {/* {isMobile && (
          <button
            onClick={toggleMenu}
            className="fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-zinc-800 text-white shadow-lg"
            style={{
              boxShadow: "0 0 15px rgba(0, 177, 179, 0.3)",
            }}
          >
            <i className={`ri-${isOpen ? "close" : "menu"}-line text-xl`}></i>
          </button>
        )} */}
      {/* SideNav - hidden on mobile */}
      {/* {!isMobile && <SideNav />} */}
      {/* Overlay for mobile menu */}
      {/* {isMobile && isOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
            onClick={toggleMenu}
          >
            <SideNav />
          </div>
        )} */}
      {/* </div> */}

      <main
        ref={mainRef}
        className={`w-[${mainWidth}] ml-[${mainMargin}] h-screen overflow-y-auto overflow-x-hidden relative`}
        style={{
          width: mainWidth,
          marginLeft: isMobile ? "0" : mainMargin,
          scrollbarWidth: "thin",
          scrollbarColor: "#00b1b3 #1e1e1e",
        }}
      >
        {/* Background ambient glow - reduced intensity on mobile */}
        {!isMobile && (
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
          {particlesRef.current.slice(0, isMobile ? 5 : 15).map((particle) => (
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

        {/* Content container with 3D perspective */}
        <div className="max-w-full relative z-10">
          {/* Floating TopNav with glassmorphism */}
          <div
            className={`${isMobile ? "w-[90%] pl-16" : "w-full"} top-0 z-50`}
          >
            <TopNav />
          </div>

          {/* Header with parallax effect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              transform: `translateY(${scrollPosition * 0.1}px)`,
            }}
          >
            <Header data={wallpaper} />
          </motion.div>

          {/* Trending section with 3D card effect */}
          <motion.div
            className="relative mt-6 sm:mt-8 mx-3 sm:mx-6 rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          >
            <div
              className="absolute inset-0 bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/30 rounded-2xl"
              style={{
                boxShadow: "0 20px 40px -20px rgba(0, 0, 0, 0.4)",
                transform:
                  !isMobile && !isTablet
                    ? `perspective(1000px) rotateX(${
                        mousePosition.y * -1
                      }deg) rotateY(${mousePosition.x * 1}deg)`
                    : "perspective(1000px) rotateX(0deg) rotateY(0deg)",
                transformStyle: "preserve-3d",
                transition: "transform 0.3s ease-out",
              }}
            ></div>

            <div className="relative p-4 sm:p-6 z-10">
              {/* Section header with 3D elements */}
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <div className="relative">
                  <h1 className="text-xl sm:text-3xl font-bold text-white flex items-center">
                    <span
                      className="text-[#00b1b3] mr-2"
                      style={{ textShadow: "0 0 10px rgba(0, 177, 179, 0.3)" }}
                    >
                      Trending
                    </span>
                    Today
                  </h1>
                  <div className="absolute -bottom-2 left-0 w-1/2 h-[2px] bg-gradient-to-r from-[#00b1b3] to-transparent"></div>
                </div>

                {/* 3D dropdown */}
                <div className="w-32 sm:w-40 z-20">
                  <Dropdown
                    title={"Filter"}
                    options={["tv", "movie", "all"]}
                    func={(e) => setCategory(e.target.value)}
                  />
                </div>
              </div>

              {/* Animated cards container */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isVisible ? 1 : 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <HorizontalCards data={trending} />
              </motion.div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-3 -right-3 w-24 sm:w-32 h-12 sm:h-16 bg-[#00b1b3]/10 rounded-full blur-md pointer-events-none"></div>
            <div className="absolute -top-3 -left-3 w-16 sm:w-24 h-16 sm:h-24 bg-[#00b1b3]/5 rounded-full blur-md pointer-events-none"></div>
          </motion.div>

          {/* Featured Content Section */}
          <motion.div
            className="relative mt-6 sm:mt-10 mx-3 sm:mx-6 rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          >
            <div
              className="absolute inset-0 bg-zinc-800/20 backdrop-blur-sm border border-zinc-700/20 rounded-2xl"
              style={{
                boxShadow: "0 20px 40px -20px rgba(0, 0, 0, 0.3)",
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

            <div className="relative p-4 sm:p-6 z-10">
              <div className="relative">
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center mb-4 sm:mb-6">
                  <i
                    className="ri-fire-fill text-[#00b1b3] mr-2"
                    style={{ textShadow: "0 0 10px rgba(0, 177, 179, 0.3)" }}
                  ></i>
                  Featured Content
                </h2>
                <div className="absolute -bottom-2 left-0 w-1/3 h-[2px] bg-gradient-to-r from-[#00b1b3] to-transparent"></div>
              </div>

              {/* Featured content grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                {trending.slice(0, 2).map((item, index) => (
                  <FeaturedCard
                    key={index}
                    item={item}
                    delay={index * 0.1}
                    isVisible={isVisible}
                    isMobile={isMobile}
                  />
                ))}
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-3 -left-3 w-24 sm:w-32 h-12 sm:h-16 bg-[#00b1b3]/10 rounded-full blur-md pointer-events-none"></div>
          </motion.div>

          {/* Popular Categories Section */}
          <motion.div
            className="relative mt-6 sm:mt-10 mx-3 sm:mx-6 rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
          >
            <div
              className="absolute inset-0 bg-zinc-800/15 backdrop-blur-sm border border-zinc-700/15 rounded-2xl"
              style={{
                boxShadow: "0 20px 40px -20px rgba(0, 0, 0, 0.2)",
                transform:
                  !isMobile && !isTablet
                    ? `perspective(1000px) rotateX(${
                        mousePosition.y * -0.3
                      }deg) rotateY(${mousePosition.x * 0.3}deg)`
                    : "perspective(1000px) rotateX(0deg) rotateY(0deg)",
                transformStyle: "preserve-3d",
                transition: "transform 0.3s ease-out",
              }}
            ></div>

            <div className="relative p-4 sm:p-6 z-10">
              <div className="relative">
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center mb-4 sm:mb-6">
                  <i
                    className="ri-apps-line text-[#00b1b3] mr-2"
                    style={{ textShadow: "0 0 10px rgba(0, 177, 179, 0.3)" }}
                  ></i>
                  Popular Categories
                </h2>
                <div className="absolute -bottom-2 left-0 w-1/3 h-[2px] bg-gradient-to-r from-[#00b1b3] to-transparent"></div>
              </div>

              {/* Categories grid - responsive layout */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
                {categories.map((category, index) => (
                  <CategoryCard
                    key={index}
                    category={category}
                    delay={index * 0.05}
                    isVisible={isVisible}
                    isMobile={isMobile}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Footer with 3D effect */}
          <motion.div
            className="relative mt-6 sm:mt-10 mx-3 sm:mx-6 mb-4 sm:mb-6 rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
          >
            <div
              className="absolute inset-0 bg-zinc-800/10 backdrop-blur-sm border border-zinc-700/10 rounded-2xl"
              style={{
                boxShadow: "0 20px 40px -20px rgba(0, 0, 0, 0.2)",
              }}
            ></div>

            <div className="relative p-4 sm:p-6 text-center z-10">
              <div className="flex items-center justify-center mb-3 sm:mb-4">
                <span className="text-lg sm:text-xl font-bold text-white flex items-center">
                  <span className="text-[#00b1b3] mr-1">MO</span>
                  <span>DB</span>
                </span>
              </div>

              <p className="text-zinc-500 text-xs sm:text-sm">
                © {new Date().getFullYear()} MODB. All rights reserved.
              </p>

              <div className="flex justify-center space-x-4 sm:space-x-6 mt-3 sm:mt-4">
                <i className="ri-github-fill text-zinc-400 hover:text-[#00b1b3] transition-colors cursor-pointer text-base sm:text-lg"></i>
                <i className="ri-twitter-x-fill text-zinc-400 hover:text-[#00b1b3] transition-colors cursor-pointer text-base sm:text-lg"></i>
                <i className="ri-instagram-fill text-zinc-400 hover:text-[#00b1b3] transition-colors cursor-pointer text-base sm:text-lg"></i>
              </div>

              <div className="flex justify-center flex-wrap space-x-2 sm:space-x-4 mt-3 sm:mt-4 text-[10px] sm:text-xs text-zinc-500">
                <a href="#" className="hover:text-[#00b1b3] transition-colors">
                  About
                </a>
                <span>•</span>
                <a href="#" className="hover:text-[#00b1b3] transition-colors">
                  Privacy
                </a>
                <span>•</span>
                <a href="#" className="hover:text-[#00b1b3] transition-colors">
                  Terms
                </a>
                <span>•</span>
                <a href="#" className="hover:text-[#00b1b3] transition-colors">
                  Contact
                </a>
              </div>
            </div>
          </motion.div>
        </div>
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
});

export default Home;
