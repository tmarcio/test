const items = [
  'Refeições caseiras',
  'Pizzas artesanais',
  'Bebidas frescas',
  'Entrega por motorizada',
  'Taxas por município',
  'Rastreio por referência',
  'Programa ALIADO+',
  'Pagamento na entrega',
];

export function Marquee({ dark = false }: { dark?: boolean }) {
  const row = items.map((t, i) => (
    <span key={`${t}-${i}`} className="inline-flex items-center gap-6 px-6 whitespace-nowrap font-display font-black uppercase tracking-widest text-lg">
      {t}
      <span className="text-2xl">✦</span>
    </span>
  ));
  return (
    <div className={`overflow-hidden py-4 border-y ${dark ? 'bg-brand-red text-white border-brand-redDark' : 'bg-brand-gold text-brand-dark border-brand-goldDark'}`}>
      <div className="flex w-max animate-marquee mask-fade-x">{row}{row}</div>
    </div>
  );
}
