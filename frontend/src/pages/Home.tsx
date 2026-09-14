import HeroSection from "../sections/HeroSection";
import QuickAccess from "../sections/QuickAccess";
import FeaturedProducts from "../sections/FeaturedProducts";
import WhyChooseUs from "../sections/WhyChooseUs";
import HealthResources from "../sections/HealthResources";
import CTASection from "../sections/CTASection";

function Home() {
  return (
    <div>
      <HeroSection />
      <QuickAccess />
      <FeaturedProducts />
      <WhyChooseUs />
      <HealthResources />
      <CTASection />
    </div>
  );
}

export default Home;
