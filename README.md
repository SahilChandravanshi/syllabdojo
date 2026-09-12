# SyllabDojo v12

Minimal syllabus/progress tracker for IBPS PO, SBI PO, RRB PO, RBI Grade B, SEBI Grade A, NABARD Grade A and SSC CGL.

## v12 changes
- Reworked syllabus structure against current official recruitment notifications/handouts available in September 2026.
- Corrected major subject grouping errors, including IBPS PO/SBI PO mains domains, RBI Grade B Phase I/II areas, SEBI Grade A General Stream Paper 2 subjects, NABARD Grade A Phase I/II areas, and SSC CGL Tier II Computer/DEST/Statistics/Finance & Economics areas.
- Added expandable subtopics to the detailed tracking page. Subtopics are guidance labels under a tracked topic; the parent topic remains the completion unit so cross-exam tracking stays consistent.
- Preserved stable shared topic IDs wherever possible so existing local progress remains usable.
- Added persistent view state: reload keeps the current Dashboard / Exam / Analytics / More screen, selected exam and open category.
- My Exams title now opens the exam-selection modal.
- Selected exam pills no longer remove an exam when clicked and no longer contain X buttons.
- Added dedicated icons for every exam.

## Official references used
- IBPS PO/MT XVI: https://www.ibps.in/index.php/management-trainees-xvi/
- IBPS RRB XV: https://www.ibps.in/index.php/rural-bank-xv/
- SBI PO 2026 advertisement: https://sbi.bank.in/csfile/18062026_1_Detailed_Adv.2026.pdf
- RBI Grade B 2026 recruitment: https://opportunities.rbi.org.in/Scripts/bs_viewcontent.aspx?Id=4997
- SEBI Grade A General Stream 2025 advertisement/syllabus: https://www.sebi.gov.in/sebi_data/careerfiles/oct-2025/1761782417659.pdf
- NABARD Grade A career notices / 2025 syllabus materials: https://www.nabard.org/careers-notices1.aspx?cid=693&id=26
- SSC CGL 2026 notification: https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_cgl_2026.pdf

Note: several recruitment bodies publish an indicative/non-exhaustive syllabus rather than a topic-by-topic checklist. SyllabDojo therefore normalizes those official subject areas into practical tracker topics/subtopics instead of claiming that every topic is an official exhaustive list.

## v13 refinements
- Replaced generic Lucide organisation icons with the organisations' actual logo images for IBPS, SBI, RRB, RBI, SEBI, NABARD and SSC.
- Added a small dropdown chevron beside the selected-exam count in the My Exams control.
- Theme control now renders exactly one action icon: Sun in dark mode, Moon in light mode.
- Cleaned exam subject groupings to avoid unnecessary/merged subjects; DI and financial awareness are no longer separate RRB subjects, and SSC DEST is no longer shown as a subject.
- Subject grouping was cross-checked against current official exam structures and Examius/OpenKosh topic organization.

Logo references used in the UI:
- IBPS: Wikimedia Commons file sourced from the IBPS logo.
- SBI: Wikimedia Commons file sourced from State Bank of India.
- RRB: 2025 common RRB logo; PIB/NABARD confirm the unified RRB brand.
- RBI: Wikimedia Commons reproduction sourced from RBI.
- SEBI: Wikimedia Commons file sourced from SEBI.
- NABARD: official NABARD website image (`https://www.nabard.org/images/NABARD-logo.png`).
- SSC: Wikimedia Commons representation of the Staff Selection Commission logo.

## v14 changes
- Removed topic subtopics from the tracker UI/data model. Subtopics can be added later.
- Home dashboard now aggregates a subject across Prelims/Mains/Phase/Tier stages into one clean subject progress card.
- Exam tracker now separates the same subjects under their exact stage labels (for example Prelims/Mains, Phase I/Phase II, Tier I/Tier II).
- Shared master topic IDs remain global, so checking a repeated subject/topic in one stage updates the same topic everywhere it appears.
- Removed the old topic expand/subtopic controls.
- Exam logo treatment uses actual organisation marks rather than generic iconography; RRB uses the unified RRB branding introduced after the 2025 amalgamation.
- Syllabus stage structure is aligned to the OpenKosh presentation style, while official notifications remain the authority for exam rules and syllabus changes.

## v15 changes
- My Exams selector now stacks the selected count + dropdown arrow directly below the title on mobile and desktop.
- Theme toggle is centered and shows only the active-mode icon.
- Organisation logos are displayed as actual logo artwork and are contained cleanly inside the square frames.
- Removed all subtopics from the current data model; subtopics can be added later.
- Home dashboard clubs the same subject across exam stages into one progress tracker.
- Exam tracking pages retain explicit stage sections (Prelims/Mains, Phase I/II, Tier I/II) so users can see exactly where each subject belongs.
- Split previously merged banking/general/technology subjects where the tracker benefits from separate subject-level progress.

Syllabus normalization was cross-checked against current OpenKosh topic structures where available and official exam notifications/source material for the exam-stage structure. OpenKosh itself notes that its syllabus pages organize phases, subjects and topics and should be verified against the latest official notification.

## v16 tracker update
- Tracker UI rebuilt around an OpenKosh-style stage → pattern → subject accordion → topic checklist flow.
- Stage headers are expandable/collapsible.
- Subject rows show progress plus marks/questions where the exam pattern provides them.
- Topic rows are directly checkable; subtopics remain removed.
- Home dashboard remains stage-agnostic and clean; stage separation is only exposed in the tracker.
- Exam selector is centered and rounded.
- Organisation logo artwork is shown without the old forced white image background; current RRB common branding is used.
