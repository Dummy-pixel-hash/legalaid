# LegalAId — Mock Data

> Status: MVP baseline · Owner: product/engineering · Last updated: initial
> This document defines the demo case content that seeds `lib/mock/demo-cases.ts`.
> Full English content is written here for legal review; each case ships in **both** English and Hindi in code (`case.en`, `case.hi`).

## 0. What the mock data is (and isn't)

- The mock **AI provider** returns structured `CaseAnalysis` objects built from per-domain *templates* merged with the user's own intake facts (amounts, dates, names, state). It is not a chatbot; it is a deterministic, parameterized generator.
- Three canonical demo cases (below) exist for instant walkthroughs at `/case/demo-consumer`, `/case/demo-labour`, `/case/demo-tenant`, and as clickable examples from the home page and intake (`?demo=`).
- A **generic fallback** exists when no domain is detected: general guidance clearly labeled as AI interpretation, plus a manual domain picker — never a confident guess.

## 1. Verification policy (applies to every citation below)

- ✅ **verified** — real Act/Code + section, from `lib/legal/sources.ts` (see ARCHITECTURE §7 for the full verified list).
- 🟣 **demo** — placeholder/uncertain (state-specific or advisory); rendered with the "Demo — verify with an expert" tag; never asserted as law.
- All content is general legal information with the disclaimer; laws change and state rules vary.

---

## 2. Demo case: Consumer — Sunita (₹18,500 refrigerator)

**Id:** `demo-consumer` · **Domain:** consumer · **Language(s):** en, hi

### Intake (prefilled)
> "I bought a refrigerator online from a big marketplace for ₹18,500 in June last year. It has a 1-year warranty. The compressor stopped working twice — the second time it was completely spoiled and it ruined my stored food. The seller says the brand must handle it, and the brand says my warranty is over because they count from the manufacturing date. Nobody will repair or replace it."

**Structured facts:** amount ₹18,500 · purchase online (marketplace) · 11 months since purchase · warranty card 1 year · defect: compressor ×2 · parties: online seller + brand · state: Rajasthan (Jaipur).

### Possible issues (each labeled)
1. **Defective product within warranty, refusal to repair/replace** — POSSIBLE LEGAL ISSUE. Seller and manufacturer are jointly liable under consumer law; warranty counts from date of delivery, not manufacture (AI interpretation of common Commission practice — labeled as such).
2. **Unfair trade practice — misleading warranty terms** — POSSIBLE LEGAL ISSUE. A warranty period computed from manufacturing date may mislead.
3. **Loss of stored food** — POSSIBLE ISSUE (amount likely small; may be claimed as consequential loss — AI interpretation, uncertain).

### Possible rights
1. Right to have the defect repaired, or the product replaced, or a refund (depending on severity) — linked to CPA 2019 §§39 reliefs.
2. Right to a complaint before the District Consumer Commission (claims up to ₹50 lakh) — CPA 2019 §35.
3. Right against misleading warranty terms — CPA 2019 §2(42) unfair trade practice.

### Applicable law (cards)

| Law | Section | Title | Verdict |
|---|---|---|---|
| Consumer Protection Act, 2019 | §2(7) | Definition of "consumer" | ✅ verified |
| Consumer Protection Act, 2019 | §2(10) | Definition of "defect" | ✅ verified |
| Consumer Protection Act, 2019 | §2(42) | Unfair trade practice | ✅ verified |
| Consumer Protection Act, 2019 | §35 | Complaint to District Commission | ✅ verified |
| Consumer Protection Act, 2019 | §39 | Reliefs the Commission may order | ✅ verified |
| Consumer Protection (E-Commerce) Rules, 2020 | Rule 6 | Duties of sellers on marketplace | ✅ verified *(note: as amended; verify current text)* |
| Consumer Protection Act, 2019 | §72 | Penalty for false/misleading ads | ✅ verified *(note: liability path if ads misrepresented)* |

