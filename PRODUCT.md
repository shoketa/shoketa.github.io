# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Hiring managers and recruiters** at studios, evaluating whether the owner can do the technical art work a role needs. They scan quickly and look for proof: results first, then how they were made.
- **Other technical artists**, who come to see how something was built. They read the breakdowns, node graphs and code, and will judge the technical depth.

Both audiences matter equally; neither is secondary.

## Product Purpose

A personal portfolio for a technical artist. It shows finished work and explains the technique behind it, so it works both as a hiring case and as something peers want to read. Success means a hiring manager can judge the owner's level within a minute, and a peer comes away having learned how something was done.

## Positioning

The work is technical art, focused on **shaders / rendering** and **tools / pipeline**. A case study is more than a gallery shot: it shows the result in motion and then explains how it works (breakdowns, graphs, code). Explaining the technique is the thing a general art or dev portfolio can't offer.

## Operating Context

- Case studies combine **video / GIF clips** of effects and tools in action, **stills and breakdowns** (screenshots, node graphs, before/after), and **code snippets** (shader and tool code).
- Visitors arrive from job applications, social posts, and links shared between artists. Many will open it on a laptop during a review; some on a phone from a social link.

## Capabilities and Constraints

- **Speed is a hard requirement** set by the owner. Built with Astro + Svelte so pages ship as static HTML, and JS only loads for interactive islands.
- The site will be heavy on video. Media must not undo the speed goal: load it lazily, and prefer compressed video over large GIFs where possible.
- Code snippets need to be readable and syntax-highlighted (shader languages such as HLSL/GLSL, plus tool languages such as Python).
- Live WebGL demos are not planned for now. Undecided whether to add them later.
- Undecided: the owner's name/handle shown on the site, the contact method (email, LinkedIn, ArtStation, etc.), and whether to include a CV/résumé.

## Brand Commitments

Set by the owner; binding for future work:

- Mark: the initials **AV** in the top bar.
- Navigation as chapters prefixed with `::` (`:: about`, `:: projects`, `:: breakdowns`).
- Accent gold (#dfb212 light / #bd9b1a for dark-mode text), with the owner-tuned light and dark tokens in `src/styles/global.css`.
- Visual reference: the owner's chosen reference is a text-first, monospace personal site with a running tools line, a halftone portrait, a `░`-ruled résumé divider and dated résumé rows.
- Home is one long page: about (photo, two paragraphs, résumé), then projects. Each project links to its own breakdown page.

## Evidence on Hand

- Résumé: 2026 – present, Junior Technical Artist @ Massive Entertainment.
- Bio / about text: the owner has it ready (not yet in the repo).
- Project case studies: the owner has them ready (not yet in the repo).
- No writing/blog content planned yet. No testimonials, employers, or shipped titles are confirmed, so none should be invented.

## Product Principles

1. **Show it working first.** Every project opens with the result in motion before any explanation.
2. **Then show how.** The breakdown is the product; give technique the space and structure that serious readers expect.
3. **Fast is part of the craft.** A slow page undercuts a technical artist's credibility. Every addition has to earn its weight.
4. **Two depths, one page.** A recruiter can skim, and a peer can go deep, without either one getting in the other's way.
