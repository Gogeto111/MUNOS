import type { Metadata } from "next";
import { Container } from "@/components/shared/container";

export const metadata: Metadata = {
  title: "Privacy Policy | MUNOS",
  description: "How MUNOS collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <Container className="max-w-3xl py-24">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: August 2026</p>

      <div className="prose prose-neutral dark:prose-invert mt-8 space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold">1. What We Collect</h2>
          <p className="mt-2 text-muted-foreground">
            MUNOS collects only what&apos;s necessary to provide the service:
          </p>
          <ul className="mt-2 list-disc pl-5 text-muted-foreground">
            <li><strong>Account data:</strong> Name, email, and school (via Clerk authentication)</li>
            <li><strong>MUN profile:</strong> Awards, certificates, committees, countries — entered by you</li>
            <li><strong>Usage data:</strong> Pages visited, features used (anonymous analytics)</li>
            <li><strong>AI interactions:</strong> Messages sent to AI assistants (stored to improve your experience)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. What We Don&apos;t Collect</h2>
          <ul className="mt-2 list-disc pl-5 text-muted-foreground">
            <li>We never sell your data to third parties</li>
            <li>We don&apos;t run targeted advertising</li>
            <li>We don&apos;t track you across the web</li>
            <li>We don&apos;t collect payment information (the service is free)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. How We Use AI</h2>
          <p className="mt-2 text-muted-foreground">
            MUNOS uses AI (Google Gemini, OpenAI, Anthropic) to power research, speech generation, and coaching features. Your prompts and responses may be processed by these providers. We use API keys you provide — your data is subject to the AI provider&apos;s privacy policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Data Storage</h2>
          <p className="mt-2 text-muted-foreground">
            Your data is stored in a PostgreSQL database hosted by Supabase (AWS regions). Files (certificates, brochures) are stored in Supabase Storage with signed URLs. We use industry-standard encryption at rest and in transit.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Your Rights</h2>
          <ul className="mt-2 list-disc pl-5 text-muted-foreground">
            <li><strong>Access:</strong> You can view all your data in your profile and settings</li>
            <li><strong>Delete:</strong> You can delete your account and all data at any time</li>
            <li><strong>Export:</strong> You can export your portfolio as PDF</li>
            <li><strong>Privacy:</strong> You control what&apos;s public via privacy settings</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Cookies</h2>
          <p className="mt-2 text-muted-foreground">
            MUNOS uses essential cookies for authentication (Clerk) and theme preferences. We don&apos;t use advertising cookies or third-party trackers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. Children&apos;s Privacy</h2>
          <p className="mt-2 text-muted-foreground">
            MUNOS is designed for delegates aged 13+. We don&apos;t knowingly collect data from children under 13. If you&apos;re under 13, please don&apos;t use MUNOS.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">8. Changes</h2>
          <p className="mt-2 text-muted-foreground">
            We may update this policy. We&apos;ll notify you of significant changes via email or in-app notification.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">9. Contact</h2>
          <p className="mt-2 text-muted-foreground">
            Questions? Contact us at{" "}
            <a href="mailto:privacy@munos.app" className="text-brand-500 hover:underline">
              privacy@munos.app
            </a>
          </p>
        </section>
      </div>
    </Container>
  );
}
