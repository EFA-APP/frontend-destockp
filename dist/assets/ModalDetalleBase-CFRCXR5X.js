import { r as s, j as e } from "./index-B40chGZJ.js";
import { r as a } from "./index-DUIPri7x.js";
const i = ({
  open: l,
  onClose: r,
  children: t,
  width: o = "max-w-[400px]",
}) => {
  if (
    (s.useEffect(
      () => (
        (document.body.style.overflow = l ? "hidden" : ""),
        () => (document.body.style.overflow = "")
      ),
      [l],
    ),
    !l)
  )
    return null;
  const d = e.jsxs("div", {
    className:
      "fixed inset-0 z-[99999999] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm",
    children: [
      e.jsx("div", {
        className: "absolute inset-0 h-screen cursor-default",
        onClick: r,
      }),
      e.jsxs("div", {
        className: `
          relative z-10 w-full ${o}
          max-h-[85vh] md:max-h-[90vh]
          bg-[var(--fill)] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-2xl
          overflow-hidden rounded-t-[32px] md:rounded-md
          border-t md:border border-black/10
          flex flex-col
        `,
        children: [
          e.jsx("div", {
            className:
              "flex md:hidden justify-center pt-4 pb-2 w-full absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-[var(--fill)] to-transparent",
            onClick: r,
            children: e.jsx("div", {
              className: "w-12 h-1.5 bg-black/20 rounded-full",
            }),
          }),
          e.jsx("div", {
            className:
              "flex-1 overflow-y-auto md:overflow-hidden custom-scrollbar flex flex-col pt-6 md:pt-0",
            children: t,
          }),
        ],
      }),
    ],
  });
  return a.createPortal(d, document.body);
};
export { i as M };
