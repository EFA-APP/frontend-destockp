import{r as s,j as e}from"./index-tqZrnK_S.js";import{r as a}from"./index-UwbRS_FE.js";const c=({open:r,onClose:t,children:o,width:l="max-w-[400px]"})=>{if(s.useEffect(()=>(document.body.style.overflow=r?"hidden":"",()=>document.body.style.overflow=""),[r]),!r)return null;const d=e.jsxs("div",{className:"fixed inset-0 z-[99999999] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300",children:[e.jsx("div",{className:"absolute inset-0 h-screen cursor-default",onClick:t}),e.jsxs("div",{className:`
          relative z-10 w-full ${l}
          max-h-[85vh] md:max-h-[90vh]
          bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)]
          overflow-hidden rounded-t-[24px] md:rounded-[16px]
          border-t md:border border-[var(--color-neutral-border)]
          flex flex-col animate-in fade-in zoom-in-95 duration-200
        `,children:[e.jsx("div",{className:"flex md:hidden justify-center pt-4 pb-2 w-full absolute top-0 left-0 right-0 z-30 bg-white",onClick:t,children:e.jsx("div",{className:"w-12 h-1.5 bg-black/10 rounded-full"})}),e.jsx("div",{className:"flex-1 overflow-y-auto md:overflow-hidden custom-scrollbar flex flex-col pt-6 md:pt-0",children:o})]})]});return a.createPortal(d,document.body)};export{c as M};
