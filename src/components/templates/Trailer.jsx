import React, { useEffect, useState, useRef } from "react";
import ReactPlayer from "react-player";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const Trailer = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [playerError, setPlayerError] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const spPath = pathname.split("/")[1];

  const details = useSelector((state) =>
    spPath === "movie" ? state.movie.info.details : state.tv.info.details
  );

  const key = useSelector((state) => {
    const videos =
      spPath === "movie" ? state.movie.info.videos : state.tv.info.videost;
    return videos?.key;
  });
  // Set document title and handle animation timing
  useEffect(() => {
    const title = details
      ? `Trailer | ${
          details.original_title ||
          details.title ||
          details.original_name ||
          details.name ||
          details.media_type
        }`
      : "MODB | Trailer";

    document.title = title !== "Trailer | undefined" ? title : "MODB | Trailer";

    // Lock body scroll
    document.body.style.overflow = "hidden";

    // Trigger entrance animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => {
      document.body.style.overflow = "auto";
      clearTimeout(timer);
    };
  }, [details]);

  // Track mouse position for subtle 3D effects
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setMousePosition({ x, y });
  };

  // Handle player ready state
  const handleReady = () => {
    setIsLoading(false);
  };

  // Handle player error
  const handleError = () => {
    setPlayerError(true);
    setIsLoading(false);
  };

  // Close trailer and navigate back with exit animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      navigate(-1);
    }, 300);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md overflow-auto py-8"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.3s ease-out",
      }}
      onMouseMove={handleMouseMove}
      ref={containerRef}
    >
      {/* Ambient glow effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x * 100}% ${
            mousePosition.y * 100
          }%, rgba(0, 177, 179, 0.15), transparent 70%)`,
          transition: "background 0.5s ease-out",
        }}
      ></div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#00b1b3]/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.3 + 0.2,
              transform: `scale(${Math.random() * 1.5 + 0.5})`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="relative w-full max-w-4xl mx-auto px-4 flex flex-col items-center">
        {/* Title display above video */}
        {details && (
          <div
            className="mb-4 text-center"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(-20px)",
              transition: "all 0.4s ease-out 0.1s",
            }}
          >
            <h2 className="text-white text-xl md:text-2xl font-medium flex flex-wrap items-center justify-center">
              <span className="mr-2">
                {details.original_title ||
                  details.title ||
                  details.original_name ||
                  details.name}
              </span>
              <span className="text-[#00b1b3] font-bold">Trailer</span>
            </h2>
          </div>
        )}

        {/* Video container with subtle 3D effect */}
        <div
          className="relative w-full aspect-video bg-black rounded-xl overflow-hidden"
          style={{
            boxShadow:
              "0 20px 40px -12px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 177, 179, 0.15)",
            transform: isVisible
              ? `scale(1) perspective(1000px) rotateX(${
                  (mousePosition.y - 0.5) * -1
                }deg) rotateY(${(mousePosition.x - 0.5) * 1}deg)`
              : "scale(0.95) perspective(1000px) rotateX(3deg)",
            opacity: isVisible ? 1 : 0,
            transition: "all 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
            border: "1px solid rgba(0, 177, 179, 0.2)",
            transformOrigin: "center center",
          }}
        >
          {/* Close button - repositioned for better visibility */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-30 flex hover:cursor-pointer items-center justify-center w-10 h-10 text-white bg-zinc-800/80 backdrop-blur-sm rounded-full hover:bg-[#00b1b3] transition-all duration-300 border border-zinc-700/30"
            aria-label="Close trailer"
            style={{
              boxShadow: "0 0 15px rgba(0, 0, 0, 0.3)",
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "scale(1)" : "scale(0.8)",
              transition: "all 0.3s ease-out 0.2s",
            }}
          >
            <i className="ri-close-line text-xl"></i>
          </button>

          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-[#00b1b3]/50"></div>
            <div className="absolute top-0 left-0 h-full w-[1px] bg-[#00b1b3]/50"></div>
          </div>
          <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
            <div className="absolute top-0 right-0 w-full h-[1px] bg-[#00b1b3]/50"></div>
            <div className="absolute top-0 right-0 h-full w-[1px] bg-[#00b1b3]/50"></div>
          </div>
          <div className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none">
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#00b1b3]/50"></div>
            <div className="absolute bottom-0 left-0 h-full w-[1px] bg-[#00b1b3]/50"></div>
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none">
            <div className="absolute bottom-0 right-0 w-full h-[1px] bg-[#00b1b3]/50"></div>
            <div className="absolute bottom-0 right-0 h-full w-[1px] bg-[#00b1b3]/50"></div>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/95 z-20 backdrop-blur-sm">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full bg-[#00b1b3]/20 blur-xl animate-pulse"></div>
                <div className="w-full h-full relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00b1b3] to-[#008486] animate-spin blur-sm"></div>
                  <div className="absolute inset-2 bg-zinc-900 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border-3 border-zinc-700 border-t-[#00b1b3] rounded-full animate-spin"></div>
                  </div>
                </div>
              </div>
              <p className="text-zinc-300 text-base font-medium">
                Loading trailer
              </p>
              <p className="text-zinc-500 text-xs mt-1">
                Preparing your cinematic experience...
              </p>
            </div>
          )}

          {/* Error state */}
          {playerError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/95 p-6 text-center z-20 backdrop-blur-sm">
              <div className="w-16 h-16 rounded-full bg-zinc-800/80 flex items-center justify-center mb-4 relative">
                <div className="absolute inset-0 rounded-full bg-[#00b1b3]/10 blur-xl animate-pulse"></div>
                <i className="ri-error-warning-line text-3xl text-[#00b1b3]"></i>
              </div>
              <h3 className="text-white text-xl font-bold mb-2">
                Trailer Unavailable
              </h3>
              <p className="text-zinc-400 mb-6 max-w-md text-sm">
                Sorry, we couldn't load the trailer. It may be unavailable or
                there might be a connection issue.
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-[#00b1b3] text-white rounded-lg hover:bg-[#00b1b3]/80 transition-colors shadow-lg shadow-[#00b1b3]/20 flex items-center text-sm"
              >
                <i className="ri-arrow-left-line mr-2"></i>
                Go Back
              </button>
            </div>
          )}

          {/* No trailer available message */}
          {!key && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/95 p-6 text-center z-20 backdrop-blur-sm">
              <div className="w-16 h-16 rounded-full bg-zinc-800/80 flex items-center justify-center mb-4 relative">
                <div className="absolute inset-0 rounded-full bg-[#00b1b3]/10 blur-xl animate-pulse"></div>
                <i className="ri-film-line text-3xl text-[#00b1b3]"></i>
              </div>
              <h3 className="text-white text-xl font-bold mb-2">
                No Trailer Available
              </h3>
              <p className="text-zinc-400 mb-6 max-w-md text-sm">
                We couldn't find a trailer for this title. Check back later or
                explore other content.
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-[#00b1b3] text-white rounded-lg hover:bg-[#00b1b3]/80 transition-colors shadow-lg shadow-[#00b1b3]/20 flex items-center text-sm"
              >
                <i className="ri-arrow-left-line mr-2"></i>
                Go Back
              </button>
            </div>
          )}

          {/* Video player */}
          {key && (
            <div className="w-full h-full relative">
              <ReactPlayer
                url={`https://www.youtube.com/watch?v=${key}`}
                width="100%"
                height="100%"
                controls={true}
                playing={true}
                onReady={handleReady}
                onError={handleError}
                style={{ position: "absolute", top: 0, left: 0 }}
                config={{
                  youtube: {
                    playerVars: {
                      modestbranding: 1,
                      rel: 0,
                    },
                  },
                }}
              />

              {/* Overlay gradient for better integration */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: "inset 0 0 50px rgba(0, 0, 0, 0.5)",
                  opacity: isLoading ? 0 : 0.2,
                  transition: "opacity 0.5s ease-out",
                }}
              ></div>
            </div>
          )}
        </div>

        {/* Additional controls */}
        {!isLoading && !playerError && key && (
          <div
            className="mt-4 flex justify-center gap-3 flex-wrap"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.4s ease-out 0.3s",
            }}
          >
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-zinc-800/80 backdrop-blur-sm text-white rounded-lg hover:bg-zinc-700/80 transition-colors border border-zinc-700/30 flex items-center shadow-md text-sm"
            >
              <i className="ri-arrow-left-line mr-2"></i>
              Back
            </button>

            <button className="px-4 py-2 bg-zinc-800/80 backdrop-blur-sm text-white rounded-lg hover:bg-zinc-700/80 transition-colors border border-zinc-700/30 flex items-center shadow-md text-sm">
              <i className="ri-share-line mr-2"></i>
              Share
            </button>

            <button className="px-4 py-2 bg-[#00b1b3] text-white rounded-lg hover:bg-[#00a0a2] transition-colors flex items-center shadow-md text-sm">
              <i className="ri-information-line mr-2"></i>
              View Details
            </button>
          </div>
        )}
      </div>

      {/* Add keyframes for animations */}
      <style jsx>{`
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
      `}</style>
    </div>
  );
};

export default Trailer;
