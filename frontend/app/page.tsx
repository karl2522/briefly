import { Header } from "@/components/landingpage/header"
import { HeroSection } from "@/components/landingpage/hero-section"
import { FeaturesSection } from "@/components/landingpage/features-section"
import { ToolsSection } from "@/components/landingpage/tools-section"
import { HowItWorksSection } from "@/components/landingpage/how-it-works-section"
import { CTASection } from "@/components/landingpage/cta-section"
import { Footer } from "@/components/landingpage/footer"
import { ContactSection} from "@/components/landingpage/contact-section";

export default function HomePage() {
  return (
      <div className="min-h-screen bg-background">
        <Header />
          <main>
              <HeroSection />
              <FeaturesSection />
              <ToolsSection />
              <HowItWorksSection />
              <ContactSection />
              <CTASection />
          </main>
        <Footer />
      </div>
  )
}
