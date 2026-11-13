
import { LoaderCircle } from 'lucide-react'

export default function Button({
  children,
  loading = false,
  type = 'button',
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={loading || props.disabled}
      className={`
        flex w-full items-center justify-center gap-2
        border-2 border-black bg-[#F9E547]
        px-5 py-3.5 font-black text-black
        shadow-[5px_5px_0px_#171717]
        transition-all duration-150
        hover:translate-x-1 hover:translate-y-1
        hover:shadow-[2px_2px_0px_#171717]
        active:translate-x-1 active:translate-y-1
        active:shadow-none
        disabled:cursor-not-allowed disabled:opacity-60
        ${className}
      `}
      {...props}
    >
      {loading && <LoaderCircle size={18} className="animate-spin" />}
      {children}
    </button>
  )
}
