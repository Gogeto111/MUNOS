import type { Metadata } from "next";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import { publicEnv } from "@/lib/public-env";
import { Hero } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/features";
import { ProductDemo } from "@/components/marketing/product-demo";
import { Roadmap } from "@/components/marketing/roadmap";
import { WhyMUNOS } from "@/components/marketing/why-munos";
import { Testimonials } from "@/components/marketing/testimonials";
import { Faq } from "@/components/marketing/faq";
import { FreeForever } from "@/components/marketing/free-forever";

export const metadata: Metadata = {
  title: `${APP_NAME} — AI-Powered MUN Operating System`,
  alternates: { canonical: "/" },
};

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: APP_NAME,
  description: APP_DESCRIPTION,
  applicationCategory: "EducationApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: publicEnv.NEXT_PUBLIC_APP_URL,
};

export default function MarketingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
      <Hero />
      <Features />
      <ProductDemo />
      <Testimonials />
      <WhyMUNOS />
      <Roadmap />
      <Faq />
      <FreeForever />
    </>
  );
}
