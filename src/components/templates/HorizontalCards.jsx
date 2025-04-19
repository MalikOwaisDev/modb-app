import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
  lazy,
  Suspense,
} from "react";
import { Link } from "react-router-dom";

// Lazy load the no-image asset
const NoImage = lazy(() => import("../assets/no-image.jpg"));

// Memoized Card component to prevent unnecessary re-renders
const Card = memo(
  ({ item, index, hoveredCard, isDragging, setHoveredCard, mediaType }) => {
    const isHovered = hoveredCard === index;

    // Function to truncate text with ellipsis
    const truncate = (str, num) => {
      if (!str) return "No information available";
      return str.length > num ? str.slice(0, num) + "..." : str;
    };

    return (
      <Link
        to={`/${item.media_type || mediaType}/details/${item.id}`}
        key={index}
        className={`w-[250px] sm:w-[300px] flex-shrink-0 rounded-xl overflow-hidden transition-all duration-500 perspective group`}
        style={{
          transform: isHovered
            ? "perspective(1000px) translateZ(20px) scale(1.03)"
            : "perspective(1000px) translateZ(0) scale(1)",
          transformStyle: "preserve-3d",
          boxShadow: isHovered
            ? "0 20px 30px -10px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 177, 179, 0.3)"
            : "0 10px 20px -10px rgba(0, 0, 0, 0.3)",
          transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
        onMouseEnter={() => setHoveredCard(index)}
        onMouseLeave={() => setHoveredCard(null)}
        onClick={(e) => isDragging && e.preventDefault()}
      >
        {/* Card content container with 3D effect */}
        <div className="relative bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 backdrop-blur-sm border border-zinc-700/30 rounded-xl overflow-hidden">
          {/* Image container with 3D effect */}
          <div
            className="relative w-full h-36 sm:h-44 overflow-hidden"
            style={{
              transformStyle: "preserve-3d",
              transform: isHovered ? "translateZ(10px)" : "translateZ(0)",
            }}
          >
            <Suspense
              fallback={
                <div className="w-full h-full bg-zinc-800 animate-pulse"></div>
              }
            >
              <img
                className="w-full h-full object-cover transition-transform duration-700"
                style={{
                  transform: isHovered ? "scale(1.1)" : "scale(1)",
                }}
                src={
                  item.backdrop_path || item.profile_path
                    ? `https://image.tmdb.org/t/p/w500/${
                        item.backdrop_path || item.profile_path
                      }`
                    : NoImage
                }
                alt={item.title || item.name}
                loading="lazy"
              />
            </Suspense>

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent opacity-60"></div>

            {/* Media type badge with 3D effect */}
            {item.media_type && (
              <div
                className="absolute top-3 right-3 z-10"
                style={{
                  transform: isHovered ? "translateZ(20px)" : "translateZ(5px)",
                  transition:
                    "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                }}
              >
                <span className="bg-[#00b1b3] text-white text-xs px-2 sm:px-3 py-1 rounded-full font-medium shadow-lg">
                  {item.media_type === "movie" ? "Movie" : "TV"}
                </span>
              </div>
            )}

            {/* Rating badge with 3D effect */}
            {item.vote_average && (
              <div
                className="absolute bottom-3 left-3 z-10"
                style={{
                  transform: isHovered ? "translateZ(20px)" : "translateZ(5px)",
                  transition:
                    "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                }}
              >
                <div className="flex items-center bg-black/60 backdrop-blur-sm text-white text-xs px-2 sm:px-3 py-1 rounded-full shadow-lg border border-zinc-700/30">
                  <i className="ri-star-fill text-yellow-500 mr-1"></i>
                  {item.vote_average.toFixed(1)}
                </div>
              </div>
            )}

            {/* Hover glow effect */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                boxShadow: "inset 0 0 30px rgba(0, 177, 179, 0.2)",
                background:
                  "radial-gradient(circle at center, rgba(0, 177, 179, 0.1), transparent 70%)",
              }}
            ></div>
          </div>

          {/* Content with 3D effect */}
          <div
            className="p-3 sm:p-5"
            style={{
              transformStyle: "preserve-3d",
              transform: isHovered ? "translateZ(15px)" : "translateZ(0)",
              transition:
                "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            }}
          >
            <h3 className="text-white font-bold text-base sm:text-lg mb-1 sm:mb-2 group-hover:text-[#00b1b3] transition-colors line-clamp-1">
              {item.original_title ||
                item.title ||
                item.original_name ||
                item.name}
            </h3>

            {(item.release_date || item.first_air_date) && (
              <div className="text-zinc-400 text-xs mb-2 sm:mb-3 flex items-center">
                <i className="ri-calendar-line mr-1"></i>
                {new Date(
                  item.release_date || item.first_air_date
                ).getFullYear()}

                {/* Add genre if available */}
                {item.genre_ids && item.genre_ids.length > 0 && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="text-zinc-400">
                      {item.genre_ids.length} genres
                    </span>
                  </>
                )}
              </div>
            )}

            <p className="text-zinc-300 text-xs sm:text-sm line-clamp-2 sm:line-clamp-3 mb-3 sm:mb-4">
              {truncate(item.overview, 100)}
            </p>

            {/* Action button with 3D effect */}
            <div
              className="mt-auto"
              style={{
                transform: isHovered ? "translateZ(25px)" : "translateZ(5px)",
                transition:
                  "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="text-[#00b1b3] text-xs sm:text-sm font-medium flex items-center">
                  View details
                  <i className="ri-arrow-right-line ml-1 group-hover:translate-x-1 transition-transform"></i>
                </div>

                {/* Additional action button that appears on hover */}
                <div
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    transform: "translateZ(5px)",
                  }}
                >
                  <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-800 hover:bg-[#00b1b3] transition-colors flex items-center justify-center">
                    <i className="ri-add-line text-white"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom decorative line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00b1b3]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </Link>
    );
  }
);

const HorizontalCards = memo(({ data }) => {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 5 });
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);

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

  // Handle mouse down for drag scrolling - memoized for performance
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  }, []);

  // Handle mouse leave - memoized for performance
  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle mouse up - memoized for performance
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle mouse move for drag scrolling - memoized for performance
  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - scrollRef.current.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed multiplier
      scrollRef.current.scrollLeft = scrollLeft - walk;
    },
    [isDragging, startX, scrollLeft]
  );

  // Touch events for mobile scrolling
  const handleTouchStart = useCallback((e) => {
    setTouchStartX(e.touches[0].clientX);
  }, []);

  const handleTouchMove = useCallback(
    (e) => {
      if (!touchStartX) return;
      const touchX = e.touches[0].clientX;
      const walk = (touchStartX - touchX) * 2;
      if (Math.abs(walk) > 10) {
        // Prevent page scrolling when swiping horizontally
        e.preventDefault();
      }
    },
    [touchStartX]
  );

  const handleTouchEnd = useCallback((e) => {
    setTouchStartX(0);
  }, []);

  // Calculate visible cards based on scroll position - throttled for performance
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!scrollRef.current || ticking) return;

      ticking = true;

      window.requestAnimationFrame(() => {
        const scrollPosition = scrollRef.current.scrollLeft;
        const containerWidth = scrollRef.current.clientWidth;
        const cardWidth = isMobile ? 250 + 20 : 300 + 20; // card width + gap, adjusted for mobile

        const startIndex = Math.floor(scrollPosition / cardWidth);
        const visibleCards = Math.ceil(containerWidth / cardWidth);
        const endIndex = startIndex + visibleCards + 1; // +1 for partial visibility

        setVisibleRange({ start: startIndex, end: endIndex });
        ticking = false;
      });
    };

    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll, {
        passive: true,
      });
      handleScroll(); // Initial calculation
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isMobile]);

  // Scroll to next/previous page - memoized for performance
  const scrollToPage = useCallback((direction) => {
    if (!scrollRef.current) return;

    const containerWidth = scrollRef.current.clientWidth;
    const newScrollPosition =
      scrollRef.current.scrollLeft + direction * containerWidth * 0.8;

    scrollRef.current.scrollTo({
      left: newScrollPosition,
      behavior: "smooth",
    });
  }, []);

  // Determine media type for links
  const mediaType = data[0]?.media_type || data[0]?.type || "movie";

  // Calculate number of pages for progress indicator
  const cardsPerPage = isMobile ? 2 : 5;
  const pageCount = Math.ceil(data.length / cardsPerPage);

  return (
    <div className="w-full pb-6 sm:pb-8 relative perspective">
      {/* Scroll shadow indicators */}
      <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-16 bg-gradient-to-r from-zinc-900 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-16 bg-gradient-to-l from-zinc-900 to-transparent z-10 pointer-events-none"></div>

      {/* Navigation buttons - hide on touch devices */}
      {!isMobile && (
        <>
          <button
            onClick={() => scrollToPage(-1)}
            className="absolute left-2 top-1/2 hover:cursor-pointer -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-zinc-800/80 backdrop-blur-sm border border-zinc-700/50 text-white flex items-center justify-center hover:bg-[#00b1b3] transition-colors duration-300 shadow-lg transform hover:scale-110"
            style={{
              boxShadow:
                "0 5px 15px rgba(0, 0, 0, 0.3), 0 0 10px rgba(0, 177, 179, 0.2)",
            }}
          >
            <i className="ri-arrow-left-s-line text-lg sm:text-xl"></i>
          </button>

          <button
            onClick={() => scrollToPage(1)}
            className="absolute right-2 top-1/2 hover:cursor-pointer -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-zinc-800/80 backdrop-blur-sm border border-zinc-700/50 text-white flex items-center justify-center hover:bg-[#00b1b3] transition-colors duration-300 shadow-lg transform hover:scale-110"
            style={{
              boxShadow:
                "0 5px 15px rgba(0, 0, 0, 0.3), 0 0 10px rgba(0, 177, 179, 0.2)",
            }}
          >
            <i className="ri-arrow-right-s-line text-lg sm:text-xl"></i>
          </button>
        </>
      )}

      {/* Cards container with drag scrolling */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-3 sm:gap-5 pb-4 sm:pb-6 pt-2 px-3 sm:px-4 hide-scrollbar"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
        }}
      >
        {data.map((item, i) => {
          // Check if card is in visible range (with buffer)
          const isVisible =
            i >= visibleRange.start - 1 && i <= visibleRange.end + 1;

          // Only render cards that are visible or close to visible range
          return isVisible ? (
            <Card
              key={i}
              item={item}
              index={i}
              hoveredCard={hoveredCard}
              isDragging={isDragging}
              setHoveredCard={setHoveredCard}
              mediaType={mediaType}
            />
          ) : (
            // Placeholder for non-visible cards to maintain scroll dimensions
            <div
              key={i}
              className="w-[250px] sm:w-[300px] flex-shrink-0 h-[1px] opacity-0"
            ></div>
          );
        })}
      </div>

      {/* Progress indicator dots */}
      <div className="flex justify-center mt-2 sm:mt-4 gap-1">
        {Array.from({ length: pageCount }).map((_, i) => {
          const isActive =
            i >= Math.floor(visibleRange.start / cardsPerPage) &&
            i <= Math.floor(visibleRange.end / cardsPerPage);
          return (
            <div
              key={i}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
                isActive ? "bg-[#00b1b3] w-4 sm:w-6" : "bg-zinc-700"
              }`}
            ></div>
          );
        })}
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
});

export default HorizontalCards;
