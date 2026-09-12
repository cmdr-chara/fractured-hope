# Story content maintenance

This guide governs maintenance of existing story material; it does not establish new canon.

For an authored-content change, identify the affected page and its existing character, relationship, timeline, location, and lore references. Preserve the page's language and narrative voice. Keep explicit facts distinct from ambiguity, interpretation, and proposals. A contradiction should be surfaced with the relevant references rather than silently resolved by inventing events.

Treat frontmatter, aliases, slugs, and wikilinks as publishing contracts. A rename needs its incoming links and affected references checked; formatting alone does not justify changing names, chronology, dialogue, or relationships.

The source for the generated audit is `scripts/generate-story-audit.ts` and the story-wiki analyzer it imports. `npm run story:audit` rewrites `content/meta/story-audit.md`; review the resulting changes and do not hand-edit the report to hide findings. Its deterministic findings are navigation/consistency evidence, not independent editorial approval.

Keep repository instructions and task notes outside `content/`: the generator scans all Markdown there, and that tree is site content. Do not introduce a second canon file that duplicates existing material unless the author explicitly chooses that authority model.

For technical changes, use the scripts defined in [package.json](../package.json). Check affected rendered links/layout when a publishing change is in scope. Report unresolved editorial questions and unavailable runtime checks without claiming the content is approved or the site deployed.
