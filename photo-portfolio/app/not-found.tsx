import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="max-w-[640px] mx-auto px-6 pt-32 md:pt-40 pb-24 text-center">
      <p className="meta-caps text-ink-muted">404</p>
      <h1 className="font-serif text-5xl md:text-6xl mt-5 tracking-wide">Nothing here.</h1>
      <p className="mt-8 text-[15px] leading-[1.75] text-ink/80">
        That page does not exist. Try the{' '}
        <Link href="/" className="underline underline-offset-4 hover:text-ink">
          work
        </Link>
        .
      </p>
    </section>
  );
}