Each card carries plainExplanation + whyApplies (e.g., §35: "You can file a complaint where you live or where the seller is, without a lawyer, with a small fee").

### Uncertainty (honest)
- Whether the marketplace is liable as an intermediary vs. the seller — depends on the marketplace model and the contract terms.
- Whether food-spoilage loss is recoverable in this forum — not guaranteed.
- Warranty interpretation disputes are decided per facts; a Commission may or may not agree.

### Evidence checklist (ordered)
1. Order invoice/receipt (have) — proves purchase date, price, seller
2. Warranty card / policy terms (need to find)
3. Service visit reports or technician notes (have)
4. Written/chat complaints to seller & brand with dates (have)
5. Photos/videos of the defect (need to find)
6. Bank/UPI statement showing the ₹18,500 payment (have)

### Next steps
1. **Gather the invoice and service reports** — quick — *first, because they prove purchase and defect.*
2. **Write one demand** to seller + brand (email + written) giving 15 days — quick — *a written demand often resolves it and creates a record.*
3. **Register a complaint with the National Consumer Helpline (1915)** — quick — *free first step; companies often respond to NCH complaints.*
4. **If unresolved, file a complaint with the District Consumer Commission (Jaipur)** — moderate — *small fee, no lawyer needed for filing.*
5. **Contact the State Legal Services Authority if help is needed** — moderate.

### Document
**Type:** legal notice · **Title:** "LEGAL NOTICE FOR DEFECTIVE REFRIGERATOR — REPLACEMENT/REFUND" · From: Sunita (name/address) · To: Seller + Manufacturer · Subject: Refund/replacement of defective refrigerator within warranty · Sections: facts; defect; attempts to resolve; legal references (CPA 2019 §2(7), §2(42), §39; E-Commerce Rules Rule 6); demand (replacement or refund of ₹18,500 within 15 days); consequence if ignored (consumer complaint) · Signature block. Footer: disclaimer.

---

## 3. Demo case: Labour — Ravi (₹48,000 unpaid wages)

**Id:** `demo-labour` · **Domain:** labour · **Language(s):** en, hi

### Intake (prefilled)
> "I work as a warehouse loader in Faridabad for ₹16,000 a month. My employer has not paid my salary for the last 3 months — about ₹48,000. When I asked, they said business is slow. Now they are pressuring me to 'resign voluntarily'. I have no appointment letter. I have my ID card, attendance records on WhatsApp, and my old salary slips."

**Structured facts:** amount ₹48,000 (3 months × ₹16,000) · role: warehouse loader · location: Faridabad, Haryana · no written appointment letter · employer pressuring resignation · has ID card, WhatsApp attendance, old pay slips.

### Possible issues
1. **Non-payment of wages for 3 months** — POSSIBLE LEGAL ISSUE — the central issue.
2. **Pressure to resign to avoid paying dues** — POSSIBLE ISSUE — may amount to constructive termination (AI interpretation).
3. **No written appointment letter** — FACT (documentation gap) — weakens proof but does not remove wage rights.

### Possible rights
1. Right to full wages on time every month — Code on Wages §17 / Payment of Wages Act §5.
2. Right to payment not less than the minimum wage notified for the employment — Minimum Wages Act §12 (check Haryana notification).
3. Right to recover unpaid wages through the legal recovery process — ID Act §33C(2).
4. Right to statutory benefits if applicable (PF etc.) — EPF & MP Act §7A — *conditional on being covered*.

### Applicable law (cards)

| Law | Section | Title | Verdict |
|---|---|---|---|
| Code on Wages, 2019 | §17 | Time limit for payment of wages | ✅ verified *(note: consolidated law; state rules vary — Payment of Wages Act may still apply where not operationalized)* |
| Payment of Wages Act, 1936 | §5 | Time of payment of wages | ✅ verified *(note: applies where Code not yet operationalized)* |
| Minimum Wages Act, 1948 | §12 | Payment of minimum rates | ✅ verified *(note: check Haryana scheduled-employment notification)* |
| Industrial Disputes Act, 1947 | §33C(2) | Recovery of money due from employer | ✅ verified |
| Industrial Disputes Act, 1947 | §25F | Conditions for retrenchment | ✅ verified *(note: relevant only if terminated; 3 months' notice/pay + procedure required)* |
| EPF & MP Act, 1952 | §7A | Determination of dues from employer | ✅ verified *(conditional: if PF coverage applies)* |
| Payment of Gratuity Act, 1972 | §4 | Gratuity after 5 years' service | ✅ verified — **cited as NOT applicable** (3 years' service) to demonstrate honest negative reasoning |

