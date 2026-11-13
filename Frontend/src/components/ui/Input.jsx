
import { forwardRef } from 'react'

const Input = forwardRef(function Input({
  label,
  icon: Icon,
  error,
  className = '',
  ...props
}, ref) {
  return (
    <div className="w-full space-y-2">
      <label className="text-xs font-black uppercase tracking-widest">
        {label}
      </label>

      <div className={`
        flex items-center gap-3 border-2 border-black
        bg-white px-4 transition-colors
        focus-within:bg-[#FFFCEB]
        ${error ? 'border-[#FF8066]' : ''}
        ${className}
      `}>
        {Icon && <Icon size={19} className="shrink-0" />}

        <input
          ref={ref}
          className="w-full bg-transparent py-3.5 text-sm font-medium
          outline-none placeholder:text-neutral-400"
          {...props}
        />
      </div>

      {error && (
        <p className="text-xs font-bold text-[#D94C35]">{error}</p>
      )}
    </div>
  )
})

export default Input
