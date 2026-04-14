import GeneratorClient from "./components/GeneratorClient";
import { INDUSTRIES } from "@/lib/taxonomy/industries";
import { USE_CASES } from "@/lib/taxonomy/useCases";

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <GeneratorClient industries={[...INDUSTRIES]} useCases={[...USE_CASES]} />
    </main>
  );
}