### Uncertainty
- Whether wages are "below the threshold" where Payment of Wages Authority (fast, informal) applies vs. the ID Act recovery route — depends on wage amount and state rules.
- Whether his employment qualifies as "scheduled employment" under the Minimum Wages notification.
- Constructive termination is fact-heavy; outcome not guaranteed.

### Evidence checklist (ordered)
1. Bank statements showing salary credits (have) — *proves the employment and that payments stopped*
2. WhatsApp attendance/roster messages (have)
3. ID card / work badge (have)
4. Pay slips for the months paid (have)
5. Any letter/offer/appointment paper (need to find)
6. Photos of work location + colleagues' contact (need to find)
7. Written demand + employer's replies (to create)

### Next steps
1. **Preserve everything now** — screenshots of WhatsApp, bank statements — quick · urgent.
2. **Send a written demand** (email + WhatsApp + signed letter) for the ₹48,000, keep copies — quick · urgent — *creates a record and often unlocks payment.*
3. **Report to the Labour Commissioner / Labour-cum-Conciliation Officer (Haryana)** — moderate — *free conciliation; employers usually respond.*
4. **If unpaid wages fall under the Payment of Wages Act route, file a claim with the Payment of Wages Authority** — moderate — *faster, informal.*
5. **If terminated improperly, challenge retrenchment (ID Act §25F)** — long — *only if dismissed without procedure.*
6. **Contact State Legal Services Authority (helpline 15100)** — moderate.

### Document
**Type:** legal notice · **Title:** "LEGAL NOTICE FOR PAYMENT OF UNPAID WAGES" · From: Ravi · To: Employer (name/address) · Subject: Demand for ₹48,000 unpaid wages · Sections: employment facts; wage history; non-payment; pressure to resign; legal references (Code on Wages §17; Payment of Wages Act §5; ID Act §33C(2); Minimum Wages Act §12); demand (full payment within 15 days); consequence (claim before the Labour Commissioner / Payment of Wages Authority) · Signature block. Footer: disclaimer.

---

## 4. Demo case: Tenant — Imran (₹30,000 deposit)

**Id:** `demo-tenant` · **Domain:** tenant · **Language(s):** en, hi

### Intake (prefilled)
> "I rented a flat in Bengaluru for ₹15,000 a month and paid a ₹30,000 security deposit. I stayed 14 months and moved out after giving notice. The flat was in the same condition — I have photos. My landlord refuses to return my deposit, saying 'there were repairs'. There is no written agreement, but I have rent receipts and our WhatsApp messages about the deposit and the move-out."

