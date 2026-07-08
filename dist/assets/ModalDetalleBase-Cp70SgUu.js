import{r as a,j as e}from"./index-DZKRcYBA.js";import{r as i}from"./index-Bb7yQu3E.js";const m=({open:r,onClose:o,children:l,width:s="max-w-[400px]",allowOverflow:t=!1})=>{if(a.useEffect(()=>(document.body.style.overflow=r?"hidden":"",()=>document.body.style.overflow=""),[r]),!r)return null;const d=e.jsxs("div",{className:"fixed inset-0 z-[99999999] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300",children:[e.jsx("div",{className:"absolute inset-0 h-screen cursor-default",onClick:o}),e.jsxs("div",{className:`
          relative z-10 w-full ${s}
          max-h-[85vh] md:max-h-[90vh]
          bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)]
          ${t?"overflow-visible":"overflow-hidden"} rounded-t-[24px] md:rounded-[16px]
          border-t md:border border-[var(--color-neutral-border)]
          flex flex-col animate-in fade-in zoom-in-95 duration-200
        `,children:[e.jsx("div",{className:"flex md:hidden justify-center pt-4 pb-2 w-full absolute top-0 left-0 right-0 z-30 bg-white",onClick:o,children:e.jsx("div",{className:"w-12 h-1.5 bg-black/10 rounded-full"})}),e.jsx("div",{className:`flex-1 ${t?"overflow-visible":"overflow-y-auto md:overflow-hidden"} custom-scrollbar flex flex-col pt-6 md:pt-0`,children:l})]})]});return i.createPortal(d,document.body)};export{m as M};
