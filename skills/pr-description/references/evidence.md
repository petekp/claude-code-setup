# Evidence selection

Choose evidence that shows the behavior or risk the reviewer needs to assess. Do not generate an exhibit for every sentence.

| Change | Useful evidence |
| --- | --- |
| Appearance | Actual-product screenshot; before/after when the difference matters |
| Interaction or motion | Inspected screenshots or a short recording of the relevant state transition |
| CLI behavior | Real command and output trimmed to the relevant lines |
| Data shape | Actual before/after values that expose the changed contract |
| Configuration | Changed values and the observed effect |
| Structural refactor | Relevant checks and consumer coverage; a diagram only if it explains a relationship |
| Bug fix | Observed failure and corrected behavior, or a clear reproduction limitation |

Use `pr-screenshot-comparison` for matched before/after images and `pr-visual-evidence` for interaction or motion proof. Load only the route needed. Capture the real product, inspect every image, and keep media outside Git. Screenshots require Pete's attachment choice even when a capture skill includes uploading.

Caption evidence with the behavior it demonstrates. State meaningful limits, including cases not reproduced or exercised. Do not call a refactor behavior-preserving solely because a test command passed. Avoid fixed visual templates, decorative diagrams, and unrelated theme labels.