**Structured facts:** deposit ₹30,000 (2 months' rent) · rent ₹15,000/month · duration 14 months · notice given · no written agreement · rent receipts + WhatsApp messages + move-out photos · state: Karnataka.

### Possible issues
1. **Security deposit withheld without itemized claim** — POSSIBLE LEGAL ISSUE — the central issue.
2. **No written agreement** — FACT (documentation gap) — does not remove rights; reduces proof.
3. **"There were repairs" with no proof/invoice** — POSSIBLE ISSUE — deductions generally need itemized, genuine claims.

### Possible rights
1. Right to refund of the deposit on termination of tenancy (minus genuine, itemized deductions) — TPA §108 (duties on termination) / Contract Act §73 — AI interpretation of how commissions apply it.
2. Right to a proper termination of the tenancy per the lease terms — TPA §106.
3. Possible consumer-forum route for deficiency in service — **AI INTERPRETATION, uncertain** (forums differ on whether landlord-tenant deposit claims are "services").

### Applicable law (cards)

| Law | Section | Title | Verdict |
|---|---|---|---|
| Transfer of Property Act, 1882 | §105 | Definition of lease | ✅ verified |
| Transfer of Property Act, 1882 | §106 | Duration / termination of leases | ✅ verified |
| Transfer of Property Act, 1882 | §108 | Rights & liabilities of lessor/lessee | ✅ verified |
| Transfer of Property Act, 1882 | §111 | Determination of lease | ✅ verified |
| Indian Contract Act, 1872 | §73 | Compensation for loss from breach | ✅ verified *(note: relevant if landlord's withholding is a breach)* |
| Model Tenancy Act, 2021 | deposit-refund provisions | Security deposit refund (advisory) | 🟣 **demo** *(note: model law — not binding unless your state adopts it)* |
| Karnataka Rent Act / your state's rent act | — | State tenancy protections | 🟣 **demo** *(note: check with State Legal Services Authority)* |

### Uncertainty
- Whether a consumer forum will accept a deposit-refund claim against a landlord — **not settled across states** (AI interpretation).
- Whether the landlord can substantiate "repairs" — evidence-dependent.
- Applicable state law depends on the property's location and rent amount.

### Evidence checklist (ordered)
1. Rent receipts for all months (have) — *proves the tenancy and the deposit*
2. WhatsApp messages re deposit + move-out (have)
3. Bank/UPI transfers of the deposit (have)
4. Move-out photos showing flat condition (have)
5. Any written agreement (need to find)
6. Copies of any notices received (need to find)
7. Neighbour/colleague contact for corroboration (need to find)

### Next steps
1. **Write a dated written demand** (email + WhatsApp) demanding the refund with a 15-day deadline — quick · urgent — *a clean demand usually resolves deposit disputes and creates the record.*
2. **Ask for an itemized list of deductions** with invoices; dispute anything unsubstantiated — quick.
3. **If ignored, send a formal legal notice** (use the document builder) — moderate.
4. **Consider the consumer forum route** — long — *note: outcomes vary by state; ask legal aid first.*
5. **Contact the State Legal Services Authority (helpline 15100)** — moderate.

### Document
**Type:** legal notice · **Title:** "LEGAL NOTICE FOR REFUND OF SECURITY DEPOSIT" · From: Imran · To: Landlord · Subject: Refund of ₹30,000 security deposit · Sections: tenancy facts; deposit payment; move-out with notice; no itemized deductions; legal references (TPA §§105, 106, 108, 111; Contract Act §73); demand (₹30,000 within 15 days + itemized accounting of any deductions); consequence (appropriate legal proceedings) · Signature block. Footer: disclaimer.

---

## 5. Generic fallback (domain not detected)

**Id:** generated · **Domain:** "other" · Behavior: provider returns a minimal analysis:
- caseSummary (restated facts, FACT)
- issues = [] with a notice: "We couldn't tell which area of law this belongs to."
- **AI interpretation:** "This could relate to consumer, labour, or tenancy law — which one sounds closest?" with a `DomainPicker`.
- laws = [] (no invented citations), evidence = generic list, nextSteps = generic preservation + legal aid contact.
- document = none; user must pick a domain to generate one.

This path is deliberate: **no confident guess, no invented law.** It converts ambiguity into one clear question.

## 6. Data structure note

Each demo case in code is:

```ts
interface DemoCase {
  id: string; domain: Domain;
  intake: { description: string; domain: Domain; amount?: number; state?: string; otherParty?: string; dates?: ...; evidenceOnHand?: string[] };
  analysis: { en: CaseAnalysis; hi: CaseAnalysis };  // identical structure, full translations
}
```

The provider templates reuse the same shape for user-entered intakes, substituting the user's facts into summaries, why-applies text, evidence, and the document. Verified source references always resolve by id through `lib/legal/sources.ts`.
