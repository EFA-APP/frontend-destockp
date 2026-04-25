import{j as e}from"./index-g64Au8nd.js";const c=({label:t,value:s,onChange:r,size:a="sm",className:l=""})=>{const o={sm:"h-9 text-[13px] pl-4 pr-10",md:"h-10 text-sm pl-4 pr-10"};return e.jsxs("div",{className:"flex flex-col gap-1 w-full",children:[t&&e.jsx("span",{className:"text-[13px] font-semibold text-[var(--text-muted)] uppercase  mb-1 ml-1",children:t}),e.jsx("div",{className:"relative group",children:e.jsx("input",{type:"date",value:s,onChange:n=>r(n.target.value),className:`
            ${o[a]}
            w-full
            rounded-md!
            bg-[var(--border-subtle)]! 
            border border-black/10!
            text-black!
            placeholder:text-black/20
            focus:outline-none
            focus:border-amber-700/50!
            
            appearance-none
            ${l}
          `})})]})};export{c as F};
