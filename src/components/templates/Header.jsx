import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  memo,
  lazy,
  Suspense,
} from "react";
import { Link } from "react-router-dom";

// Lazy load background image
const BackgroundImage = memo(
  ({ src, isHovering, mousePosition, scrollPosition }) => {
    return (
      <div
        className="absolute inset-0 w-[105%] h-[105%] -left-[2.5%] -top-[2.5%] transition-transform duration-200"
        style={{
          background: `url(${src})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          transform: isHovering
            ? `translateX(${(mousePosition.x - 0.5) * -15}px) translateY(${
                (mousePosition.y - 0.5) * -15
              }px) scale(1.05)`
            : `translateY(${scrollPosition * 0.2}px) scale(1.05)`,
          transition: isHovering
            ? "transform 0.2s ease-out"
            : "transform 0.5s ease-out",
          filter: "brightness(0.9) contrast(1.1)",
        }}
      ></div>
    );
  }
);

const Header = memo(({ data }) => {
  const { id, media_type } = data;
  const [scrollPosition, setScrollPosition] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const headerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const imageUrl = `https://image.tmdb.org/t/p/original/${
    data.backdrop_path || data.profile_path
  }`;

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Format release date - memoized for performance
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  // Handle scroll for parallax effect - throttled for performance
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollPosition(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Handle mouse movement for 3D effect - memoized for performance
  const handleMouseMove = useCallback(
    (e) => {
      if (!headerRef.current || isMobile) return;

      const rect = headerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      setMousePosition({ x, y });
    },
    [isMobile]
  );

  // Simulate image preloading with better error handling
  useEffect(() => {
    if (!data.backdrop_path && !data.profile_path) {
      setIsLoaded(true);
      return;
    }

    const img = new Image();
    img.src = imageUrl;

    img.onload = () => setIsLoaded(true);
    img.onerror = () => setIsLoaded(true); // Still show the component even if image fails

    // Fallback in case image takes too long
    const timeout = setTimeout(() => setIsLoaded(true), 3000);

    return () => clearTimeout(timeout);
  }, [imageUrl, data.backdrop_path, data.profile_path]);

  console.log(data);
  // Extract genres for display
  // const genres = data.genre_ids?.slice(0, 3) || [];

  // Generate particles only once
  const particles = Array.from({ length: isMobile ? 10 : 20 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    opacity: Math.random() * 0.5 + 0.3,
    scale: Math.random() * 2 + 0.5,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 10,
  }));

  return (
    <div
      ref={headerRef}
      className={`w-full h-[50vh] sm:h-[60vh] md:h-[70vh] relative overflow-hidden perspective ${
        isLoaded ? "opacity-100" : "opacity-0"
      } transition-opacity duration-1000`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => !isMobile && setIsHovering(true)}
      onMouseLeave={() => !isMobile && setIsHovering(false)}
    >
      {/* Background image with parallax effect - only render when data is available */}
      {(data.backdrop_path || data.profile_path) && (
        <BackgroundImage
          src={imageUrl}
          isHovering={isHovering}
          mousePosition={mousePosition}
          scrollPosition={scrollPosition}
        />
      )}

      {/* Multiple gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/70 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/70 via-transparent to-zinc-900/70"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_50%,_rgba(0,0,0,0.7)_100%)]"></div>

      {/* Dynamic lighting effect - only on non-mobile */}
      {!isMobile && (
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x * 100}% ${
              mousePosition.y * 100
            }%, rgba(0, 177, 179, 0.15), transparent 70%)`,
            transition: isHovering ? "none" : "background 0.5s ease-out",
          }}
        ></div>
      )}

      {/* Floating particles effect - reduced on mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 rounded-full bg-white/20"
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

      {/* Content container with 3D effect */}
      <div className="absolute inset-0 flex flex-col justify-end items-start p-4 sm:p-[5%] z-10">
        <div
          className="max-w-4xl relative transform transition-transform duration-300"
          style={{
            transform:
              !isMobile && isHovering
                ? `perspective(1200px) translateZ(50px) rotateX(${
                    (mousePosition.y - 0.5) * -5
                  }deg) rotateY(${(mousePosition.x - 0.5) * 5}deg)`
                : "perspective(1200px) translateZ(0) rotateX(0) rotateY(0)",
            transformStyle: "preserve-3d",
            transformOrigin: "center bottom",
          }}
        >
          {/* Title with 3D effect */}
          <div
            className="mb-3 sm:mb-4"
            style={{
              transform: "translateZ(20px)",
              textShadow: "0 5px 15px rgba(0,0,0,0.5)",
            }}
          >
            <Link
              to={`/${media_type}/details/${id}`}
              className="inline-block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white hover:text-[#00b1b3] transition-colors"
            >
              {data.original_title ||
                data.title ||
                data.original_name ||
                data.name}
            </Link>

            {/* Decorative underline */}
            <div className="h-1 w-24 sm:w-32 bg-gradient-to-r from-[#00b1b3] to-transparent mt-2 sm:mt-3 rounded-full"></div>
          </div>

          {/* Metadata with 3D effect - responsive layout */}
          <div
            className="flex flex-wrap items-center mt-2 sm:mt-3 mb-3 sm:mb-4 text-xs sm:text-sm gap-2 sm:gap-4"
            style={{
              transform: "translateZ(30px)",
            }}
          >
            {(data.first_air_date || data.release_date) && (
              <span className="flex items-center text-zinc-300 bg-zinc-800/50 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-zinc-700/30">
                <i className="ri-calendar-line text-[#00b1b3] mr-1 sm:mr-2"></i>
                {formatDate(data.first_air_date || data.release_date)}
              </span>
            )}

            {media_type && (
              <span className="flex items-center text-zinc-300 bg-zinc-800/50 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-zinc-700/30">
                <i
                  className={`${
                    media_type === "movie" ? "ri-film-line" : "ri-tv-2-line"
                  } text-[#00b1b3] mr-1 sm:mr-2`}
                ></i>
                {media_type === "movie" ? "Movie" : "TV Series"}
              </span>
            )}

            {data.vote_average && (
              <span className="flex items-center text-zinc-300 bg-zinc-800/50 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-zinc-700/30">
                <i className="ri-star-fill text-yellow-500 mr-1 sm:mr-2"></i>
                {data.vote_average.toFixed(1)} Rating
              </span>
            )}

            {/* Runtime or episode count if available */}
            {data.runtime && (
              <span className="flex items-center text-zinc-300 bg-zinc-800/50 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-zinc-700/30">
                <i className="ri-time-line text-[#00b1b3] mr-1 sm:mr-2"></i>
                {Math.floor(data.runtime / 60)}h {data.runtime % 60}m
              </span>
            )}

            {/* Genres badges - hide on smallest screens */}
            {/* {genres.length > 0 && (
              <div className="hidden sm:flex items-center gap-2">
                {genres.map((genre, index) => (
                  <span
                    key={index}
                    className="text-xs text-white bg-[#00b1b3]/80 px-2 py-1 rounded-full"
                  >
                    Genre {index + 1}
                  </span>
                ))}
              </div>
            )} */}
          </div>

          {/* Overview with 3D effect - responsive text size */}
          <div
            className="mb-4 sm:mb-6"
            style={{
              transform: "translateZ(25px)",
            }}
          >
            <p className="text-zinc-200 text-sm sm:text-base md:text-lg leading-relaxed line-clamp-2 sm:line-clamp-3 backdrop-blur-sm bg-zinc-900/30 p-3 sm:p-4 rounded-xl border border-zinc-800/30">
              {data.overview.slice(0, 300) + "..."}
              <Link
                to={`/${media_type}/details/${id}`}
                className="text-[#00b1b3] ml-1 hover:underline font-medium"
              >
                more
              </Link>
            </p>
          </div>

          {/* Action buttons with 3D effect - responsive layout */}
          <div
            className="flex flex-wrap items-center gap-2 sm:gap-4"
            style={{
              transform: "translateZ(40px)",
            }}
          >
            <Link
              to={`/${media_type}/details/${id}/trailer`}
              className="group relative bg-gradient-to-r from-[#00b1b3] to-[#008486] px-4 sm:px-6 py-2 sm:py-3 rounded-full text-white text-sm sm:text-base font-medium flex items-center transition-all shadow-lg shadow-[#00b1b3]/20 overflow-hidden"
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

              {/* Play icon with animation */}
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center mr-2 sm:mr-3 group-hover:scale-110 transition-transform">
                <i className="ri-play-fill text-lg sm:text-xl"></i>
              </div>

              <span>Watch Trailer</span>
            </Link>

            <Link
              to={`/${media_type}/details/${id}`}
              className="group relative bg-zinc-800/80 backdrop-blur-sm border border-zinc-700/50 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-white text-sm sm:text-base font-medium flex items-center hover:bg-zinc-700/80 transition-all overflow-hidden"
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-zinc-700/50 flex items-center justify-center mr-2 sm:mr-3 group-hover:bg-[#00b1b3]/20 transition-colors">
                <i className="ri-information-line"></i>
              </div>

              <span>View Details</span>
            </Link>

            {/* Add to watchlist button */}
            <button className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-zinc-800/80 backdrop-blur-sm border border-zinc-700/50 flex items-center justify-center hover:bg-zinc-700/80 transition-all group">
              <i className="ri-add-line text-lg sm:text-xl group-hover:text-[#00b1b3] transition-colors"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom fade effect */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-zinc-900 to-transparent"></div>
    </div>
  );
});

// Add keyframes for floating particles
const floatKeyframes = `
@keyframes float {
  0% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-10px) translateX(10px);
  }
  50% {
    transform: translateY(-20px) translateX(0);
  }
  75% {
    transform: translateY(-10px) translateX(-10px);
  }
  100% {
    transform: translateY(0) translateX(0);
  }
}
`;

// Add the keyframes to the document - only once
if (!document.getElementById("float-keyframes")) {
  const style = document.createElement("style");
  style.id = "float-keyframes";
  style.textContent = floatKeyframes;
  document.head.appendChild(style);
}

export default Header;
