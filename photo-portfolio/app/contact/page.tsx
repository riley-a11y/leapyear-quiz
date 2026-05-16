export const metadata = {
  title: 'Contact · Riley Simpson',
};

export default function ContactPage() {
  return (
    <section className="max-w-[640px] mx-auto px-6 pt-32 md:pt-40 pb-24">
      <p className="meta-caps text-ink-muted">Contact</p>
      <h1 className="font-serif text-5xl md:text-6xl mt-5 tracking-wide">Say hello.</h1>
      <p className="mt-8 text-[15px] leading-[1.75] text-ink/80">
        For commissions, prints, or just a note,{' '}
        <a href="mailto:hello@example.com" className="underline underline-offset-4 hover:text-ink">
          hello@example.com
        </a>
        .
      </p>
    </section>
  );
}
