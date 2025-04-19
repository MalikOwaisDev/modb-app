import React, { useState, useEffect, useCallback, memo } from "react";
import { Link, useLocation } from "react-router-dom";
import image from "../../../public/image.png";

// Memoized NavItem component to prevent unnecessary re-renders
const NavItem = memo(
  ({ to, icon, label, isActive, mousePosition, isHovering }) => {
    return (
      <Link
        to={to}
        className={`relative flex items-center rounded-xl p-3 transition-all duration-300 overflow-hidden group ${
          isActive
            ? "bg-gradient-to-r from-[#00b1b3] to-[#008486] text-white font-medium"
            : "hover:bg-zinc-800/50 hover:text-white"
        }`}
        style={{
          transform:
            isHovering && !isActive
              ? `perspective(1000px) rotateX(${
                  (mousePosition.y - 0.5) * -2
                }deg) rotateY(${(mousePosition.x - 0.5) * 2}deg)`
              : "perspective(1000px) rotateX(0) rotateY(0)",
          transformStyle: "preserve-3d",
          transition: isHovering
            ? "transform 0.1s ease-out"
            : "transform 0.3s ease-out",
          boxShadow: isActive
            ? "0 5px 15px -5px rgba(0, 177, 179, 0.5)"
            : "none",
        }}
      >
        {/* Background glow effect on hover */}
        {!isActive && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at center, rgba(0, 177, 179, 0.15), transparent 70%)",
            }}
          ></div>
        )}

        {/* Icon with 3D effect */}
        <i
          className={`${icon} mr-3 text-xl transition-transform duration-300 group-hover:scale-110 ${
            isActive ? "text-white" : "text-[#00b1b3]"
          }`}
          style={{
            textShadow: isActive ? "0 0 10px rgba(255, 255, 255, 0.5)" : "none",
            transform: "translateZ(5px)",
          }}
        ></i>

        {/* Label with 3D effect */}
        <span
          className="sm:inline-block md:inline-block lg:inline-block"
          style={{ transform: "translateZ(2px)" }}
        >
          {label}
        </span>

        {/* Active indicator */}
        {isActive && (
          <div className="absolute right-3 w-2 h-2 rounded-full bg-white animate-pulse"></div>
        )}

        {/* Hover indicator */}
        {!isActive && (
          <div className="absolute right-3 w-0 h-1 rounded-full bg-[#00b1b3]/50 group-hover:w-2 transition-all duration-300"></div>
        )}
      </Link>
    );
  }
);

