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
import { asyncLoadMovie, removeMovie } from "../store/actions/movieActions";
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

const MovieHeader = memo(
  ({ navigate, searchVisible, setSearchVisible, isVisible }) => (
    <motion.div
      className="absolute top-0 left-0 w-full px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex justify-between items-center z-10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex items-center space-x-3 sm:space-x-6">
        <motion.button
          onClick={() => navigate(-1)}
          className="w-8 h-8 sm:w-10 sm:h-10 hover:cursor-pointer flex items-center justify-center rounded-full bg-zinc-800/80 hover:bg-[#00b1b3] transition-all text-white overflow-hidden group relative"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
          }}
        >
          <i className="ri-arrow-left-s-line text-lg sm:text-xl relative z-10"></i>
          <div className="absolute inset-0 bg-[#00b1b3] transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-full"></div>
        </motion.button>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
          className="w-8 h-8 sm:w-10 sm:h-10 hover:cursor-pointer flex items-center justify-center rounded-full bg-zinc-800/80 hover:bg-[#00b1b3] transition-all text-white overflow-hidden group"
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
      </div>
    </motion.div>
  )
);

const MovieQuickInfo = memo(
  ({ info, formatRuntime, isVisible, mousePosition, pathname }) => (
    <motion.div
      className="absolute bottom-0 left-0 w-full px-4 sm:px-8 md:px-12 pb-6 sm:pb-8 md:pb-12 z-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
    >
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
        {info.details.release_date && (
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
            {new Date(info.details.release_date).getFullYear()}
          </motion.span>
        )}

        {info.details.runtime && (
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
            {formatRuntime(info.details.runtime)}
          </motion.span>
        )}

        {info.details.vote_average && (
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
      </div>

      <h1
        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 leading-tight"
        style={{
          textShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
        }}
      >
        {info.details.title || info.details.original_title}
      </h1>

      {info.details.tagline && (
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
        {info.details.genres &&
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

      {info.videos && info.videos.key && (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
    </motion.div>
  )
);

const MoviePoster = memo(({ info, mousePosition }) => (
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
      transition: "transform 0.3s ease-out, box-shadow 0.3s ease-out",
    }}
  >
    {info.details.poster_path ? (
      <img
        className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
        src={`https://image.tmdb.org/t/p/w500/${info.details.poster_path}`}
        alt={info.details.title || "Movie poster"}
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
));

const ExternalLinks = memo(({ info, mousePosition }) => (
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
      className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center relative"
      style={{
        transform: "translateZ(10px)",
      }}
    >
      <i
        className="ri-links-line text-[#00b1b3] mr-2"
        style={{
          textShadow: "0 0 10px rgba(0, 177, 179, 0.5)",
        }}
      ></i>
      External Links
    </h3>

    <div
      className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 relative"
      style={{
        transform: "translateZ(5px)",
      }}
    >
      {info.details.homepage && (
        <motion.a
          href={info.details.homepage}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center px-3 sm:px-4 py-2 sm:py-3 bg-zinc-700/50 hover:bg-[#00b1b3]/20 rounded-lg transition-colors"
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.98 }}
          style={{
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <i className="ri-external-link-line mr-2 text-[#00b1b3]"></i>
          <span className="text-sm sm:text-base">Official Site</span>
        </motion.a>
      )}

      {info.externalId && info.externalId.imdb_id && (
        <motion.a
          href={`https://www.imdb.com/title/${info.externalId.imdb_id}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center px-3 sm:px-4 py-2 sm:py-3 bg-zinc-700/50 hover:bg-[#00b1b3]/20 rounded-lg transition-colors"
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.98 }}
          style={{
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <i className="ri-film-line mr-2 text-[#00b1b3]"></i>
          <span className="text-sm sm:text-base">IMDb</span>
        </motion.a>
      )}

      {info.externalId && info.externalId.wikidata_id && (
        <motion.a
          href={`https://www.wikidata.org/wiki/${info.externalId.wikidata_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center px-3 sm:px-4 py-2 sm:py-3 bg-zinc-700/50 hover:bg-[#00b1b3]/20 rounded-lg transition-colors"
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.98 }}
          style={{
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <i className="ri-global-line mr-2 text-[#00b1b3]"></i>
          <span className="text-sm sm:text-base">Wikidata</span>
        </motion.a>
      )}
    </div>
  </motion.div>
));

const MovieInfo = memo(({ info, formatDate, formatRuntime, mousePosition }) => (
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
      Movie Info
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
        <h4 className="text-xs sm:text-sm text-zinc-400">Release Date</h4>
        <p className="font-medium text-sm sm:text-base">
          {formatDate(info.details.release_date)}
        </p>
      </motion.div>

      <motion.div
        className="p-2 sm:p-3 rounded-lg hover:bg-zinc-700/30 transition-colors"
        whileHover={{ scale: 1.01 }}
      >
        <h4 className="text-xs sm:text-sm text-zinc-400">Runtime</h4>
        <p className="font-medium text-sm sm:text-base">
          {formatRuntime(info.details.runtime)}
        </p>
      </motion.div>

      <motion.div
        className="p-2 sm:p-3 rounded-lg hover:bg-zinc-700/30 transition-colors"
        whileHover={{ scale: 1.01 }}
      >
        <h4 className="text-xs sm:text-sm text-zinc-400">Status</h4>
        <p className="font-medium text-sm sm:text-base">
          {info.details.status}
        </p>
      </motion.div>

      <motion.div
        className="p-2 sm:p-3 rounded-lg hover:bg-zinc-700/30 transition-colors"
        whileHover={{ scale: 1.01 }}
      >
        <h4 className="text-xs sm:text-sm text-zinc-400">Original Language</h4>
        <p className="font-medium text-sm sm:text-base">
          {info.details.original_language?.toUpperCase() || "Unknown"}
        </p>
      </motion.div>

      <motion.div
        className="p-2 sm:p-3 rounded-lg hover:bg-zinc-700/30 transition-colors"
        whileHover={{ scale: 1.01 }}
      >
        <h4 className="text-xs sm:text-sm text-zinc-400">Budget</h4>
        <p className="font-medium text-sm sm:text-base">
          {info.details.budget
            ? `$${info.details.budget.toLocaleString()}`
            : "Unknown"}
        </p>
      </motion.div>

      <motion.div
        className="p-2 sm:p-3 rounded-lg hover:bg-zinc-700/30 transition-colors"
        whileHover={{ scale: 1.01 }}
      >
        <h4 className="text-xs sm:text-sm text-zinc-400">Revenue</h4>
        <p className="font-medium text-sm sm:text-base">
          {info.details.revenue
            ? `$${info.details.revenue.toLocaleString()}`
            : "Unknown"}
        </p>
      </motion.div>
    </div>
  </motion.div>
));

const Overview = memo(
  ({ info, showFullOverview, setShowFullOverview, mousePosition }) => (
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
            ? info.details.overview
            : info.details.overview?.slice(0, 300)}
          {!showFullOverview && info.details.overview?.length > 300 && (
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
  )
);

const WatchProvider = memo(({ provider, index }) => (
  <motion.div
    key={index}
    className="group relative"
    whileHover={{ scale: 1.1, rotate: 5, y: -5 }}
    style={{
      transformStyle: "preserve-3d",
    }}
  >
    <div
      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden shadow-lg"
      style={{
        boxShadow: "0 8px 15px rgba(0, 0, 0, 0.2)",
        transform: "translateZ(10px)",
      }}
    >
      <img
        src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
        alt={provider.provider_name}
        className="w-full h-full object-cover transition-transform group-hover:scale-110"
        loading="lazy"
      />
    </div>

    {/* Provider name tooltip */}
    <div
      className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-zinc-900 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
      style={{
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        backdropFilter: "blur(4px)",
        transform: "translateZ(20px)",
      }}
    >
      {provider.provider_name}
    </div>

    {/* Reflection effect */}
    <div
      className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
      style={{
        transform: "translateZ(5px) rotateX(180deg)",
        transformOrigin: "bottom",
      }}
    ></div>
  </motion.div>
));

const WatchProviders = memo(({ info, mousePosition }) => {
  if (!info.watchProviders) return null;

  return (
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
          className="ri-play-circle-line text-[#00b1b3] mr-2"
          style={{
            textShadow: "0 0 10px rgba(0, 177, 179, 0.5)",
          }}
        ></i>
        Where to Watch
      </h3>

      <div
        className="relative"
        style={{
          transform: "translateZ(5px)",
        }}
      >
        {/* Streaming */}
        {info.watchProviders.flatrate &&
          info.watchProviders.flatrate.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <h4 className="text-xs sm:text-sm text-zinc-400 mb-2 sm:mb-3 flex items-center">
                <i className="ri-live-line text-[#00b1b3] mr-2 text-xs"></i>
                Stream
              </h4>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {info.watchProviders.flatrate.map((provider, index) => (
                  <WatchProvider
                    key={index}
                    provider={provider}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}

        {/* Rent */}
        {info.watchProviders.rent && info.watchProviders.rent.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <h4 className="text-xs sm:text-sm text-zinc-400 mb-2 sm:mb-3 flex items-center">
              <i className="ri-money-dollar-circle-line text-[#00b1b3] mr-2 text-xs"></i>
              Rent
            </h4>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {info.watchProviders.rent.map((provider, index) => (
                <WatchProvider key={index} provider={provider} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Buy */}
        {info.watchProviders.buy && info.watchProviders.buy.length > 0 && (
          <div>
            <h4 className="text-xs sm:text-sm text-zinc-400 mb-2 sm:mb-3 flex items-center">
              <i className="ri-shopping-cart-line text-[#00b1b3] mr-2 text-xs"></i>
              Buy
            </h4>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {info.watchProviders.buy.map((provider, index) => (
                <WatchProvider key={index} provider={provider} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
});

const Translations = memo(({ info, mousePosition }) => {
  if (!info.translations || info.translations.length === 0) return null;

  return (
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
          className="ri-translate-2 text-[#00b1b3] mr-2"
          style={{
            textShadow: "0 0 10px rgba(0, 177, 179, 0.5)",
          }}
        ></i>
        Available Languages
      </h3>

      <div
        className="flex flex-wrap gap-2 relative"
        style={{
          transform: "translateZ(5px)",
        }}
      >
        {info.translations.slice(0, 20).map((language, index) => (
          <motion.span
            key={index}
            className="text-xs sm:text-sm bg-zinc-700/50 px-2 sm:px-3 py-1 rounded-full"
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(63, 63, 70, 0.7)",
            }}
            style={{
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            {language}
          </motion.span>
        ))}
        {info.translations.length > 20 && (
          <motion.span
            className="text-xs sm:text-sm bg-[#00b1b3]/20 px-2 sm:px-3 py-1 rounded-full"
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(0, 177, 179, 0.3)",
            }}
            style={{
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            +{info.translations.length - 20} more
          </motion.span>
        )}
      </div>
    </motion.div>
  );
});

const MovieDetails = () => {
  const [searchVisible, setSearchVisible] = useState(false);
  const [showFullOverview, setShowFullOverview] = useState(false);
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

  const { info } = useSelector((state) => state.movie);

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

  // Format runtime to hours and minutes - memoized for performance
  const formatRuntime = useCallback((minutes) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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
    dispatch(asyncLoadMovie(id));
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setIsVisible(true), 100);

    return () => {
      dispatch(removeMovie());
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

      document.title = title ? `${title} | MODB Movies` : "MODB | Movies";
    } else {
      document.title = "MODB | Loading Movie";
    }
  }, [info]);

  // Add keyframes for animations - only once
  useEffect(() => {
    if (!document.getElementById("movie-details-animations")) {
      const style = document.createElement("style");
      style.id = "movie-details-animations";
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
  const sidebarWidth = isMobile ? "0%" : isTablet ? "15%" : "20%";
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
          className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: info.details.backdrop_path
              ? `url(https://image.tmdb.org/t/p/original/${info.details.backdrop_path})`
              : "none",
            backgroundPosition: `center ${0 + scrollPosition * 0.05}px`, // Parallax effect
          }}
        >
          {/* Backdrop fallback if no image */}
          {!info.details.backdrop_path && (
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
          <MovieHeader
            navigate={navigate}
            searchVisible={searchVisible}
            setSearchVisible={setSearchVisible}
            isVisible={isVisible}
          />

          <AnimatePresence>
            {searchVisible && (
              <motion.div
                className="absolute right-4 sm:right-6 md:right-8 top-12 sm:top-14 w-[90vw] sm:w-[400px] md:w-[500px] bg-zinc-800/95 backdrop-blur-md rounded-lg shadow-xl z-100 p-2"
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

          {/* Movie Title and Quick Info */}
          <MovieQuickInfo
            info={info}
            formatRuntime={formatRuntime}
            isVisible={isVisible}
            mousePosition={mousePosition}
            pathname={pathname}
          />
        </div>

        {/* Main Content */}
        <motion.div
          className="px-4 sm:px-8 md:px-12 py-6 sm:py-8 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        >
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
            {/* Left Column - Poster and External Links */}
            <div className="w-full lg:w-1/3 flex flex-col">
              {/* Poster */}
              <MoviePoster info={info} mousePosition={mousePosition} />

              {/* External Links */}
              <ExternalLinks info={info} mousePosition={mousePosition} />

              {/* Movie Info */}
              <MovieInfo
                info={info}
                formatDate={formatDate}
                formatRuntime={formatRuntime}
                mousePosition={mousePosition}
              />
            </div>

            {/* Right Column - Overview and Details */}
            <div className="w-full lg:w-2/3">
              {/* Overview */}
              <Overview
                info={info}
                showFullOverview={showFullOverview}
                setShowFullOverview={setShowFullOverview}
                mousePosition={mousePosition}
              />

              {/* Watch Providers */}
              <WatchProviders info={info} mousePosition={mousePosition} />

              {/* Translations */}
              <Translations info={info} mousePosition={mousePosition} />
            </div>
          </div>

          {/* Recommendations Section */}
          <motion.div
            className="mt-8 sm:mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          >
            <h2
              className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center"
              style={{
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              }}
            >
              <i
                className="ri-film-line text-[#00b1b3] mr-2"
                style={{
                  textShadow: "0 0 10px rgba(0, 177, 179, 0.5)",
                }}
              ></i>
              {info.recommendations && info.recommendations.length > 0
                ? "You May Also Like"
                : "Similar Movies"}
            </h2>

            <Suspense
              fallback={
                <div className="w-full h-48 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-zinc-700 border-t-[#00b1b3] rounded-full animate-spin"></div>
                </div>
              }
            >
              <HorizontalCards
                data={
                  info.recommendations && info.recommendations.length > 0
                    ? info.recommendations
                    : info.similar
                }
              />
            </Suspense>
          </motion.div>
        </motion.div>

        {/* Outlet for Trailer */}
        <Outlet />
      </main>
    </div>
  );
};

export default MovieDetails;
