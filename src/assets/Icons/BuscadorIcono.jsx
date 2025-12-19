import React from "react";

const BuscadorIcono = ({ props }) => {
  return (
    <svg
      className={`${props}`}
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      ariaHidden="true"
      role="img"
      class="iconify iconify--solar"
      width="20"
      height="20"
      viewBox="0 0 24 24"
    >
      <defs>
        <mask id="iconifyReact20">
          <g fill="none" strokeWidth="1.5">
            <circle cx="11.5" cy="11.5" r="9.5" stroke="gray"></circle>
            <path
              stroke="#fff"
              strokeLinecap="round"
              d="M18.5 18.5L22 22"
            ></path>
          </g>
        </mask>
      </defs>
      <path
        fill="currentColor"
        d="M0 0h24v24H0z"
        mask="url(#iconifyReact20)"
      ></path>
    </svg>
  );
};

export default BuscadorIcono;
