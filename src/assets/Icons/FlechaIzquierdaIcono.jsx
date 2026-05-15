const FlechaIzquierdaIcono = ({ size = "24", color = "currentColor" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
    >
      <g
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m13 19l-6-7l6-7" />
        <path d="m17 19l-6-7l6-7" />
      </g>
    </svg>
  );
};

export default FlechaIzquierdaIcono;
