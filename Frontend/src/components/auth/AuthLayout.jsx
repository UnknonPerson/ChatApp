
import { MessageSquare, Zap, Star, ArrowUpRight } from 'lucide-react'

export default function AuthLayout({ children, mode }) {
  return (
    <main className="min-h-screen bg-[#F5F0E8] p-4 md:p-7">
      <div className="mx-auto flex min-h-[calc(100vh-56px)]
        max-w-[1440px] flex-col overflow-hidden border-2
        border-black bg-[#F5F0E8] shadow-[8px_8px_0px_#171717]
        lg:grid lg:grid-cols-2">

        {/* Brand panel */}
        <section className="relative flex min-h-[260px] flex-col
          justify-between overflow-hidden border-b-2 border-black
          bg-[#F9E547] p-7 md:p-10 lg:min-h-full lg:border-b-0
          lg:border-r-2">

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center
              border-2 border-black bg-black text-[#F9E547]">
              <MessageSquare size={23} />
            </div>
            <span className="text-2xl font-black tracking-tight">
              neo<span className="text-white">chat.</span>
            </span>
          </div>

          <div className="relative z-10 my-12 max-w-lg">
            <p className="mb-5 inline-flex items-center gap-2
              border-2 border-black bg-white px-3 py-2
              text-xs font-black uppercase tracking-wider">
              <Zap size={14} /> Communication, reimagined
            </p>

            <h1 className="text-5xl font-black leading-[0.95]
              tracking-[-0.06em] sm:text-7xl">
              TALK
              <br />
              LESS.
              <br />
              <span className="text-white"
                style={{ WebkitTextStroke: '2px #171717' }}>
                CONNECT
              </span>
              <br />
              MORE.
            </h1>

            <p className="mt-6 max-w-sm text-sm font-semibold
              leading-6 md:text-base">
              Your conversations deserve more than ordinary.
              Make every message count.
            </p>
          </div>

          <div className="relative z-10 flex items-center
            justify-between border-t-2 border-black pt-5">
            <p className="text-xs font-black uppercase tracking-wider">
              Built for real connections.
            </p>
            <Star size={25} fill="black" />
          </div>

          {/* Decorative shapes */}
          <div className="pointer-events-none absolute -right-16
            top-1/4 h-64 w-64 rotate-12 border-[3px] border-black
            bg-[#FF8066] shadow-[12px_12px_0px_#171717]" />

          <div className="pointer-events-none absolute right-12
            top-1/3 rotate-12 text-7xl font-black text-white">
            ✳
          </div>
        </section>

        {/* Form panel */}
        <section className="flex items-center justify-center
          bg-[#F5F0E8] px-6 py-12 md:px-12 lg:px-16">

          <div className="w-full max-w-[420px]">
            <div className="mb-9 flex justify-end">
              <span className="flex items-center gap-2 text-xs
                font-bold uppercase tracking-wider">
                {mode === 'login' ? 'New here?' : 'Already a member?'}
                <ArrowUpRight size={15} />
              </span>
            </div>

            {children}

            <p className="mt-10 text-center text-[10px]
              font-bold uppercase tracking-widest text-neutral-500">
              NeoChat © 2026 · Made for conversations
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
