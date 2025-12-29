const InputReutilizable = ({ label, tipo }) => {
  return (
    <div>
      <label className="text-xs mb-2 block font-normal text-white text-[15px]">
        {label}
      </label>
      <input
        className="flex h-8 w-full rounded-md! px-3 py-4 text-sm border-[0.2px]! border-gray-200/10! text-[var(--primary)]! focus:border-[var()]"
        type={tipo}
      />
    </div>
  );
};

export default InputReutilizable;
