import { CountryResearch } from "@/components/research/country-research";

export const metadata = {
  title: "Country Research | MUNOS",
};

export default function CountryResearchPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Country Research</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quick-reference country profiles for MUN preparation — facts, foreign policy, and key issues.
        </p>
      </div>
      <CountryResearch />
    </div>
  );
}
