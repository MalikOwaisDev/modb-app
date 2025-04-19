import axios from "../../utils/axios";
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

// Lazy load the image to improve initial load time
const NoImage = lazy(() =>
  import("../assets/no-image.jpg").then((module) => ({
    default: module.default,
  }))
);

// Memoized SearchResult component to prevent unnecessary re-renders
const SearchResult = memo(({ item, index, selectedIndex, onClick }) => {
  return (
    <Link
      to={`/${item.media_type}/details/${item.id}`}
      className={`flex items-start p-4 transition-all duration-300 border-b border-zinc-800/50 last:border-b-0 search-result-item ${
        selectedIndex === index ? "bg-zinc-800/80" : "hover:bg-zinc-800/50"
      }`}
      onClick={onClick}
      style={{
        transform: selectedIndex === index ? "scale(1.01)" : "scale(1)",
        transition: "all 0.2s ease-out",
      }}
    >
      {/* Image */}
      <div className="w-16 h-24 sm:w-20 sm:h-28 flex-shrink-0 bg-zinc-800 rounded-lg overflow-hidden shadow-md">
        <Suspense
          fallback={
            <div className="w-full h-full bg-zinc-800 animate-pulse"></div>
          }
        >
          <img
            className="w-full h-full object-cover"
            src={
              item.backdrop_path || item.profile_path || item.poster_path
                ? `https://image.tmdb.org/t/p/w200/${
                    item.poster_path || item.backdrop_path || item.profile_path
                  }`
                : NoImage
            }
            alt=""
            loading="lazy"
          />
        </Suspense>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/70 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="ml-3 sm:ml-4 flex-1 min-w-0">
        <h3
          className={`font-medium text-sm sm:text-base truncate transition-colors duration-300 ${
            selectedIndex === index ? "text-[#00b1b3]" : "text-white"
          }`}
        >
          {item.original_title || item.title || item.original_name || item.name}
        </h3>

        <div className="flex items-center mt-1 mb-2">
          <span className="text-xs px-2 py-1 bg-zinc-800/80 backdrop-blur-sm rounded-full text-[#00b1b3] font-medium border border-zinc-700/30">
            {item.media_type?.toUpperCase() || "UNKNOWN"}
          </span>
          {item.release_date || item.first_air_date ? (
            <span className="text-xs text-zinc-400 ml-2 flex items-center">
              <i className="ri-calendar-line mr-1"></i>
              {new Date(item.release_date || item.first_air_date).getFullYear()}
            </span>
          ) : null}
        </div>

        <p className="text-zinc-400 text-xs sm:text-sm line-clamp-2 hidden sm:block">
          {(item.overview && item.overview.slice(0, 200) + " ....") ||
            "No overview available"}
        </p>

        {/* View details button that appears on hover/selection */}
        <div
          className={`mt-2 text-xs font-medium flex items-center transition-all duration-300 ${
            selectedIndex === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="text-[#00b1b3]">
            View details
            <i className="ri-arrow-right-line ml-1 group-hover:translate-x-1 transition-transform"></i>
          </span>
        </div>
      </div>

      {/* Highlight indicator */}
      {selectedIndex === index && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00b1b3]"></div>
      )}
    </Link>
  );
});

const TopNav = () => {
  const [query, setQuery] = useState("");
  const [searches, setSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isMobile, setIsMobile] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

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

  // Track mouse position for very subtle 3D effects - memoized for performance
  const handleMouseMove = useCallback((e) => {
    if (!searchRef.current) return;

    const rect = searchRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setMousePosition({ x, y });
  }, []);

  // Memoized search function to prevent unnecessary recreations
  const getSearches = useCallback(async () => {
    if (query.trim() === "") {
      setSearches([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.get(`/search/multi?query=${query}`);
      setSearches(data.results.slice(0, 10)); // Limit to 10 results for better performance
      setShowResults(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  // Debounce search to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        getSearches();
      } else {
        setSearches([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, getSearches]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
        if (isMobile) {
          setIsSearchExpanded(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile]);

  // Keyboard navigation for search results
  const handleKeyDown = useCallback(
    (e) => {
      if (!showResults || searches.length === 0) return;

      // Arrow down
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prevIndex) =>
          prevIndex < searches.length - 1 ? prevIndex + 1 : prevIndex
        );

        // Scroll into view if needed
        if (resultsRef.current && selectedIndex >= 0) {
          const items = resultsRef.current.querySelectorAll(
            ".search-result-item"
          );
          if (items[selectedIndex + 1]) {
            items[selectedIndex + 1].scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          }
        }
      }

      // Arrow up
      else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : -1));

        // Scroll into view if needed
        if (resultsRef.current && selectedIndex > 0) {
          const items = resultsRef.current.querySelectorAll(
            ".search-result-item"
          );
          if (items[selectedIndex - 1]) {
            items[selectedIndex - 1].scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          }
        }
      }

      // Enter key
      else if (e.key === "Enter") {
        if (selectedIndex >= 0 && selectedIndex < searches.length) {
          e.preventDefault();
          const selectedItem = searches[selectedIndex];
          window.location.href = `/${selectedItem.media_type}/details/${selectedItem.id}`;
          setShowResults(false);
          setQuery("");
          if (isMobile) {
            setIsSearchExpanded(false);
          }
        }
      }

      // Escape key
      else if (e.key === "Escape") {
        setShowResults(false);
        if (isMobile) {
          setIsSearchExpanded(false);
        }
      }
    },
    [showResults, searches, selectedIndex, isMobile]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Toggle search expansion for mobile
  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (!isSearchExpanded) {
      // Focus the input when expanding
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    } else {
      // Clear search when collapsing
      setQuery("");
      setShowResults(false);
    }
  };

  return (
    <div
      className="w-full backdrop-blur-md bg-zinc-900/40 border-b border-zinc-800/30 top-0 z-50 transition-all duration-300"
      style={{
        boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
      }}
      onMouseMove={handleMouseMove}
    >
      <div
        className="w-full h-[10vh] flex items-center justify-start px-3 sm:px-6 relative"
        ref={searchRef}
      >
        {/* Subtle ambient glow effect - only render when needed */}
        {!isMobile && (
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              background: `radial-gradient(circle at ${
                mousePosition.x * 100
              }% ${
                mousePosition.y * 100
              }%, rgba(0, 177, 179, 0.1), transparent 70%)`,
              transition: "background 0.5s ease-out",
            }}
          ></div>
        )}

        {/* Logo */}
        <div
          className={`mr-3 sm:mr-6 flex items-center ${
            isMobile && isSearchExpanded ? "hidden" : "flex"
          }`}
        >
          <Link
            to="/"
            className="text-xl sm:text-2xl font-bold text-white flex items-center"
          >
            <span className="text-[#00b1b3] mr-1">MO</span>
            <span>DB</span>
          </Link>
        </div>

        {/* Mobile search toggle */}
        {isMobile && (
          <button
            onClick={toggleSearch}
            className={`p-2 rounded-full bg-zinc-800/50 text-zinc-300 ${
              isSearchExpanded ? "hidden" : "block"
            }`}
          >
            <i className="ri-search-line text-lg"></i>
          </button>
        )}

        {/* Search container with very subtle 3D effect */}
        <div
          className={`relative ${
            isMobile
              ? isSearchExpanded
                ? "w-full"
                : "hidden"
              : "w-full max-w-2xl"
          }`}
          style={{
            transform:
              !isMobile && query
                ? `perspective(1000px) rotateX(${
                    (mousePosition.y - 0.5) * -0.5
                  }deg) rotateY(${(mousePosition.x - 0.5) * 0.5}deg)`
                : "none",
            transition: "transform 0.3s ease-out",
          }}
        >
          <div className="relative flex items-center">
            {/* Back button for mobile expanded search */}
            {isMobile && isSearchExpanded && (
              <button
                onClick={toggleSearch}
                className="absolute left-2 text-zinc-400 z-10"
              >
                <i className="ri-arrow-left-line text-lg"></i>
              </button>
            )}

            {/* Search icon with subtle glow effect */}
            <div
              className={`absolute ${
                isMobile && isSearchExpanded ? "left-10" : "left-4"
              } text-zinc-400 transition-all duration-300`}
              style={{
                color: query ? "#00b1b3" : "",
              }}
            >
              <i className="ri-search-line text-xl"></i>
            </div>

            {/* Search input with subtle effect */}
            <input
              ref={inputRef}
              onChange={(e) => setQuery(e.target.value)}
              value={query}
              className={`w-full py-3 ${
                isMobile && isSearchExpanded ? "pl-16" : "pl-12"
              } pr-10 text-zinc-200 bg-zinc-800/50 rounded-full outline-none transition-all duration-300 border border-zinc-700/30 backdrop-blur-sm`}
              style={{
                boxShadow: query ? "0 0 15px rgba(0, 177, 179, 0.1)" : "none",
                borderColor: query ? "rgba(0, 177, 179, 0.3)" : "",
              }}
              type="text"
              placeholder={
                isMobile ? "Search..." : "Search movies, TV shows, people..."
              }
              onFocus={() => query && setShowResults(true)}
            />

            {/* Clear button */}
            {query.length > 0 && (
              <button
                onClick={() => {
                  setQuery("");
                  setSearches([]);
                  setShowResults(false);
                  inputRef.current.focus();
                }}
                className="absolute right-4 text-zinc-400 hover:text-white transition-colors"
              >
                <i className="ri-close-circle-fill text-xl hover:text-[#00b1b3] transition-colors"></i>
              </button>
            )}

            {/* Subtle decorative element */}
            {query && (
              <div
                className="absolute -bottom-1 left-[10%] right-[10%] h-[1px] opacity-30"
                style={{
                  background:
                    "linear-gradient(to right, transparent, rgba(0, 177, 179, 0.5), transparent)",
                }}
              ></div>
            )}
          </div>

          {/* Search Results */}
          {showResults && (
            <div
              ref={resultsRef}
              className={`absolute top-[calc(100%+15px)] left-0 w-full max-h-[60vh] sm:max-h-[75vh] bg-zinc-900/95 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl z-50 border border-zinc-700/30 ${
                isMobile ? "max-w-[calc(100vw-20px)]" : ""
              }`}
              style={{
                boxShadow:
                  "0 20px 50px -20px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 177, 179, 0.1)",
                animation: "fadeIn 0.3s ease-out forwards",
              }}
            >
              {/* Search results header */}
              <div className="px-4 py-3 border-b border-zinc-800/50 flex justify-between items-center">
                <div className="text-zinc-300 text-xs sm:text-sm font-medium">
                  {isLoading ? (
                    <span className="flex items-center">
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      Searching...
                    </span>
                  ) : (
                    <span>
                      {searches.length > 0
                        ? `Found ${searches.length} results for "${query}"`
                        : `No results for "${query}"`}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    setShowResults(false);
                    if (isMobile) {
                      setIsSearchExpanded(false);
                    }
                  }}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>

              {isLoading ? (
                <div className="flex flex-col justify-center items-center p-8 sm:p-12 text-zinc-400">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-zinc-700 border-t-[#00b1b3] rounded-full animate-spin mb-4"></div>
                  <span className="text-zinc-300 text-sm sm:text-base">
                    Searching the universe...
                  </span>
                </div>
              ) : searches.length > 0 ? (
                <div className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {searches.map((item, i) => (
                    <SearchResult
                      key={i}
                      item={item}
                      index={i}
                      selectedIndex={selectedIndex}
                      onClick={() => {
                        setShowResults(false);
                        setQuery("");
                        if (isMobile) {
                          setIsSearchExpanded(false);
                        }
                      }}
                      onMouseEnter={() => setSelectedIndex(i)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-zinc-400">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-800/80 flex items-center justify-center mb-4">
                    <i className="ri-error-warning-line text-2xl sm:text-3xl text-[#00b1b3]"></i>
                  </div>
                  <p className="text-zinc-300 mb-2 text-sm sm:text-base">
                    No results found for "{query}"
                  </p>
                  <p className="text-zinc-500 text-xs sm:text-sm text-center max-w-md">
                    Try using different keywords or check your spelling
                  </p>

                  {/* Suggested searches */}
                  <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => setQuery("action")}
                      className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-full text-xs text-zinc-300 transition-colors"
                    >
                      Action movies
                    </button>
                    <button
                      onClick={() => setQuery("popular tv")}
                      className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-full text-xs text-zinc-300 transition-colors"
                    >
                      Popular TV
                    </button>
                    <button
                      onClick={() => setQuery("2023")}
                      className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-full text-xs text-zinc-300 transition-colors"
                    >
                      2023 releases
                    </button>
                  </div>
                </div>
              )}

              {/* Improved keyboard navigation help - more visible */}
              {searches.length > 0 && !isMobile && (
                <div className="px-4 py-3 border-t border-zinc-800/50 flex justify-center items-center bg-zinc-800/50">
                  <div className="flex flex-wrap justify-center gap-3 text-xs text-zinc-300">
                    <span className="flex items-center">
                      <kbd className="px-2 py-1 bg-zinc-700 rounded text-white mr-1 shadow-sm">
                        ↑
                      </kbd>
                      <kbd className="px-2 py-1 bg-zinc-700 rounded text-white">
                        ↓
                      </kbd>
                      <span className="ml-1">to navigate</span>
                    </span>
                    <span className="flex items-center">
                      <kbd className="px-2 py-1 bg-zinc-700 rounded text-white mr-1 shadow-sm">
                        Enter
                      </kbd>
                      <span className="ml-1">to select</span>
                    </span>
                    <span className="flex items-center">
                      <kbd className="px-2 py-1 bg-zinc-700 rounded text-white mr-1 shadow-sm">
                        Esc
                      </kbd>
                      <span className="ml-1">to close</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side navigation items - hide on mobile when search is expanded */}
        <div
          className={`ml-auto flex items-center space-x-2 sm:space-x-4 ${
            isMobile && isSearchExpanded ? "hidden" : "flex"
          }`}
        >
          {/* Hide on smaller screens */}
          <button className="hidden sm:flex w-10 h-10 rounded-full bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/30 items-center justify-center hover:bg-zinc-700/50 transition-all text-zinc-300 hover:text-white">
            <i className="ri-notification-3-line"></i>
          </button>

          <button className="hidden sm:flex w-10 h-10 rounded-full bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/30 items-center justify-center hover:bg-zinc-700/50 transition-all text-zinc-300 hover:text-white">
            <i className="ri-settings-4-line"></i>
          </button>

          <div
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#00b1b3]/10 border border-[#00b1b3]/30 flex items-center justify-center text-[#00b1b3] shadow-lg"
            style={{
              boxShadow: "0 0 15px rgba(0, 177, 179, 0.2)",
            }}
          >
            <span className="font-medium text-sm sm:text-base">U</span>
          </div>
        </div>
      </div>

      {/* Add keyframes for fadeIn animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #00b1b3 #1e1e1e;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e1e1e;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #00b1b3;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
};

export default memo(TopNav);
