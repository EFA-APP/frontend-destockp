import{r as y,j as e,L as x,h as j,e as p,i as w,u as N,k as C}from"./index-BruFCnlC.js";import{P as S}from"./PersonaIcono-CjyNED3v.js";import{C as k}from"./CandadoIcono-CMRDquZR.js";import{C as A,D as I,E as z}from"./EmailIcono-SXl-CKR5.js";import{u as E}from"./useMutation-mabOr9Xi.js";const h={email:e.jsx(z,{color:"var(--primary-light)"}),contrasena:e.jsx(k,{color:"var(--primary-light)",size:20}),usuario:e.jsx(S,{color:"var(--primary-light)",size:20}),cuit:e.jsx(I,{color:"var(--primary-light)",size:20}),confirmarContrasena:e.jsx(A,{color:"var(--primary-light)",size:20})},_=({titulo:o,descripcion:a,campos:t,onSubmit:m,cargando:s=!1,errores:l={},enlaces:n=[],boton:c={texto:"Enviar",textoCargando:"Cargando..."},pieFormulario:d=null})=>{const[u,g]=y.useState({}),v=(r,i)=>{g(b=>({...b,[r]:i}))},f=r=>{r.preventDefault(),m(u)};return e.jsxs("div",{className:"min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1b1e22] via-[#15171a] to-[#0a0c0e] relative overflow-hidden",children:[e.jsx("div",{className:"absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-[100px] pointer-events-none"}),e.jsx("div",{className:"absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--primary-light)]/10 rounded-full blur-[100px] pointer-events-none"}),e.jsxs("div",{className:`\r
          relative z-10\r
          w-full max-w-sm\r
          rounded-2xl\r
          bg-white/[0.03]\r
          backdrop-blur-xl\r
          border border-white/10\r
          shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]\r
          px-8 py-10\r
        `,children:[e.jsxs("div",{className:"flex items-center gap-5 mb-8",children:[e.jsx("div",{className:"flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary)]/20 to-transparent border border-[var(--primary)]/10 flex items-center justify-center p-2.5 shadow-inner",children:e.jsx("img",{src:"/efa-logo.png",alt:"Logo",className:"w-full h-full object-contain filter drop-shadow-sm rounded-full!"})}),e.jsxs("div",{className:"text-left",children:[e.jsx("h1",{className:"text-xl font-black text-[var(--text-primary)] tracking-tight uppercase leading-none mb-1",children:"Iniciar Sesión"}),e.jsx("p",{className:"text-[10px] text-[var(--text-muted)] font-bold tracking-[0.2em] uppercase opacity-60",children:"Acceso al Sistema"})]})]}),e.jsxs("form",{onSubmit:f,className:"space-y-5",children:[t.map(r=>e.jsxs("div",{className:"relative group",children:[e.jsx("label",{className:"block text-xs font-semibold text-gray-400 mb-1.5 transition-colors group-focus-within:text-[var(--primary-light)]",children:r.label}),e.jsxs("div",{className:"relative",children:[e.jsx("input",{type:r.type||"text",value:u[r.name]||"",onChange:i=>v(r.name,i.target.value),placeholder:r.placeholder,inputMode:r.inputMode,maxLength:r.maxLength,className:`\r
                    w-full h-11\r
                    rounded-xl\r
                    bg-black/20\r
                    border border-white/10\r
                    text-sm text-white\r
                    focus:outline-none\r
                    focus:border-[var(--primary-light)]\r
                    focus:ring-1\r
                    focus:ring-[var(--primary-light)]\r
                    focus:bg-black/40\r
                    placeholder:text-gray-500\r
                    transition-all duration-300\r
                    px-10\r
                    shadow-inner\r
                  `}),h[r.name]&&e.jsx("span",{className:"absolute top-1/2 -translate-y-1/2 left-3.5 opacity-60 group-focus-within:opacity-100 transition-opacity duration-300",children:h[r.name]})]}),l[r.name]&&e.jsxs("p",{className:"text-xs text-red-400 mt-1.5 font-medium flex items-center gap-1",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor",className:"w-3 h-3",children:e.jsx("path",{fillRule:"evenodd",d:"M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z",clipRule:"evenodd"})}),l[r.name]]}),r.enlace&&e.jsx("div",{className:"flex justify-end mt-2",children:e.jsx(x,{to:r.enlace.to,className:"text-xs font-medium text-[var(--primary-light)] hover:text-white transition-colors",children:r.enlace.texto})})]},r.name)),n.length>0&&e.jsx("div",{className:"flex flex-col items-end gap-1.5",children:n.map((r,i)=>e.jsx(x,{to:r.to,className:"block text-xs font-medium text-[var(--primary-light)] hover:text-white transition-colors",children:r.texto},i))}),e.jsx("button",{type:"submit",disabled:s,className:`\r
              w-full h-11 mt-2\r
              flex items-center justify-center\r
              rounded-xl\r
              bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)]\r
              text-white text-sm font-semibold tracking-wide\r
              hover:shadow-[0_0_20px_rgba(209,112,16,0.4)]\r
              hover:-translate-y-0.5\r
              active:translate-y-0\r
              active:scale-[0.98]\r
              transition-all duration-200\r
              disabled:opacity-60 disabled:hover:shadow-none disabled:hover:-translate-y-0 disabled:active:scale-100\r
              cursor-pointer\r
            `,children:s?e.jsxs("span",{className:"flex items-center gap-2",children:[e.jsxs("svg",{className:"animate-spin -ml-1 mr-2 h-4 w-4 text-white",xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",children:[e.jsx("circle",{className:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"4"}),e.jsx("path",{className:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"})]}),c.textoCargando]}):c.texto}),d&&e.jsxs("div",{className:"flex justify-center gap-1.5 text-gray-400 text-xs mt-6 font-medium",children:[d.pregunta,e.jsx(x,{to:d.enlace.to,className:"text-[var(--primary-light)] hover:text-white transition-colors font-semibold",children:d.enlace.texto})]})]})]})]})},L=()=>{const o=j(),a=p(t=>t.agregarAlerta);return E({mutationFn:w,onSuccess:t=>{N.getState().setAuth({token:t.token,usuario:t.usuario}),o.invalidateQueries(),a({type:"success",message:"Sesión iniciada correctamente"})},onError:t=>{a({type:"error",message:t?.response?.data?.message||"Error al iniciar sesión. Verifique sus credenciales."})}})},q=()=>{const o=C(),{mutate:a,isPending:t,error:m}=L(),{agregarAlerta:s}=p(),l=n=>{a({email:n.email,contrasena:n.contrasena},{onSuccess:()=>{s({type:"exito",message:"Sesión iniciada correctamente"}),o("/panel")},onError:c=>{s({type:"error",message:c?.response?.data?.message||"Correo o contraseña incorrectos"})}})};return e.jsx(_,{titulo:"Iniciar Sesión",descripcion:"Accedé al sistema de gestión",campos:[{name:"email",label:"Email",type:"text",placeholder:"ejemplo@gmail.com"},{name:"contrasena",label:"Contraseña",type:"password",placeholder:"**********",enlace:{to:"/recuperar-contrasena",texto:"¿Olvidaste tu contraseña?"}}],onSubmit:l,cargando:t,errores:m?{contrasena:"Credenciales inválidas"}:{},boton:{texto:"Iniciar Sesión",textoCargando:"Iniciando..."}})};export{q as default};
