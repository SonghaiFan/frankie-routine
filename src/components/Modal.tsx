"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  width = "max-w-3xl",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [localOpen, setLocalOpen] = useState(false);

  // Sync local state with prop
  useEffect(() => {
    if (isOpen) {
      setLocalOpen(true);
      setIsAnimating(true);
      document.body.style.overflow = "hidden";
      // Animation timing
      setTimeout(() => setIsAnimating(false), 300);
    } else if (localOpen) {
      setIsAnimating(true);
      // Wait for animation before removing from DOM
      const timer = setTimeout(() => {
        setLocalOpen(false);
        document.body.style.overflow = "";
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, localOpen]);

  // Memoize handlers
  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isAnimating) {
        onClose();
      }
    },
    [onClose, isAnimating]
  );

  // Set up escape key listener
  useEffect(() => {
    if (localOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [localOpen, handleEsc]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      // Only close if clicking the backdrop itself and not during animation
      if (e.target === e.currentTarget && !isAnimating) {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    },
    [onClose, isAnimating]
  );

  if (!localOpen) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300"
      onClick={handleBackdropClick}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
        opacity: isAnimating && !isOpen ? 0 : 1,
      }}
    >
      {/* Modal Content */}
      <div
        ref={modalRef}
        className={`bg-white rounded-xl shadow-2xl ${width} w-full max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300
          ${isAnimating ? "scale-95 opacity-0" : "scale-100 opacity-100"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          {title ? (
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          ) : (
            <div />
          )}
          <button
            className="ml-auto p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isAnimating) {
                onClose();
              }
            }}
            aria-label="关闭"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        {/* Modal Body */}
        <div
          className="flex-1 overflow-y-auto p-0"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
