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
  ({ item, index, hoveredCard, setHoveredCard, title, isInView, isMobile }) => {
    const isHovered = hoveredCard === index;
    const cardRef = useRef(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });

    // Calculate 3D rotation based on mouse position relative to card
    const handleMouseMove = useCallback(
      (e) => {
        if (!cardRef.current || isMobile) return;

        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;

        // Calculate distance from mouse to center of card
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // Convert to rotation values (-5 to 5 degrees)
        const rotateY = ((mouseX - cardCenterX) / (rect.width / 2)) * 5;
        const rotateX = ((cardCenterY - mouseY) / (rect.height / 2)) * 5;

        setRotation({ x: rotateX, y: rotateY });
      },
      [isMobile]
    );

    // Reset rotation when mouse leaves
    const handleMouseLeave = useCallback(() => {
      setRotation({ x: 0, y: 0 });
    }, []);

    return (
      <Link
        ref={cardRef}
        to={`/${item.media_type || title}/details/${item.id}`}
        className="group relative flex flex-col bg-zinc-800/40 rounded-xl overflow-hidden transition-all duration-300 border border-zinc-700/30 perspective"
        onMouseEnter={() => !isMobile && setHoveredCard(index)}
        onMouseLeave={() => {
          !isMobile && setHoveredCard(null);
          handleMouseLeave();
        }}
        onMouseMove={handleMouseMove}
        style={{
          transform: isInView
            ? `translateY(0) scale(1) perspective(1000px)`
            : `translateY(30px) scale(0.95) perspective(1000px)`,
          opacity: isInView ? 1 : 0,
          transition: `all 0.6s cubic-bezier(0.23, 1, 0.32, 1) ${
            (index % 10) * 0.05
          }s`,
          boxShadow: isHovered
            ? "0 20px 30px -10px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 177, 179, 0.2)"
            : "0 10px 20px -10px rgba(0, 0, 0, 0.3)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Card content container with 3D effect */}
        <div
          className="relative w-full h-full"
          style={{
            transform:
              isHovered && !isMobile
                ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
                : "rotateX(0) rotateY(0)",
            transformStyle: "preserve-3d",
            transition:
              isHovered && !isMobile
                ? "transform 0.1s ease-out"
                : "transform 0.3s ease-out",
          }}
        >
          {/* Poster Image with 3D effect */}
          <div
            className="relative w-full aspect-[2/3] overflow-hidden"
            style={{
              transformStyle: "preserve-3d",
              transform: "translateZ(0px)",
            }}
          >
            <Suspense
              fallback={
                <div className="w-full h-full bg-zinc-800 animate-pulse"></div>
              }
            >
              <img
                className="w-full h-full object-cover transition-all duration-500"
                style={{
                  transform: isHovered ? "scale(1.1)" : "scale(1)",
                }}
                src={
                  item.poster_path || item.backdrop_path || item.profile_path
                    ? `https://image.tmdb.org/t/p/w500/${
                        item.poster_path ||
                        item.backdrop_path ||
                        item.profile_path
                      }`
                    : NoImage
                }
                alt={item.title || item.name || "Movie poster"}
                loading="lazy"
              />
            </Suspense>

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent opacity-60"></div>

            {/* Rating Badge with 3D effect */}
            {item.vote_average && (
              <div
                className="absolute bottom-3 right-3 z-10"
                style={{
                  transform: isHovered
                    ? "translateZ(30px)"
                    : "translateZ(10px)",
                  transition:
                    "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                }}
              >
                <div className="h-12 w-12 sm:h-12 sm:w-12 flex items-center justify-center text-zinc-900 text-xs sm:text-sm font-bold bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full shadow-lg transform group-hover:scale-110 transition-transform">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-base sm:text-lg font-bold">
                      {Math.round(item.vote_average * 10)}
                    </span>
                    <span className="text-[8px] sm:text-[10px] -mt-1">
                      SCORE
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Media Type Badge with 3D effect */}
            {item.media_type && (
              <div
                className="absolute top-3 left-3 z-10"
                style={{
                  transform: isHovered ? "translateZ(25px)" : "translateZ(5px)",
                  transition:
                    "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                }}
              >
                <div className="px-2 py-1 sm:px-3 sm:py-1.5 bg-[#00b1b3] text-white text-xs font-medium rounded-full shadow-lg">
                  {item.media_type.toUpperCase()}
                </div>
              </div>
            )}

            {/* Hover Overlay with 3D effect */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center"
              style={{
                transform: "translateZ(5px)",
              }}
            >
              {/* Action buttons that appear on hover */}
              <div
                className="p-3 w-full flex justify-center gap-2 sm:gap-3 mb-8 sm:mb-12"
                style={{
                  transform: isHovered
                    ? "translateZ(40px) translateY(0)"
                    : "translateZ(20px) translateY(20px)",
                  opacity: isHovered ? 1 : 0,
                  transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
                }}
              >
                <button className="w-8 h-8 sm:w-10 hover:cursor-pointer sm:h-10 rounded-full bg-[#00b1b3] flex items-center justify-center text-white shadow-lg hover:bg-[#00a0a2] transition-colors">
                  <i className="ri-play-fill text-lg sm:text-xl"></i>
                </button>

                <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-zinc-800/80 backdrop-blur-sm border border-zinc-700/50 flex items-center justify-center text-white shadow-lg hover:bg-zinc-700/80 transition-colors">
                  <i className="ri-add-line"></i>
                </button>
              </div>
            </div>

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

          {/* Title and Info with 3D effect */}
          <div
            className="p-3 sm:p-4"
            style={{
              transform: isHovered ? "translateZ(20px)" : "translateZ(0)",
              transition:
                "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            }}
          >
            <h2 className="text-base sm:text-lg text-white font-medium line-clamp-1 group-hover:text-[#00b1b3] transition-colors">
              {item.original_title ||
                item.title ||
                item.original_name ||
                item.name}
            </h2>

            <div className="flex items-center mt-1 sm:mt-2">
              {(item.release_date || item.first_air_date) && (
                <p className="text-zinc-400 text-xs sm:text-sm flex items-center">
                  <i className="ri-calendar-line mr-1 text-[#00b1b3]"></i>
                  {new Date(
                    item.release_date || item.first_air_date
                  ).getFullYear() || "Unknown"}
                </p>
              )}

              {/* Genre badges if available */}
              {item.genre_ids && item.genre_ids.length > 0 && (
                <div className="flex ml-auto">
                  <span className="text-xs text-zinc-500">
                    {item.genre_ids.length} genres
                  </span>
                </div>
              )}
            </div>

            {/* View details button */}
            <div
              className="mt-2 sm:mt-3 text-[#00b1b3] text-xs sm:text-sm font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                transform: isHovered ? "translateZ(25px)" : "translateZ(5px)",
              }}
            >
              View details
              <i className="ri-arrow-right-line ml-1 group-hover:translate-x-1 transition-transform"></i>
            </div>
          </div>

          {/* Bottom decorative line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00b1b3]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {/* Card edge lighting effect */}
          <div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              boxShadow: "inset 0 0 0 1px rgba(0, 177, 179, 0.2)",
              borderRadius: "inherit",
            }}
          ></div>
        </div>
      </Link>
    );
  }
);

const Cards = memo(({ data, title }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const gridRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  // Handle intersection observer for animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    if (gridRef.current) {
      observer.observe(gridRef.current);
    }

    return () => {
      if (gridRef.current) {
        observer.unobserve(gridRef.current);
      }
    };
  }, []);

  // Track mouse position for 3D effects - memoized for performance
  const handleMouseMove = useCallback(
    (e) => {
      if (!gridRef.current || isMobile) return;

      const rect = gridRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      setMousePosition({ x, y });
    },
    [isMobile]
  );

  return (
    <div
      ref={gridRef}
      className="w-full p-3 sm:p-6 bg-zinc-900 relative perspective"
      onMouseMove={handleMouseMove}
    >
      {/* Section title with 3D effect */}
      {title && (
        <div className="mb-4 sm:mb-8 relative">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center">
            <span
              className="text-[#00b1b3] mr-2"
              style={{ textShadow: "0 0 10px rgba(0, 177, 179, 0.3)" }}
            >
              {title.charAt(0).toUpperCase() + title.slice(1)}
            </span>
            Collection
          </h1>
          <div className="h-1 w-24 sm:w-32 bg-gradient-to-r from-[#00b1b3] to-transparent rounded-full"></div>
        </div>
      )}

      {/* Ambient glow effect - only on non-mobile */}
      {!isMobile && (
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x * 100}% ${
              mousePosition.y * 100
            }%, rgba(0, 177, 179, 0.15), transparent 70%)`,
            transition: "background 0.5s ease-out",
          }}
        ></div>
      )}

      {/* Cards grid with staggered animation - responsive grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6 w-full">
        {data.map((item, i) => (
          <Card
            key={i}
            item={item}
            index={i}
            hoveredCard={hoveredCard}
            setHoveredCard={setHoveredCard}
            title={title}
            isInView={isInView}
            isMobile={isMobile}
          />
        ))}
      </div>

      {/* Empty state if no data */}
      {data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-zinc-500">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
            <i className="ri-film-line text-2xl sm:text-3xl text-[#00b1b3]"></i>
          </div>
          <p className="text-base sm:text-lg text-zinc-300 mb-2">
            No content available
          </p>
          <p className="text-xs sm:text-sm text-center max-w-md">
            We couldn't find any {title} content to display at this time.
          </p>
        </div>
      )}
    </div>
  );
});

export default Cards;
