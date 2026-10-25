# Evidence selection

Choose evidence that shows the behavior or risk the reviewer needs to assess. Do not generate an exhibit for every sentence.

| Change | Useful evidence |
| --- | --- |
| Appearance | Actual-product screenshot; before/after when the difference matters |
| Interaction or motion | Inspected screenshots or a short recording of the relevant state transition |
| CLI behavior | Real command and output trimmed to the relevant lines |
| Data shape | Actual before/after values that expose the changed contract |
| Configuration | Changed values and the observed effect |
| API or command contract | A sequence diagram of caller, transport and server, plus the payload shape |
| Concurrency or race | A sequence diagram with both actors, showing which one wins |
| State lifecycle | A state diagram of the states, with the transitions the change adds or alters |
| Data flow across services | A flowchart of where the data goes, with the changed step marked |
| Structural refactor | Relevant checks and consumer coverage; a diagram when it changes how parts connect |
| Bug fix | Observed failure and corrected behavior, or a clear reproduction limitation |

Use `pr-screenshot-comparison` for matched before/after images. For interaction or motion, record the real product and inspect the recording before attaching it. Keep media outside Git. Upload screenshots and recordings only with the author's authorization. Standing authorization counts.

Caption evidence with the behavior it demonstrates. State meaningful limits, including cases not reproduced or exercised. Do not call a refactor behavior-preserving solely because a test command passed. Avoid fixed visual templates, decorative diagrams, and unrelated theme labels.
