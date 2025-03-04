import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import Link from 'next/link'
import { twMerge } from 'tailwind-merge'
import { Button } from '@/components/ui/button'

export default function NavBar() {
  return (
    <NavigationMenu className="navbar mr-9 bg-transparent">
      <NavigationMenuList className="gap-3">
        <NavigationMenuItem className="bg-transparent">
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink
              className={twMerge(
                navigationMenuTriggerStyle(),
                'bg-transparent text-white',
              )}
            >
              About
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/projects" legacyBehavior passHref>
            <NavigationMenuLink
              className={twMerge(
                navigationMenuTriggerStyle(),
                'bg-transparent text-white',
              )}
            >
              Projects
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/experience" legacyBehavior passHref>
            <NavigationMenuLink
              className={twMerge(
                navigationMenuTriggerStyle(),
                'bg-transparent text-white',
              )}
            >
              Experience
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Button>Resume</Button>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
