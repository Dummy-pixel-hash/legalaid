/**
 * LegalAId — English UI dictionary.
 * The source of truth for TranslationKey. Every key must exist here.
 */
export const en = {
	// ── App identity ────────────────────────────────────────────────
	appName: "LegalAId",
	tagline: "Understand your rights. Know what to do next.",
	headerSub: "Your legal rights, in plain language",

	// ── Common ──────────────────────────────────────────────────────
	back: "Back",
	next: "Next",
	continue: "Continue",
	skip: "Skip",
	cancel: "Cancel",
	save: "Save",
	saved: "Saved",
	edit: "Edit",
	preview: "Preview",
	downloadPdf: "Download PDF",
	copyText: "Copy text",
	copied: "Copied",
	retry: "Try again",
	loading: "Working…",
	optional: "optional",
	close: "Close",
	newSituation: "New situation",
	legalInfo: "Legal info",
	showGeneralGuidance: "Show general guidance instead",
	notApplicable: "Not applicable here",

	// ── Home ────────────────────────────────────────────────────────
	homeHeroTitle: "Understand your rights. Know what to do next.",
	homeHeroSubtitle:
		"Describe what happened, in your own words. LegalAId explains the law that may apply, what evidence to keep, what to do next — and helps you write the document you need.",
	homeIntakePlaceholder:
		"e.g. My landlord hasn't returned my ₹30,000 security deposit even though I moved out and there was no damage.",
	understandMySituation: "Understand my situation",
	homeExamplesHeading: "Or start from an example",
	homeDomainsHeading: "Choose your area",
	homeDomainsHint: "These are the areas we cover today.",
	homeHowHeading: "How LegalAId works",
	homeHowHint: "One situation, one clear path from problem to document.",
	homeStep1Title: "Your situation",
	homeStep1Plain:
		"Describe what happened in plain words. No legal language needed.",
	homeStep2Title: "Analysis",
	homeStep2Plain:
		"Understand what may be happening, your rights, and the law that may apply.",
	homeStep3Title: "Evidence",
	homeStep3Plain: "See what proof to gather and keep — before it disappears.",
	homeStep4Title: "Next steps",
	homeStep4Plain: "Get a clear, honest action plan in the right order.",
	homeStep5Title: "Document",
	homeStep5Plain: "Edit and export a legal notice or complaint draft.",
	homeTrustHeading: "Legal information you can rely on",
	homeTrustHint:
		"LegalAId cites the specific law and section it refers to. Where the law is uncertain or varies by state, we say so — we never invent legal sections.",
	homeVerifiedNote: "Verified legal sources",
	homeVerifiedBody:
		"Every citation is a real Act/Code section from a versioned registry — e.g. Consumer Protection Act, 2019 §35.",
	homeDemoNote: "Demo references are clearly marked",
	homeDemoBody:
		"Where the law is uncertain or varies by state, we tag it 'Demo — verify with an expert' and never present it as established law.",
	homePrivacyNote: "Works on your device — your situation stays on your device",
	homePrivacyBody:
		"The MVP runs entirely in your browser. Your situation is never sent to a server.",
	homeDisclaimerNote:
		"LegalAId provides general legal information, not legal advice. It is not a substitute for a qualified lawyer. For help, contact the State Legal Services Authority (helpline 15100).",
	startHere: "Start here",
	viewWorkedExample: "See a worked example",

	// ── Domain cards ────────────────────────────────────────────────
	domainConsumer: "Consumer",
	domainConsumerPlain:
		"Problems with things you bought or services you paid for — defective products, refunds, unfair practices.",
	domainConsumerExample1: "Defective refrigerator within warranty",
	domainConsumerExample2: "Ordered online, never delivered",
	domainLabour: "Labour & employment",
	domainLabourPlain:
		"Problems at work — unpaid wages, unfair dismissal, withheld salary, benefits not paid.",
	domainLabourExample1: "Salary unpaid for 3 months",
	domainLabourExample2: "Pressured to resign without dues",
	domainTenant: "Tenant & rental",
	domainTenantPlain:
		"Problems with renting — security deposits, eviction, harassment by landlord.",
	domainTenantExample1: "Security deposit not returned",
	domainTenantExample2: "Forced to vacate without notice",

	// ── Examples (fill the intake textarea) ─────────────────────────
	exampleDeposit:
		"My landlord has not returned my ₹30,000 security deposit even though I moved out and there was no damage.",
	exampleSalary:
		"My employer has not paid my salary for the last 3 months — about ₹48,000. They are now pressuring me to resign voluntarily. I have no appointment letter, but I have my ID card and salary slips.",
	exampleRefrigerator:
		"I bought a refrigerator online for ₹18,500 last year. It has a 1-year warranty. The compressor failed twice and spoiled my food. The seller says the brand is responsible, and the brand says my warranty expired. Nobody will help.",
	exampleEviction:
		"My landlord wants me to vacate my rented flat with only 5 days notice, and says he will keep my deposit if I don't. I have been living here for 14 months and always paid rent on time.",

	// ── Intake ──────────────────────────────────────────────────────
	intakeTitle: "Tell us what happened",
	situationSheet: "Situation sheet \u2014 describe what happened",
	intakeSubtitle:
		"Describe your situation in your own words — English, Hindi, or both. You can skip any question you can't answer.",
	describeLabel: "Your situation",
	describePlaceholder:
		"e.g. My landlord hasn't returned my ₹30,000 security deposit even though I moved out and there was no damage.",
	voiceLabel: "Speak instead of typing",
	voiceRecording: "Listening — tap to stop",
	voiceTranscribing: "Transcribing…",
	voiceError: "Couldn't transcribe that. Please try again or type instead.",
	voiceUnsupported: "Voice input isn't supported in this browser.",
	voicePermission:
		"Microphone access was denied. Allow it in your browser settings and try again.",
	voiceEmpty: "No speech detected. Please try again.",
	addDetails: "Add details (optional)",
	addDetailsHint: "Only if you know them — this helps us be more specific.",
	domainField: "Area (if you know it)",
	domainConsumerOption: "Consumer",
	domainLabourOption: "Labour & employment",
	domainTenantOption: "Tenant & rental",
	stateField: "State / city",
	statePlaceholder: "e.g. Karnataka, Bengaluru",
	amountField: "Amount involved",
	amountPlaceholder: "e.g. 30000",
	otherPartyField: "The other party",
	otherPartyPlaceholder: "e.g. My landlord, or the company name",
	dateField: "Important dates",
	dateFieldHint: "e.g. when you bought it, when you moved out",
	submitIntake: "Continue",
	submitIntakeAnalyzing: "Analysing…",
	clarifyingHeading: "A few quick questions",
	clarifyingHint:
		"To make the analysis more useful, we'd like to know a little more. Answer what you can, skip the rest.",
	clarifyingProgress: "Question {current} of {total}",
	weWillCheckHeading: "What we'll check",
	editSituation: "Edit my situation",
	scenarioPrefilled: "Example loaded — you can change anything.",

	// ── Analysis ────────────────────────────────────────────────────
	analysisTitle: "Your analysis",
	analysisSubtitle:
		"A plain-language look at what may be happening, in the order that matters.",
	stepSituation: "Situation",
	stepAnalysis: "Analysis",
	stepEvidence: "Evidence",
	stepNextSteps: "Next steps",
	stepDocument: "Document",
	stepOf: "Step {current} of {total}",
	caseProgress: "Case progress",
	understandingHeading: "What we understood",
	understandingHint: "This is what you told us. Correct us if we got it wrong.",
	editMySituation: "Edit my situation",
	possibleIssuesHeading: "Possible legal issues",
	possibleIssuesHint: "These may be issues — not rulings. Each needs proof.",
	rightsHeading: "Your possible rights",
	rightsHint: "What the law may allow you to ask for.",
	lawsHeading: "Applicable law",
	lawsHint: "The specific laws and sections that may apply to your situation.",
	whyAppliesLabel: "Why it may apply",
	sourceLabel: "Source",
	verifiedTag: "Verified",
	demoTag: "Demo — verify with an expert",
	uncertaintyHeading: "What we're unsure about",
	uncertaintyHint:
		"Legal answers depend on facts and on state law. Here's what could change this analysis, and how to find out.",
	changesAnswerLabel: "What would change the answer",
	resolveLabel: "How to find out",
	confidenceFact: "Fact",
	confidencePossible: "Possible legal issue",
	confidenceLegalInfo: "Legal information",
	confidenceAi: "AI interpretation",
	disclaimerHeading: "Please read this",
	nextEvidence: "Next: gather your evidence",
	devProviderBadge: "Development preview",
	devProviderNotice:
		"This analysis was produced by the development provider using demo data, not the trained LegalAId model. Treat it as a product preview — verify any legal claim with an expert or a verified source.",

	// ── Evidence ────────────────────────────────────────────────────
	evidenceTitle: "Evidence checklist",
	evidenceSubtitle:
		"Proof decides a dispute. Gather and keep these before they disappear — screenshots count.",
	evidenceProgress: "{have} of {total} items you already have · {find} to find",
	have: "Have it",
	dontHave: "Don't have it",
	needToFind: "Need to find it",
	evidenceStatusLabel: "Evidence status",
	evidenceWhyLabel: "Why this matters",
	notePlaceholder: "Add a note (where it is, who has it)…",
	noteLabel: "Note",
	evidenceAllReviewed: "You've reviewed your evidence.",
	evidenceNext: "Next: your action plan",
	evidenceAddTitle: "Add your own evidence",
	evidenceAddLabel: "What is it?",
	evidenceAddWhy: "Why it matters",
	evidenceAddButton: "Add evidence",
	evidenceRemove: "Remove",

	// ── Next steps ──────────────────────────────────────────────────
	stepsTitle: "Next steps",
	stepsSubtitle:
		"A clear order of action. These are general suggestions — every situation is different.",
	effortQuick: "Quick",
	effortModerate: "Moderate",
	effortLong: "Long",
	urgentLabel: "Do this soon",
	whyLabel: "Why this step",
	stepsClosing:
		"These are general suggestions, not legal advice. If the dispute isn't resolved, a lawyer or the State Legal Services Authority can tell you what fits your situation.",
	generateDocumentCta: "Next: generate your document",

	// ── Document ────────────────────────────────────────────────────
	documentTitle: "Your document",
	documentSubtitle:
		"A first draft you can edit before using. Review it carefully — ideally with a lawyer or legal aid.",
	documentRegen: "Regenerate letter",
	documentRegenerating: "Regenerating…",
	documentRegenError: "Couldn't regenerate the letter. Try again.",
	documentPreparing: "Preparing the {lang} letter…",
	languageEn: "English",
	languageHi: "हिंदी",
	documentTypeLegalNotice: "Legal notice",
	documentTypeConsumerComplaint: "Consumer complaint",
	documentTypeLabourComplaint: "Labour complaint",
	documentTypeOther: "Document",
	fromParty: "From",
	toParty: "To",
	subjectLabel: "Subject",
	legalReferencesLabel: "Legal references",
	remedyLabel: "What we ask for",
	signatureLabel: "Signature",
	dateLabel: "Date",
	unsavedChanges: "Unsaved changes",
	regenerateWording: "Reword this section",
	printHint:
		"Download PDF opens your browser's print dialog — choose 'Save as PDF'.",
	documentFooterDisclaimer: "General legal information, not legal advice.",

	// ── Assistant ────────────────────────────────────────────────────
	assistantHeading: "Questions about your case?",
	assistantPill: "Ask about your case",
	assistantClose: "Close assistant",
	assistantClear: "Start over",
	assistantDocHeading: "Ask about your document",
	assistantSubtitle:
		"Ask follow-up questions about your case and analysis. LegalAId answers from your case alone.",
	assistantPlaceholder: "Ask a question about your case…",
	assistantSend: "Ask",
	assistantWorking: "Working…",
	assistantError: "Couldn't get an answer. Please try again.",
	assistantDisclaimer:
		"General legal information, not legal advice. Helpline 15100.",
	assistantChipLaw: "Why might this law apply to me?",
	assistantChipMissing: "What information are we missing?",
	assistantChipHindi: "Explain this in Hindi.",
	assistantChipFirst: "What should I do first?",
	assistantChipEvidenceWhy: "Why is this evidence important?",
	assistantChipEvidenceMost: "Which evidence matters most?",
	assistantChipStepsFirst: "Which of these should I do first?",
	assistantChipStepsWait: "What can wait?",
	assistantChipDocStrong: "Is this letter strong enough?",
	assistantChipDocMissing: "What's missing from this letter?",
	reviseTitle: "Revise the document",
	revisePlaceholder: "Tell the assistant how to change the letter…",
	reviseActionFirmer: "Make it firmer",
	reviseActionFormal: "Make it more formal",
	reviseActionTranslate: "Translate to {target}",
	reviseActionCondense: "Shorten it",
	reviseProposalTitle: "Proposed revision",
	reviseProposalNote:
		"Review the proposed changes, then apply or discard them.",
	reviseApply: "Apply changes",
	reviseDiscard: "Discard",
	reviseWorking: "Preparing revision…",
	reviseError: "Couldn't revise the document. Try again.",
	reviseApplied: "Changes applied",
	reviseUnavailable:
		"Revision isn't available for this kind of case — the letter here is a general draft. Edit it directly or ask the assistant in the chat.",
	reviseNoChanges: "No changes detected — try a different instruction.",
	reviseChanged: "What changes:",
	sectionLabel: "Section",

	// ── Legal info page ─────────────────────────────────────────────
	legalTitle: "Legal info",
	legalIntro:
		"LegalAId is a free tool that helps you understand a legal problem in plain language. It is not a lawyer, and it does not give legal advice.",
	whatWeAreHeading: "What LegalAId is",
	whatWeAreNotHeading: "What LegalAId is not",
	whatWeAre:
		"A guided explainer that restates your situation, points to the laws and sections that may apply (with plain-language explanations), helps you gather evidence, suggests next steps, and drafts a document you can edit.",
	whatWeAreNot:
		"Not a substitute for qualified legal advice. Not a prediction of case outcomes. Not a court filing service. Nothing on this site creates a lawyer–client relationship.",
	sourcesHeading: "Where the legal information comes from",
	sourcesBody:
		"Every citation is drawn from a versioned registry of legal sources. Verified entries are real Acts/Code sections (e.g. Consumer Protection Act, 2019 §35). Where the law is uncertain, state-specific, or advisory, we mark it as 'Demo — verify with an expert' and never present it as established law.",
	disclaimerTitle: "Disclaimer",
	helpHeading: "Getting real help",
	helpBody:
		"For free legal aid, contact the State Legal Services Authority helpline: 15100. Legal aid clinics and universities also provide free assistance.",
	privacyNoteHeading: "Privacy",
	privacyNoteBody:
		"The MVP runs entirely on your device — your situation is never sent to a server. In future versions, when AI processing moves to a server, we will update this page first.",

	// ── States ──────────────────────────────────────────────────────
	analyzingStepReading: "Reading your situation…",
	analyzingStepIssues: "Identifying possible legal issues…",
	analyzingStepRights: "Checking your possible rights…",
	analyzingStepLaws: "Finding applicable laws and sections…",
	analyzingStepEvidence: "Preparing the evidence checklist…",
	analyzingStepSteps: "Planning next steps…",
	analyzingStepDocument: "Preparing your document…",
	errorTitle: "Something went wrong",
	errorBody:
		"We couldn't complete the analysis. You can try again, or see general guidance instead.",
	noCaseTitle: "We couldn't find this situation",
	noCaseBody:
		"It may have been cleared from this device. Start a new situation to get help.",
	startNewSituation: "Start a new situation",
	notFoundTitle: "This page doesn't exist",
	notFoundBody: "The address may have changed. Head back to the start.",
	goHome: "Go to the start",
} as const;
