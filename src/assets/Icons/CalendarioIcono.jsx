import React from "react";

const CalendarioIcono = ({ size, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || "24"}
      height={size || "24"}
      viewBox="0 0 24 24"
    >
      <g fill="none">
        <path
          fill={color || "currentColor"}
          fill-opacity="0.25"
          d="M3 10c0-1.886 0-2.828.586-3.414S5.114 6 7 6h10c1.886 0 2.828 0 3.414.586S21 8.114 21 10z"
        />
        <rect
          width="18"
          height="15"
          x="3"
          y="6"
          stroke={color || "currentColor"}
          strokeWidth="1.2"
          rx="2"
        />
        <path
          stroke={color || "currentColor"}
          strokeLinecap="round"
          strokeWidth="1.2"
          d="M7 3v3m10-3v3"
        />
        <rect
          width="4"
          height="2"
          x="7"
          y="12"
          fill={color || "currentColor"}
          rx=".5"
        />
        <rect
          width="4"
          height="2"
          x="7"
          y="16"
          fill={color || "currentColor"}
          rx=".5"
        />
        <rect
          width="4"
          height="2"
          x="13"
          y="12"
          fill={color || "currentColor"}
          rx=".5"
        />
        <rect
          width="4"
          height="2"
          x="13"
          y="16"
          fill={color || "currentColor"}
          rx=".5"
        />
      </g>
    </svg>
  );
};

export default CalendarioIcono;
