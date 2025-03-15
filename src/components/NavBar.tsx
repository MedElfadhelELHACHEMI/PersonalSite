'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function NavBar() {
  const pathname = usePathname()

  // Navigation items with their paths
  const navItems = [
    { name: 'About', path: '/' },
    { name: 'Projects', path: '/projects' },
    { name: 'Experience', path: '/experience' },
  ]

  return (
    <NavigationMenu className="navbar mr-9 mt-4 bg-transparent">
      <NavigationMenuList className="gap-3">
        {navItems.map((item) => (
          <NavigationMenuItem key={item.path} className="bg-transparent">
            <Link href={item.path} legacyBehavior passHref>
              <NavigationMenuLink
                className={cn(
                  navigationMenuTriggerStyle(),
                  'bg-transparent text-white transition-all duration-200',
                  pathname === item.path && 'font-bold underline'
                )}
              >
                {item.name}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        ))}
        <NavigationMenuItem>
          <Button 
            variant="default" 
            asChild
          >
            <a 
              href="../../public/RESUME_MOHAMED_HACHEMI.pdf"
              target="_blank" 
              rel="noopener noreferrer"
              download
            >
              Resume
            </a>
          </Button>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
