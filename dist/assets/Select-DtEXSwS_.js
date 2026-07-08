import{j as r}from"./index-DZKRcYBA.js";const i=({label:t,valor:o,setValor:n,options:a,className:l=""})=>r.jsxs("div",{className:`flex flex-col gap-1.5 ${l}`,children:[t&&r.jsx("label",{className:"text-[13px] font-medium text-[var(--color-neutral-text-muted)] pl-1",children:t}),r.jsxs("div",{className:"relative group",children:[r.jsx("select",{value:o,onChange:e=>n(e.target.value),className:`\r
            flex h-[42px] w-full rounded-[12px] px-4 text-[14px] \r
            bg-[var(--color-neutral-bg)] border border-transparent \r
            text-[var(--color-neutral-text-main)] \r
            focus:border-[var(--color-brand-primary)] focus:bg-white \r
            focus:ring-1 focus:ring-[var(--color-brand-primary)] \r
            outline-none transition-colors duration-200\r
            appearance-none cursor-pointer\r
          `,children:a.map(e=>r.jsx("option",{className:"bg-white text-black py-2",value:e.valor,children:e.texto},e.valor))}),r.jsx("div",{className:"absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-neutral-placeholder)] group-hover:text-[var(--color-neutral-text-main)] transition-colors",children:r.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round",children:r.jsx("path",{d:"m6 9 6 6 6-6"})})})]})]});export{i as S};
