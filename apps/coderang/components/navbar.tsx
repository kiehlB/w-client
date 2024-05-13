'use client';

import {
  Menu,
  MenuButton,
  MenuItems,
  MenuLink,
  MenuPopover,
  useMenuButtonContext,
} from '@reach/menu-button';
import { clsx } from 'clsx';
import { AnimatePresence, motion, useAnimation, useReducedMotion } from 'framer-motion';
import * as React from 'react';
import { useEffect } from 'react';
import Link from 'next/link.js';
import { usePathname } from 'next/navigation';

const LINKS = [
  { name: 'Blog', to: '/blog' },
  { name: 'Courses', to: '/courses' },
  { name: 'Discord', to: '/discord' },
  { name: 'Chats', to: '/chats/05' },
  { name: 'Calls', to: '/calls/04' },
  { name: 'Workshops', to: '/workshops' },
  { name: 'About', to: '/about' },
];

function NavLink({
  href,
  ...rest
}: Omit<Parameters<typeof Link>['0'], 'href'> & { href: string }) {
  const pathname = usePathname();
  const isSelected = href === pathname || pathname.startsWith(`${href}/`);

  return (
    <li className="px-5 py-2">
      <Link
        href="/"
        className={clsx(
          'underlined hover:text-team-current focus:text-team-current block whitespace-nowrap text-lg font-medium focus:outline-none',
          {
            'active text-team-current': isSelected,
            'text-secondary': !isSelected,
          },
        )}
        {...rest}
      />
    </li>
  );
}

function Navbar() {
  return (
    <div className="px-5vw lg:py-12 py-9">
      <nav className="text-primary max-w-8xl mx-auto flex items-center justify-between">
        <div className="flex justify-center gap-4 align-middle">
          <Link
            href="/"
            className="text-primary underlined block whitespace-nowrap text-2xl font-medium transition focus:outline-none">
            <h1>Coderang</h1>
          </Link>
        </div>

        <ul className="lg:flex hidden">
          {LINKS.map(link => (
            <NavLink key={link.to} href={link.to}>
              {link.name}
            </NavLink>
          ))}
        </ul>

        <div className="flex items-center justify-center">
          <div className="lg:hidden block">
            <div>mobile</div>
          </div>
          <div className="noscript-hidden lg:block hidden">
            <div>dark</div>
          </div>
        </div>
      </nav>
    </div>
  );
}

export { Navbar };
