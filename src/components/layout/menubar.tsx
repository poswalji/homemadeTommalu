'use client';

import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenubarProps {
  title: string;
  onMenuToggle: () => void;
  isMenuOpen: boolean;
  className?: string;
}

export function Menubar({ title, onMenuToggle, isMenuOpen, className }: MenubarProps) {
  return (
    <header className={cn(
      "sticky top-0 z-40 w-full border-b bg-white shadow-sm",
      className
    )}>
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuToggle}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h1 className="text-lg font-semibold text-gray-900 md:text-xl">{title}</h1>
        </div>
      </div>
    </header>
  );
}

