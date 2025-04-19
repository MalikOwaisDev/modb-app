import React, { useState, useRef, useEffect, memo, useCallback } from "react";

const Dropdown = memo(({ title, options, func, selected }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(selected || null);
  const [hoverIndex, setHoverIndex] = useState(-1);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);
  const optionsRef = useRef(null);

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

  // Update selected option when prop changes
  useEffect(() => {
    if (selected) {
      setSelectedOption(selected);
    }
  }, [selected]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Track mouse position for subtle 3D effects - memoized for performance
  const handleMouseMove = useCallback(
    (e) => {
      if (!dropdownRef.current || isMobile) return;

      const rect = dropdownRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      setMousePosition({ x, y });
    },
    [isMobile]
  );

  // Handle option selection
  const handleSelect = useCallback(
    (option, index) => {
      setSelectedOption(option);
      setIsOpen(false);

      // Call the provided function with the selected option
      if (func) {
        const event = { target: { value: option } };
        func(event);
      }
    },
    [func]
  );

  // Toggle dropdown
  const toggleDropdown = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  return (
    <div
      ref={dropdownRef}
      className="relative w-full max-w-xs "
      onMouseMove={handleMouseMove}
    >
      {/* Main dropdown button with 3D effect */}
      <button
        onClick={toggleDropdown}
        className="w-full px-3 sm:px-4 py-2 hover:cursor-pointer sm:py-2.5 bg-zinc-800/80 backdrop-blur-sm text-left rounded-lg border border-zinc-700/30 flex items-center justify-between transition-all duration-300"
        style={{
          boxShadow: isOpen
            ? "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 0 10px rgba(0, 177, 179, 0.2)"
            : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          transform: !isMobile
            ? `perspective(500px) rotateX(${
                (mousePosition.y - 0.5) * -1
              }deg) rotateY(${(mousePosition.x - 0.5) * 1}deg)`
            : "none",
          transformOrigin: "center center",
          transition: "all 0.2s ease-out",
        }}
      >
        {/* Dropdown text */}
        <span
          className={`text-xs sm:text-sm font-medium ${
            selectedOption ? "text-white" : "text-zinc-400"
          }`}
        >
          {selectedOption ? selectedOption.toUpperCase() : title}
        </span>

        {/* Dropdown icon with animation */}
        <span
          className="text-[#00b1b3] transition-transform duration-300"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <i className="ri-arrow-down-s-line"></i>
        </span>

        {/* Subtle glow effect - only render when needed */}
        {isOpen && !isMobile && (
          <div
            className="absolute inset-0 rounded-lg pointer-events-none opacity-20 transition-opacity duration-300"
            style={{
              boxShadow: "inset 0 0 15px rgba(0, 177, 179, 0.3)",
              background:
                "radial-gradient(circle at center, rgba(0, 177, 179, 0.1), transparent 70%)",
            }}
          ></div>
        )}
      </button>

      {/* Dropdown options with 3D effect */}
      {isOpen && (
        <div
          ref={optionsRef}
          className={`absolute z-50 w-full mt-2 bg-zinc-800/95 backdrop-blur-md rounded-lg overflow-hidden border border-zinc-700/30 ${
            isMobile ? "max-h-[40vh]" : ""
          }`}
          style={{
            boxShadow:
              "0 15px 30px -5px rgba(0, 0, 0, 0.5), 0 0 10px rgba(0, 177, 179, 0.1)",
            transform: "translateZ(0)",
            animation: "dropdownFadeIn 0.2s ease-out forwards",
          }}
        >
          {/* Options list */}
          <div className="max-h-60 overflow-y-auto custom-scrollbar py-1">
            {options.map((option, i) => (
              <div
                key={i}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 cursor-pointer transition-all duration-200 flex items-center ${
                  hoverIndex === i ? "bg-zinc-700/50" : "hover:bg-zinc-700/30"
                }`}
                onClick={() => handleSelect(option, i)}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(-1)}
                style={{
                  transform:
                    hoverIndex === i ? "translateX(4px)" : "translateX(0)",
                }}
              >
                {/* Option text */}
                <span
                  className={`text-xs sm:text-sm ${
                    selectedOption === option
                      ? "text-[#00b1b3] font-medium"
                      : "text-zinc-300"
                  }`}
                >
                  {option.toUpperCase()}
                </span>

                {/* Selected indicator */}
                {selectedOption === option && (
                  <span className="ml-auto text-[#00b1b3]">
                    <i className="ri-check-line"></i>
                  </span>
                )}

                {/* Hover indicator */}
                {hoverIndex === i && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#00b1b3]"></div>
                )}
              </div>
            ))}
          </div>

          {/* Empty state */}
          {options.length === 0 && (
            <div className="px-4 py-6 text-center text-zinc-400">
              <i className="ri-inbox-line text-2xl mb-2 block"></i>
              <p className="text-sm">No options available</p>
            </div>
          )}

          {/* Decorative elements - only on non-mobile */}
          {!isMobile && (
            <>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00b1b3]/30 to-transparent"></div>

              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-6 h-6 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-px bg-[#00b1b3]/30"></div>
                <div className="absolute top-0 left-0 h-full w-px bg-[#00b1b3]/30"></div>
              </div>
              <div className="absolute top-0 right-0 w-6 h-6 pointer-events-none">
                <div className="absolute top-0 right-0 w-full h-px bg-[#00b1b3]/30"></div>
                <div className="absolute top-0 right-0 h-full w-px bg-[#00b1b3]/30"></div>
              </div>
              <div className="absolute bottom-0 left-0 w-6 h-6 pointer-events-none">
                <div className="absolute bottom-0 left-0 w-full h-px bg-[#00b1b3]/30"></div>
                <div className="absolute bottom-0 left-0 h-full w-px bg-[#00b1b3]/30"></div>
              </div>
              <div className="absolute bottom-0 right-0 w-6 h-6 pointer-events-none">
                <div className="absolute bottom-0 right-0 w-full h-px bg-[#00b1b3]/30"></div>
                <div className="absolute bottom-0 right-0 h-full w-px bg-[#00b1b3]/30"></div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Hidden native select for form compatibility */}
      <select
        onChange={func}
        value={selectedOption || "0"}
        name="format"
        id="format"
        className="sr-only"
      >
        <option value="0" disabled>
          {title}
        </option>
        {options.map((op, i) => (
          <option key={i} value={op}>
            {op.toUpperCase()}
          </option>
        ))}
      </select>

      {/* Add keyframes for animations */}
      <style jsx>{`
        @keyframes dropdownFadeIn {
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
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e1e1e;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #00b1b3;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
});

export default Dropdown;
