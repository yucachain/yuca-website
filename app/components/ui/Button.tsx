interface Props {
  children: React.ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
}

export default function Button({ children, type = "button", disabled }: Props) {
  return (
    <button
      type={type}
      disabled={disabled}
      className="w-full max-w-[220px] md:max-w-[320px] mx-auto flex items-center justify-center
      bg-[#215243] text-white py-4 rounded-xl text-lg font-semibold
      hover:bg-[#1a4336] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg
      disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}
