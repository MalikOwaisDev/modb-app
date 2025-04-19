import React, { useEffect, useState } from "react";

const Preloader = ({ progress = null }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showText, setShowText] = useState(false);
  const [loadingTexts, setLoadingTexts] = useState([
    "Fetching the stars...",
    "Preparing your experience...",
    "Loading cinematic universe...",
    "Gathering the latest content...",
    "Almost there...",
  ]);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  // Simulate progress if not provided
  useEffect(() => {
    if (progress !== null) {
      setLoadingProgress(progress);
    } else {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 100 ? 100 : newProgress;
        });
      }, 400);

      return () => clearInterval(interval);
    }
  }, [progress]);

  // Show text after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Cycle through loading texts
  useEffect(() => {
    if (!showText) return;

    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [showText, loadingTexts.length]);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-zinc-900 overflow-hidden">
      {/* Background ambient effect */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at center, rgba(0, 177, 179, 0.2), transparent 70%)",
          animation: "pulse 4s ease-in-out infinite",
        }}
      ></div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#00b1b3]/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.3,
              transform: `scale(${Math.random() * 2 + 0.5})`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          ></div>
        ))}
      </div>

      {/* 3D Loader Container */}
      <div className="relative w-40 h-40 perspective">
        <div
          className="absolute inset-0 rounded-xl bg-[#00b1b3]/10 blur-xl animate-pulse"
          style={{
            transform: "translateZ(-10px)",
          }}
        ></div>

        {/* Main loader with 3D effect */}
        <div
          className="w-full h-full relative flex items-center justify-center"
          style={{
            transform: "rotateX(20deg) rotateY(10deg)",
            transformStyle: "preserve-3d",
            animation: "float-subtle 6s ease-in-out infinite",
          }}
        >
          {/* Outer spinning gradient */}
          <div
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#00b1b3] via-[#008486] to-[#00b1b3] animate-spin"
            style={{
              animationDuration: "8s",
              filter: "blur(8px)",
              opacity: 0.7,
            }}
          ></div>

          {/* Inner container */}
          <div
            className="absolute inset-2 bg-zinc-900 rounded-lg flex items-center justify-center overflow-hidden"
            style={{
              transform: "translateZ(5px)",
              boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Logo */}
            <div
              className="absolute text-3xl font-bold text-white flex items-center perspective z-10"
              style={{
                textShadow: "0 0 10px rgba(0, 177, 179, 0.5)",
                transform: "translateZ(20px) scale(1.2)",
                opacity: 0.9,
              }}
            >
              <span className="text-[#00b1b3] mr-1">MO</span>
              <span>DB</span>
            </div>

            {/* Animated bars */}
            <div
              className="flex gap-1.5 items-center absolute"
              style={{
                transform: "translateZ(10px) scale(0.8) translateY(30px)",
              }}
            >
              <div className="w-1.5 h-10 bg-[#00b1b3] rounded-full animate-[bounce_1s_ease-in-out_infinite]"></div>
              <div className="w-1.5 h-10 bg-[#00a0a2] rounded-full animate-[bounce_1s_ease-in-out_infinite_0.1s]"></div>
              <div className="w-1.5 h-10 bg-[#009092] rounded-full animate-[bounce_1s_ease-in-out_infinite_0.2s]"></div>
              <div className="w-1.5 h-10 bg-[#008486] rounded-full animate-[bounce_1s_ease-in-out_infinite_0.3s]"></div>
            </div>

            {/* Inner glow effect */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-transparent via-[#00b1b3]/10 to-transparent animate-pulse"
              style={{
                animationDuration: "3s",
              }}
            ></div>
          </div>

          {/* Progress indicator */}
          <div
            className="absolute -bottom-3 left-0 right-0 h-1 bg-zinc-800 rounded-full overflow-hidden"
            style={{
              transform: "translateZ(15px)",
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-[#00b1b3] to-[#00d8da] transition-all duration-300 rounded-full"
              style={{
                width: `${loadingProgress}%`,
                boxShadow: "0 0 10px rgba(0, 177, 179, 0.5)",
              }}
            ></div>
          </div>
        </div>

        {/* Corner lights */}
        <div
          className="absolute -top-1 -left-1 w-3 h-3 bg-[#00b1b3] rounded-full animate-ping opacity-70"
          style={{ animationDuration: "2s" }}
        ></div>
        <div
          className="absolute -top-1 -right-1 w-3 h-3 bg-[#00b1b3] rounded-full animate-ping opacity-70"
          style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#00b1b3] rounded-full animate-ping opacity-70"
          style={{ animationDuration: "2.2s", animationDelay: "0.3s" }}
        ></div>
        <div
          className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#00b1b3] rounded-full animate-ping opacity-70"
          style={{ animationDuration: "2.7s", animationDelay: "0.7s" }}
        ></div>
      </div>

      {/* Loading text with fade-in effect */}
      <div
        className={`mt-12 text-center transition-opacity duration-500 ${
          showText ? "opacity-100" : "opacity-0"
        }`}
        style={{
          transform: "translateZ(10px)",
        }}
      >
        <div className="text-[#00b1b3] font-medium mb-2 text-lg relative">
          <span
            className="absolute inset-0 flex justify-center items-center transition-opacity duration-500"
            style={{
              opacity: loadingProgress === 100 ? 1 : 0,
            }}
          >
            Ready to explore!
          </span>

          <span
            className="transition-opacity duration-500"
            style={{
              opacity: loadingProgress < 100 ? 1 : 0,
            }}
          >
            {loadingTexts[currentTextIndex]}
          </span>
        </div>

        <div className="text-zinc-500 text-sm">
          {Math.round(loadingProgress)}% Complete
        </div>
      </div>

      {/* Add keyframes for animations */}
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.4;
          }
        }

        @keyframes float {
          0% {
            transform: translateY(0) translateX(0) scale(1);
          }
          25% {
            transform: translateY(-20px) translateX(10px) scale(1.1);
          }
          50% {
            transform: translateY(-40px) translateX(0) scale(1);
          }
          75% {
            transform: translateY(-20px) translateX(-10px) scale(0.9);
          }
          100% {
            transform: translateY(0) translateX(0) scale(1);
          }
        }

        @keyframes float-subtle {
          0%,
          100% {
            transform: rotateX(20deg) rotateY(10deg) translateZ(0);
          }
          50% {
            transform: rotateX(25deg) rotateY(15deg) translateZ(10px);
          }
        }
      `}</style>
    </div>
  );
};

export default Preloader;
