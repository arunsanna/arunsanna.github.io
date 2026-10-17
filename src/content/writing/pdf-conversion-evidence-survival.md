*By Arun Sanna*

![Conceptual illustration of source documents containing text, tables and diagrams connecting to structured knowledge.](/article-assets/bran-012/document-extraction/header.png)

*Conceptual illustration of document extraction, not a captured tool output.*

The converter finishes. The file opens. The question you wanted to answer may already be unanswerable.

A missing heatmap can leave its caption behind. A financial value can lose its header. A plausible table row can have no counterpart in the source. Once that output reaches a downstream assistant, fluent prose cannot recover the missing evidence by itself.

My retained August 2026 notes describe six documents and four extraction approaches. Their strongest use is to identify failure modes and review boundaries. They are not an independently rescored benchmark.

## What the retained comparison contains

The reported collection totaled 269 pages: Attention Is All You Need, LoRA, ResNet, Vision Transformer, a 188-page U.S. government budget and a CDC health report.

The historical paths were `anydoc.to_markdown()`, Docling `DocumentConverter`, Unlimited-OCR at `/ocr/parse` with `mode=gundam`, and a Qwen3.6-27B image-chat route with `enable_thinking=false`.

The corpus manifest, source PDFs, raw responses, run logs and exact tool/model revisions were not retained. The method names describe the write-ups' historical setup, not reproducible revision pins or the current quality of these tools.

| Approach | Reported behavior in these cases | What needs review |
| --- | --- | --- |
| anydoc | Diagram content dropped; complex table structure and equations broke | Whether required structure or visual evidence survived |
| Docling | Prose and reading order preserved in a separate sample; image and undecoded-formula placeholders remained | Content identified by a placeholder is still absent |
| Unlimited-OCR | Merged cells and LaTeX retained in some cases; visual content omitted in others | Whether a caption or text output includes the required visual |
| Historical Qwen vision route | Visual descriptions supplied; plausible numeric transcription errors reported | Exact values and table rows against the source |

These categories describe observations, not scored per-tool accuracy or general superiority.

## Two examples that change the acceptance check

The attention-visualization example reportedly retained a caption and page number while omitting the heatmap. Checking for a caption therefore cannot certify extraction of the visual. No length-based detection test was retained either. The notes do not establish that a short-output heuristic would succeed or fail.

The original ResNet-table write-up records an invented row and incorrect FLOPs values from Qwen. No raw response was retained. That is single-write-up testimony, not an independently verified measurement or a count of all model errors.

Both examples point to a concrete acceptance question: is the evidence required by the next task present and traceable to the page?

## The budget figure measures contamination

anydoc's budget conversion reportedly took 0.3 seconds. In its Markdown output, 578 of 939 table rows contained Unicode replacement characters: 61.6%. The remaining 361 rows were unflagged by that particular check, not verified correct.

![Chart of reported anydoc budget output: 578 contaminated rows and 361 unflagged rows out of 939; 61.6% measures replacement-character contamination in this document only.](/article-assets/bran-012/document-extraction/table-row-contamination.png)

*Reported anydoc output for the 188-page budget only. 578 of 939 Markdown table rows contained Unicode replacement characters. The 361 unflagged rows were not independently verified correct. This is row contamination, not overall extraction accuracy.*

Separate observations describe Docling preserving prose and reading order on a ten-page sample and Unlimited-OCR preserving tables on selected budget pages 150 and 160. Neither proves a completed full-budget comparison. The retained evidence does not support calling the selected tables pixel-perfect.

## Preserve the timing units

| Historical timing observation | Retained input unit |
| --- | --- |
| anydoc: 0.03–0.4 seconds | Mixed reported inputs; no common denominator retained |
| Docling: 32–69 seconds | Input granularity unretained |
| Docling: about 18 seconds, separate sample | Ten pages |
| Unlimited-OCR: 39–85 seconds | Per page |
| Historical Qwen route: 9–142 seconds | Per page |

Those figures cannot be normalized into a fair throughput ranking. No full-corpus total is claimed. Choosing a fast path for disposable prose is a task decision; a financial workflow needs the right number attached to the right row, column, year and footnote.

The billing evidence is limited too. OCR and vision were described as self-hosted without a per-call API invoice. Total dollars, energy, hardware allocation, operations and human correction were not measured. Self-hosting does not establish a $0 total cost, and the notes contain no retained scored extraction accuracy.

## Recommended design: separate jobs, shared provenance

Use structural extraction for words, exact values, tables and equations. Use vision for figure relationships and chart meaning. Keep both linked to the source page and preserve their distinct provenance when merging them.

![Recommended parallel structural and visual extraction lanes with a source-linked merge. Conflicts or missing content require source review; vision must not overwrite exact structural values.](/article-assets/bran-012/document-extraction/structure-and-vision-pipeline.png)

*Derived design recommendation, not a measured end-to-end system. Structural extraction owns exact values; vision adds interpretation. Disagreements and missing content go back to the original source.*

| Evidence needed | Assigned job | Review trigger |
| --- | --- | --- |
| Words, values and equations | Structural extraction linked to the page | Missing cell, undecoded formula or reading-order conflict |
| Figures and chart meaning | Visual description linked to the source visual | Omitted visual or unsupported interpretation |
| Combined representation | Preserve provenance from both lanes | Disagreement requires source review |

The recommendation comes from the reported cases. It is not evidence that an implemented two-lane pipeline has been measured or that vision is universally better wherever OCR struggles.

## What a stronger evaluation would retain

Keep the source pages, raw outputs and exact run configuration. Score table structure and numeric values separately from equations and visual completeness. Check downstream answers and correction effort against the original document. Retain comparable timing units and measured costs if those are part of the decision.

Until that evidence exists, the useful deliverable is a representation with visible gaps and page-level provenance. A successful conversion status cannot tell you that the reason you opened the document survived.
