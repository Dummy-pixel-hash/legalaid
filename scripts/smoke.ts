/**
 * Smoke test for the analysis pipeline (run: pnpm tsx scripts/smoke.ts)
 * Exercises the mock provider for all domains in both languages and
 * asserts the structured contract + the strict verification rule.
 */

import { MockLegalAnalysisProvider } from "../src/lib/providers/mock-provider";
import { getProvider } from "../src/lib/providers";
import {
  LocalLegalSourceProvider,
  getLegalSourceProvider,
} from "../src/lib/providers/legal-source";
import { DEMO_CASES } from "../src/lib/mock/demo-cases";
import { LEGAL_SOURCES } from "../src/lib/legal/sources";

let failures = 0;
function check(cond: boolean, label: string) {
  if (!cond) {
    failures++;
    console.error(`  ✗ ${label}`);
  } else {
    console.log(`  ✓ ${label}`);
  }
}

async function main() {
  const provider = new MockLegalAnalysisProvider();

  // 1. Registry integrity
  console.log("Registry integrity:");
  const ids = new Set(LEGAL_SOURCES.map((s) => s.id));
  check(ids.size === LEGAL_SOURCES.length, "source ids unique");
  for (const s of LEGAL_SOURCES) {
    check(
      typeof s.title.en === "string" && typeof s.title.hi === "string" && s.title.hi.length > 0,
      `bilingual title: ${s.id}`,
    );
    check(
      typeof s.plain.en === "string" && s.plain.hi.length > 0,
      `bilingual plain explanation: ${s.id}`,
    );
    check(
      Boolean(s.source.name) && Boolean(s.source.ref),
      `source has name+ref: ${s.id}`,
    );
  }

  // 2. Demo cases — all domains, both languages, full contract
  console.log("\nDemo case analyses:");
  for (const [id, demo] of Object.entries(DEMO_CASES)) {
    for (const lang of ["en", "hi"] as const) {
      const a = demo.analysis(lang);
      check(a.id === id, `${id} [${lang}] id`);
      check(a.language === lang, `${id} [${lang}] language`);
      check(a.caseSummary.length > 20, `${id} [${lang}] summary`);
      check(a.issues.length > 0, `${id} [${lang}] issues`);
      check(a.rights.length > 0, `${id} [${lang}] rights`);
      check(a.laws.length > 0, `${id} [${lang}] laws`);
      check(a.evidence.length > 0, `${id} [${lang}] evidence`);
      check(a.nextSteps.length > 0, `${id} [${lang}] next steps`);
      check(a.document.title.length > 0 && a.document.sections.length > 0, `${id} [${lang}] document`);
      check(a.disclaimer.includes("15100") || a.disclaimer.includes("विधिक"), `${id} [${lang}] disclaimer`);
      check(a.uncertainty.length > 0, `${id} [${lang}] uncertainty`);
      // Verification rule: every cited law resolves to the registry
      for (const l of a.laws) {
        const src = LEGAL_SOURCES.find((s) => s.id === l.id);
        check(Boolean(src), `${id} [${lang}] law ${l.id} in registry`);
      }
    }
  }

  // 3. Provider flow with user intake (fact injection + detection)
  console.log("\nProvider flow:");
  const intake = {
    description:
      "Mere makaan malik ne meri ₹30,000 ki security deposit nahi lautayi jabki maine flat khaali kar diya",
    amount: 30000,
    state: "Bengaluru",
  };
  const detected = provider.detectDomain(intake.description);
  check(detected === "tenant", `detects tenant from Hindi-mixed text (got ${detected})`);

  const stages: string[] = [];
  const analysis = await provider.analyze(
    { ...intake, domain: detected },
    "hi",
    (p) => stages.push(p.stage),
  );
  check(analysis.domain === "tenant", "analysis domain tenant");
  check(analysis.facts.some((f) => f.includes("₹30,000")), "amount injected into facts");
  check(stages.length === 7, `all 7 progress stages emitted (got ${stages.length})`);
  check(analysis.document.sections.length >= 4, "document has structured sections");

  // 4. Legal-source provider abstraction (spec §13)
  console.log("\nLegal-source provider:");
  const legal = new LocalLegalSourceProvider();
  const known = await legal.getSource("cpa-2019-s2-7");
  check(known !== null && Boolean(known?.section), "getSource resolves known id");
  check(known?.section === "§2(7)", "resolved source has a section");
  check((await legal.getSource("no-such-id")) === null, "unknown id → null");
  const viaSection = await legal.getSection("cpa-2019-s2-7");
  check(
    viaSection !== null && viaSection.id === known?.id,
    "getSection returns the same record for a known id",
  );
  check((await legal.search({ text: "consumer" })).length >= 1, 'search("consumer") ≥ 1');
  check((await legal.search({ text: "" })).length === 0, 'search("") = 0');
  check((await legal.search({ text: "no-such-word-xyz" })).length === 0, "unknown search = 0");
  check(
    getLegalSourceProvider() === getLegalSourceProvider(),
    "getLegalSourceProvider is a memoized singleton",
  );

  // 5. Provider flag — development stand-in is honest about it
  console.log("\nProvider flag:");
  check(getProvider().isDevelopment === true, "active provider reports isDevelopment");

  // 6. Document generation through the provider seam (regenerates per language, honors edits)
  console.log("\nDocument generation:");
  const genDoc = await provider.generateDocument({ analysis, intake, lang: "hi" });
  check(genDoc.language === "hi", "regenerates document for requested language");
  check(genDoc.sections.length >= 4, "regenerated document has sections");
  check(Boolean(genDoc.title) && Boolean(genDoc.subject), "regenerated document has title + subject");
  const edited = await provider.generateDocument({
    analysis,
    intake,
    lang: "en",
    edits: { toParty: "Acme Corp" },
  });
  check(edited.toParty === "Acme Corp", "user edits applied on top of generated draft");
  check(edited.language === "en", "english regeneration");

  // 7. Unknown domain → generic fallback, no invented laws
  console.log("\nGeneric fallback:");
  const unknown = await provider.analyze(
    { description: "meri gaadi kharaab ho gayi aur koi madad nahi kar raha" },
    "en",
  );
  check(unknown.domain === "other", "domain = other");
  check(unknown.laws.length === 0, "no invented laws in fallback");
  check(unknown.issues.some((i) => i.kind === "ai-interpretation"), "fallback issue labeled AI interpretation");

  console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
