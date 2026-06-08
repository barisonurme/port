import * as React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlideButtonProps extends React.ComponentProps<'button'> {
  icon?: React.ReactNode;
}

function SlideButton({ children, icon, className, ...props }: SlideButtonProps) {
  return (
    <button
      className={cn(
        'group relative flex items-center gap-3 overflow-hidden border border-white/20 hover:border-white/50 px-8 py-4 text-sm uppercase tracking-widest text-white/50 hover:text-zinc-950 transition-colors duration-500 cursor-pointer',
        className
      )}
      {...props}
    >
      <span className="absolute inset-0 bg-white origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]" />
      <span className="relative z-10">{children}</span>
      {icon ?? <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
        <ArrowUpRight size={15} />
      </span>
      }
    </button>
  );
}

export { SlideButton };
