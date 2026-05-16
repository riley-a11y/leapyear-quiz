export const metadata = {
  title: 'About · Riley Simpson',
};

export default function AboutPage() {
  return (
    <section className="max-w-[640px] mx-auto px-6 pt-32 md:pt-40 pb-24">
      <p className="meta-caps text-ink-muted">About</p>
      <h1 className="font-serif text-5xl md:text-6xl mt-5 tracking-wide">Riley Simpson</h1>
      <p className="mt-8 text-[15px] leading-[1.75] text-ink/80">
        Photographer working in long-form essays. Based wherever the light is. This is a
        placeholder bio. Replace it with something honest.
      </p>
    </section>
  );
}
