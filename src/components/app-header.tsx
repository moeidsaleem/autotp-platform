'use client'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, ChevronRight } from 'lucide-react'
import { ThemeSelect } from '@/components/theme-select'
import { ClusterUiSelect } from './cluster/cluster-ui'
import { WalletButton } from '@/components/solana/solana-provider'
import { Logo } from '@/components/Logo'

export function AppHeader({ 
  links = [] 
}: { 
  links: { label: string; path: string; icon?: React.ReactNode }[] 
}) {
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll events to change header appearance when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function isActive(path: string) {
    return path === '/' ? pathname === '/' : pathname.startsWith(path)
  }

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 transition-all duration-300 ${
        scrolled 
          ? 'bg-black/80 backdrop-blur-lg shadow-md' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto flex justify-between items-center py-2">
        <div className="flex items-center gap-8">
          <Logo />
          
          <div className="hidden md:flex items-center">
            <ul className="flex gap-6 flex-nowrap items-center">
              {links.map(({ label, path, icon }) => (
                <li key={path}>
                  <Link
                    className={`relative flex items-center gap-1.5 px-2 py-1 text-sm font-medium transition-all duration-200
                      ${isActive(path) 
                        ? 'text-white' 
                        : 'text-neutral-400 hover:text-white'
                      }
                    `}
                    href={path}
                  >
                    {icon && <span className="opacity-80">{icon}</span>}
                    {label}
                    {isActive(path) && (
                      <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden text-white hover:bg-white/10" 
          onClick={() => setShowMenu(!showMenu)}
        >
          {showMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        <div className="hidden md:flex items-center gap-4">
          <WalletButton />
          <ClusterUiSelect />
          <ThemeSelect />
        </div>

        {showMenu && (
          <div className="md:hidden fixed inset-x-0 top-[56px] bottom-0 bg-black/95 backdrop-blur-md z-50 animate-in fade-in slide-in-from-top">
            <div className="flex flex-col p-6 gap-4">
              <ul className="flex flex-col gap-3 mb-6">
                {links.map(({ label, path, icon }) => (
                  <li key={path}>
                    <Link
                      className={`flex items-center justify-between px-2 py-3 rounded-md ${
                        isActive(path) 
                          ? 'bg-white/10 text-white font-medium' 
                          : 'text-neutral-400 hover:text-white hover:bg-white/5'
                      }`}
                      href={path}
                      onClick={() => setShowMenu(false)}
                    >
                      <span className="flex items-center gap-2">
                        {icon && <span>{icon}</span>}
                        {label}
                      </span>
                      <ChevronRight className="h-4 w-4 opacity-60" />
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex justify-center">
                  <WalletButton />
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  <ClusterUiSelect />
                  <ThemeSelect />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
