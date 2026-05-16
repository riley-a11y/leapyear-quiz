import Link from 'next/link';

const links = [
  { href: '/', label: 'Work' },
  { href: '/roll', label: 'Roll' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-paper/85 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 md:px-10 h-14">
        <Link href="/" className="font-serif text-xl tracking-wide text-ink">
          RS
        </Link>
        <nav className="flex items-center gap-6 md:gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[13px] text-ink/70 hover:text-ink transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
