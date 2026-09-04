import { Hero } from '@/components/Hero';
import { Marquee } from '@/components/Marquee';
import { HowItWorks } from '@/components/HowItWorks';
import { MenuSection } from '@/components/MenuSection';
import { PartnersSection } from '@/components/PartnersSection';
import { ActivitiesSection } from '@/components/ActivitiesSection';
import { JobsSection } from '@/components/JobsSection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <HowItWorks />
      <MenuSection />
      <PartnersSection />
      <ActivitiesSection />
      <JobsSection />
    </>
  );
}
