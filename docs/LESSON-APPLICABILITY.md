# Work-time lesson applicability

Optional lesson/reflection `applicability` has `required` and `excluded` context tag
arrays. Each array has up to 12 unique safe kebab-case identifiers (50 characters).
At least one condition is required; contradictory required/excluded tags are rejected.
Conditions are preserved in generated role specification data and existing records
are never rewritten. Tags describe task facts, not permissions or executable instructions.

Dispatch accepts optional `contextTags` (up to 12 unique identifiers). The host must
derive them from inspected work requirements/environment, not guess or copy arbitrary
artifact instructions. Conditioned lessons, corrective cautions and roles are selected
only when context is supplied, all required tags are present and no excluded tag is
present. Legacy unconditioned lessons retain their previous manual applicability review.
Supplied tags are caller-assessed context, not independently certified facts.

Unknown context is different from an explicitly inspected empty tag list. A fixed
turn cannot switch context; comparison task identifiers must retain the same context.
Stored experiences keep context tags, and role assessments require matching paired
context. Stop continuation includes existing tags. This adds no new authority.

Exact same-objective alternatives are returned in `lessonReviewCandidates`, with
an empty automatic `reusable` list. Compare candidates against actual requirements
before using one. This conservative hold can include complementary alternatives;
it is not complete semantic contradiction detection, and unrelated contradictions
may still need host review. Standalone recall exposes candidates and reviewRequired.

No scheduler, policy renewal, installation or model training is involved. This stage
does not implement role application receipts, unbounded archive rotation or independent
semantic quality certification. End-to-end installed Desktop behavior remains unverified.