// Main SideNav component
function SideNav({ isMobile, isOpen, toggleMenu }) {
  const location = useLocation();
  const path = location.pathname;
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isHovering, setIsHovering] = useState(false);

  // Handle mouse movement for 3D effect - memoized to improve performance
  const handleMouseMove = useCallback(
    (e) => {
      if (!isHovering) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMousePosition({ x, y });
    },
    [isHovering]
  );

  // Reset position when not hovering
  useEffect(() => {
    if (!isHovering) {
      const timer = setTimeout(() => {
        setMousePosition({ x: 0.5, y: 0.5 });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isHovering]);

  // Toggle mobile menu

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button
          onClick={toggleMenu}
          className="fixed top-4 left-4 z-300 w-10 h-10 flex items-center justify-center rounded-full bg-zinc-800 text-white shadow-lg"
          style={{
            boxShadow: "0 0 15px rgba(0, 177, 179, 0.3)",
          }}
        >
          <i className={`ri-${isOpen ? "close" : "menu"}-line text-xl`}></i>
        </button>
      )}

      {/* Main SideNav */}
      <div
        className={`${
          isMobile ? "w-[250px] fixed z-100" : "w-[20%]"
        } h-screen fixed left-0 top-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border-r border-zinc-800/50 py-6 px-5 flex flex-col overflow-y-auto overflow-x-hidden backdrop-blur-sm transition-transform duration-300 ease-in-out ${
          isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
        }`}
        style={{
          boxShadow: "inset -10px 0 20px -10px rgba(0, 177, 179, 0.1)",
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Ambient glow effect - only render when visible for performance */}
        {isHovering && (
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              background: `radial-gradient(circle at ${
                mousePosition.x * 100
              }% ${
                mousePosition.y * 100
              }%, rgba(0, 177, 179, 0.15), transparent 70%)`,
              transition: "none",
            }}
          ></div>
        )}

        {/* Logo with 3D effect */}
        <Link to="/" className="relative flex items-center group perspective">
          <div className="absolute -left-1 -top-1 w-10 h-10 bg-[#00b1b3]/20 rounded-full blur-md"></div>
          <i
            className="text-[#00b1b3] ri-tv-fill text-3xl mr-3 relative transform transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12"
            style={{
              textShadow: "0 0 15px rgba(0, 177, 179, 0.7)",
            }}
          ></i>
          <div className="transform transition-all duration-300 group-hover:translate-x-1">
            <h1 className="text-2xl text-white font-bold tracking-tight">
              MODB<span className="text-[#00b1b3] animate-pulse">.</span>
            </h1>
          </div>
        </Link>

        {/* User Profile - hide on smaller screens */}
        <div className="mt-8 relative group perspective sm:block">
          <div
            className="p-4 bg-zinc-800/30 backdrop-blur-sm rounded-xl border border-zinc-700/50 flex items-center transform transition-all duration-300 hover:translate-y-[-5px] hover:shadow-lg"
            style={{
              boxShadow: "0 10px 20px -10px rgba(0, 0, 0, 0.3)",
              transform: isHovering
                ? `rotateX(${(mousePosition.y - 0.5) * -5}deg) rotateY(${
                    (mousePosition.x - 0.5) * 5
                  }deg)`
                : "rotateX(0) rotateY(0)",
              transformStyle: "preserve-3d",
              transition: isHovering
                ? "transform 0.1s ease-out"
                : "transform 0.5s ease-out",
            }}
          >
            <div
              className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00b1b3] to-[#008486] flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110"
              style={{
                transform: "translateZ(10px)",
                backgroundImage: `url("${image}")`,
              }}
            >
              <div>
                {image && image ? (
                  <img
                    src={image}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <i className="ri-user-fill text-white text-xl"></i>
                )}
              </div>
            </div>
            <div className="ml-4" style={{ transform: "translateZ(5px)" }}>
              <p className="text-white font-medium">Welcome</p>
              <p className="text-zinc-400 text-sm">Movie Enthusiast</p>
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-1 -right-1 w-20 h-8 bg-[#00b1b3]/10 rounded-full blur-md"></div>
          </div>
        </div>

        {/* Main Navigation with 3D effect */}
        <div className="mt-10 perspective">
          <h1 className="text-zinc-100 font-semibold text-sm uppercase tracking-wider mb-4 flex items-center">
            <span className="w-6 h-[2px] bg-gradient-to-r from-[#00b1b3] to-transparent mr-2"></span>
            <span className="sm:inline-block">New Feeds</span>
          </h1>

          <nav className="flex flex-col text-zinc-400 text-[15px] gap-2 relative">
            {/* Glowing indicator for active item - only render when needed */}
            {["/trending", "/popular", "/movie", "/tv", "/people"].includes(
              path
            ) && (
              <div
                className="absolute w-full h-12 bg-gradient-to-r from-[#00b1b3]/20 to-transparent rounded-xl pointer-events-none transition-all duration-300"
                style={{
                  top:
                    path === "/trending"
                      ? "0"
                      : path === "/popular"
                      ? "56px"
                      : path === "/movie"
                      ? "112px"
                      : path === "/tv"
                      ? "168px"
                      : path === "/people"
                      ? "224px"
                      : "0",
                  boxShadow: "0 0 20px rgba(0, 177, 179, 0.3)",
                }}
              ></div>
            )}

            {/* Navigation Items */}
            <NavItem
              to="/trending"
              icon="ri-fire-fill"
              label="Trending"
              isActive={path === "/trending"}
              mousePosition={mousePosition}
              isHovering={isHovering}
            />

            <NavItem
              to="/popular"
              icon="ri-bard-fill"
              label="Popular"
              isActive={path === "/popular"}
              mousePosition={mousePosition}
              isHovering={isHovering}
            />

            <NavItem
              to="/movie"
              icon="ri-movie-2-fill"
              label="Movies"
              isActive={path === "/movie"}
              mousePosition={mousePosition}
              isHovering={isHovering}
            />

            <NavItem
              to="/tv"
              icon="ri-tv-2-fill"
              label="TV Shows"
              isActive={path === "/tv"}
              mousePosition={mousePosition}
              isHovering={isHovering}
            />

            <NavItem
              to="/people"
              icon="ri-team-fill"
              label="People"
              isActive={path === "/people"}
              mousePosition={mousePosition}
              isHovering={isHovering}
            />
          </nav>
        </div>

        {/* Divider with glow effect */}
        <div className="my-6 relative">
          <div className="h-[1px] bg-gradient-to-r from-[#00b1b3]/50 via-zinc-700/30 to-transparent"></div>
          <div className="absolute h-[1px] w-1/3 bg-[#00b1b3]/20 blur-sm"></div>
        </div>

        {/* Information Section */}
        <div className="perspective">
          <h1 className="text-zinc-100 font-semibold text-sm uppercase tracking-wider mb-4 flex items-center">
            <span className="w-6 h-[2px] bg-gradient-to-r from-[#00b1b3] to-transparent mr-2"></span>
            <span className="sm:inline-block">Information</span>
          </h1>

          <nav className="flex flex-col text-zinc-400 text-[15px] gap-2 relative">
            {/* Glowing indicator for active item - only render when needed */}
            {["/about", "/contact"].includes(path) && (
              <div
                className="absolute w-full h-12 bg-gradient-to-r from-[#00b1b3]/20 to-transparent rounded-xl pointer-events-none transition-all duration-300"
                style={{
                  top:
                    path === "/about"
                      ? "0"
                      : path === "/contact"
                      ? "56px"
                      : "0",
                  boxShadow: "0 0 20px rgba(0, 177, 179, 0.3)",
                }}
              ></div>
            )}

            <NavItem
              to="/about"
              icon="ri-information-fill"
              label="About MODB"
              isActive={path === "/about"}
              mousePosition={mousePosition}
              isHovering={isHovering}
            />

            <NavItem
              to="/contact"
              icon="ri-phone-fill"
              label="Contact Us"
              isActive={path === "/contact"}
              mousePosition={mousePosition}
              isHovering={isHovering}
            />
          </nav>
        </div>

        {/* Footer with 3D effect - hide on smaller screens */}
        <div className="mt-auto pt-6 perspective hidden sm:block">
          <div
            className="relative p-4 bg-zinc-800/20 backdrop-blur-sm rounded-xl border border-zinc-700/30 transform transition-all duration-300 hover:translate-y-[-3px]"
            style={{
              boxShadow: "0 10px 20px -10px rgba(0, 0, 0, 0.2)",
              transform: isHovering
                ? `rotateX(${(mousePosition.y - 0.5) * -3}deg) rotateY(${
                    (mousePosition.x - 0.5) * 3
                  }deg)`
                : "rotateX(0) rotateY(0)",
              transformStyle: "preserve-3d",
              transition: isHovering
                ? "transform 0.1s ease-out"
                : "transform 0.5s ease-out",
            }}
          >
            <div
              className="text-center"
              style={{ transform: "translateZ(5px)" }}
            >
              <div className="text-zinc-500 text-xs mb-2">
                © {new Date().getFullYear()} MODB
              </div>
              <div className="flex justify-center space-x-3 text-zinc-600">
                <i className="ri-github-fill hover:text-[#00b1b3] transition-colors cursor-pointer"></i>
                <i className="ri-twitter-x-fill hover:text-[#00b1b3] transition-colors cursor-pointer"></i>
                <i className="ri-instagram-fill hover:text-[#00b1b3] transition-colors cursor-pointer"></i>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-1 -right-1 w-20 h-8 bg-[#00b1b3]/5 rounded-full blur-md"></div>
          </div>
        </div>

        {/* Simplified footer for mobile */}
        <div className="mt-auto pt-4 sm:hidden">
          <div className="text-center text-zinc-500 text-xs">
            © {new Date().getFullYear()} MODB
          </div>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={toggleMenu}
        ></div>
      )}

      {/* Spacer div for non-mobile layouts */}
      {!isMobile && <div className="w-[20%] h-screen"></div>}
    </>
  );
}

export default SideNav;
