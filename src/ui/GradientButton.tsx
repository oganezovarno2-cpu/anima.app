import React from "react";

export default function GradientButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  const { className = "", children, ...rest } = props;
  return (
    <button
      {...rest}
      className={`w-full py-3 rounded-2xl btn-grad text-white font-semibold shadow ${className}`}
    >
      {children}
    </button>
  );
}
