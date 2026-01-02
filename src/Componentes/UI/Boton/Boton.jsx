const Boton = ({ bg, texto }) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md! font-medium hover:opacity-[.5]! disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:cursor-pointer  text-white! hover:bg-primaryemphasis h-8 px-6 py-1 ${bg}`}
    >
      {texto}
    </button>
  );
};

export default Boton;
