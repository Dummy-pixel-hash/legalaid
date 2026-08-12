import { HeroIntake } from "@/components/home/HeroIntake";
import { DomainCards } from "@/components/home/DomainCards";
import { HowItWorks } from "@/components/home/HowItWorks";
import { TrustSection } from "@/components/home/TrustSection";

export default function HomePage() {
  return (
    <>
      <HeroIntake />
      <DomainCards />
      <HowItWorks />
      <TrustSection />
    </>
  );
}
