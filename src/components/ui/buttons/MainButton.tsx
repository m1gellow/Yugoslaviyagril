import React from "react";

interface MainButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "submit" | "button" | "reset";
  className?: string;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

const MainButton = ({
  children,
  type = "button",
  onClick,
  className = "",
  disabled = false,
  variant = "primary",
  size = "md",
}: MainButtonProps) => {
  // Base classes
  const baseClasses = "rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  // Variant classes
  const variantClasses = {
    primary: "bg-gradient-to-r from-orange-400 to-red-500 text-white hover:from-orange-500 hover:to-red-600 focus:ring-orange-300",
    secondary: "bg-gray-800 text-white hover:bg-gray-700 focus:ring-gray-500",
    outline: "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-300",
  };

  // Size classes
  const sizeClasses = {
    sm: "px-4 py-1.5 text-xs",
    md: "px-6 lg:px-8 py-2.5 text-sm",
    lg: "px-8 lg:px-12 py-3 text-base",
  };

  // Disabled classes
  const disabledClasses = "opacity-50 cursor-not-allowed";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? disabledClasses : ""}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default MainButton;