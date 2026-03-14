#!/usr/bin/env python3

from __future__ import annotations

import argparse
import os
import re
import sys
from pathlib import Path
from textwrap import dedent


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "system"


def pascal_case(value: str) -> str:
    words = [part for part in re.split(r"[^a-zA-Z0-9]+", value) if part]
    return "".join(word[:1].upper() + word[1:] for word in words) or "System"


def ensure_empty(paths: list[Path], force: bool) -> None:
    collisions = [path for path in paths if path.exists()]
    if collisions and not force:
        joined = "\n".join(str(path) for path in collisions)
        raise SystemExit(f"Refusing to overwrite existing files:\n{joined}")


def write_file(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.rstrip() + "\n")


def guide_template(title: str, slug: str) -> str:
    return dedent(
        f"""
        # {title}

        Reader goal:
        - After ten minutes with this artifact, the reader should be able to explain what `{slug}` does, where its state lives, and which files to edit first.

        ## 1. Orientation

        Question:
        - Why does this subsystem exist?

        Answer:
        - 

        Authority:
        - Entry point:
        - Owning file:
        - High-signal test:

        ## 2. System Map

        Actors:
        - 

        Boundaries:
        - 

        Source-of-truth files:
        - 

        ## 3. Happy Path

        Step 1:
        - Trigger:
        - Owner:
        - Visible effect:
        - Authority:

        Step 2:
        - Trigger:
        - Owner:
        - Visible effect:
        - Authority:

        ## 4. State And Invariants

        State:
        - 

        Invariants:
        - 

        ## 5. Branches And Failure Modes

        Edge case:
        - 

        Failure path:
        - 

        ## 6. Read Next

        1. 
        2. 
        3. 
        """
    )


def source_index_template(title: str) -> str:
    return dedent(
        f"""
        # {title} Source Index

        ## Authority Files

        | Rank | File | Why it matters | Confidence |
        |------|------|----------------|------------|
        | 1 |  |  | High |
        | 2 |  |  | Medium |
        | 3 |  |  | Medium |

        ## Key Symbols

        | Symbol | File | Role | Notes |
        |--------|------|------|-------|
        |  |  |  |  |

        ## Tests

        | Test | File | Behavior covered | Gaps |
        |------|------|------------------|------|
        |  |  |  |  |

        ## Runtime Evidence

        | Trace or log | Where captured | What it proves |
        |--------------|----------------|----------------|
        |  |  |  |

        ## Open Questions

        - 
        """
    )


def chunk_manifest_template(title: str) -> str:
    return dedent(
        f"""
        # {title} Chunk Manifest

        Use this file as the control plane for the explanatory artifact. Keep each chunk tightly scoped, source-backed, and paired with a reader experiment.

        ## Chunk Summary

        | Chunk | Question | Authority | Probe | Misread to prevent |
        |-------|----------|-----------|-------|--------------------|
        | Orientation | Why does this subsystem exist? |  |  |  |
        | Happy path | What normally happens first? |  |  |  |
        | State | Where does the truth live? |  |  |  |

        ## Chunk: Orientation

        Question:
        - Why does this subsystem exist?

        Claim:
        - 

        Because:
        - 

        Authority:
        - File:
        - Test:
        - Trace:

        Show:
        - 

        Try it:
        - 

        Misread to prevent:
        - 

        ## Chunk: Happy Path

        Question:
        - What normally happens first, second, and third?

        Claim:
        - 

        Because:
        - 

        Authority:
        - File:
        - Test:
        - Trace:

        Show:
        - 

        Try it:
        - 

        Misread to prevent:
        - 
        """
    )


def reader_lab_template(title: str) -> str:
    return dedent(
        f"""
        # {title} Reader Lab

        Use this file to define the small experiments that prove the narrative.

        ## Scenario 1

        Goal:
        - Reproduce the happy path.

        Setup:
        - 

        Action:
        - 

        Expected observation:
        - 

        Invariant checked:
        - 

        ## Scenario 2

        Goal:
        - Surface one edge case or failure path.

        Setup:
        - 

        Action:
        - 

        Expected observation:
        - 

        Invariant checked:
        - 
        """
    )


def artifact_template(title: str, slug: str) -> str:
    return dedent(
        f"""
        export type EvidenceKind = "source" | "test" | "trace" | "inference";

        export type Evidence = {{
          kind: EvidenceKind;
          note: string;
        }};

        export type SourceFile = {{
          label: string;
          path: string;
          reason: string;
        }};

        export type Chunk = {{
          id: string;
          title: string;
          question: string;
          claim: string;
          because: string;
          evidence: Evidence[];
          sourceAnchors: string[];
          tryIt: string;
          misread: string;
        }};

        export type Scenario = {{
          id: string;
          label: string;
          goal: string;
          setup: string;
          expectedObservation: string;
          invariant: string;
        }};

        export const artifact = {{
          title: "{title}",
          slug: "{slug}",
          readerGoal:
            "Explain the subsystem in human order, anchored to source files, tests, and runtime behavior.",
          primaryQuestion:
            "What should a newcomer understand after ten minutes with this explainer?",
        }} as const;

        export const sourceFiles: SourceFile[] = [
          {{
            label: "Entrypoint",
            path: "",
            reason: "Start here to understand how the subsystem gets invoked.",
          }},
          {{
            label: "State owner",
            path: "",
            reason: "This file should answer where the truth lives and how it changes.",
          }},
        ];

        export const chunks: Chunk[] = [
          {{
            id: "orientation",
            title: "Orientation",
            question: "Why does this subsystem exist?",
            claim: "",
            because: "",
            evidence: [{{ kind: "source", note: "Point to the owning file or entrypoint." }}],
            sourceAnchors: [""],
            tryIt: "",
            misread: "",
          }},
          {{
            id: "happy-path",
            title: "Happy Path",
            question: "What happens in the normal flow?",
            claim: "",
            because: "",
            evidence: [{{ kind: "test", note: "Link the test or trace that proves the sequence." }}],
            sourceAnchors: [""],
            tryIt: "",
            misread: "",
          }},
        ];

        export const scenarios: Scenario[] = [
          {{
            id: "happy-path",
            label: "Happy path",
            goal: "Verify the main execution path.",
            setup: "",
            expectedObservation: "",
            invariant: "",
          }},
          {{
            id: "edge-case",
            label: "Edge case",
            goal: "Show a branch, retry, or failure mode worth understanding.",
            setup: "",
            expectedObservation: "",
            invariant: "",
          }},
        ];
        """
    )


def trace_template(title: str) -> str:
    return dedent(
        f"""
        export type TraceSource = {{
          file: string;
          symbol?: string;
        }};

        export type TraceEvent = {{
          id: string;
          at: number;
          kind: string;
          label: string;
          scenarioId?: string;
          source?: TraceSource;
          before?: unknown;
          after?: unknown;
          detail?: unknown;
          invariant?: string;
        }};

        export type TraceSnapshot = {{
          events: TraceEvent[];
          currentIndex: number;
          current?: TraceEvent;
        }};

        export type TraceEventInput = Omit<TraceEvent, "id" | "at"> &
          Partial<Pick<TraceEvent, "id" | "at">>;

        export type TraceListener = (snapshot: TraceSnapshot) => void;

        export type TraceStore = {{
          getSnapshot: () => TraceSnapshot;
          record: (event: TraceEventInput) => TraceEvent;
          replace: (events: TraceEvent[]) => void;
          reset: () => void;
          subscribe: (listener: TraceListener) => () => void;
        }};

        function buildSnapshot(events: TraceEvent[]): TraceSnapshot {{
          const currentIndex = events.length - 1;
          return {{
            events,
            currentIndex,
            current: currentIndex >= 0 ? events[currentIndex] : undefined,
          }};
        }}

        export function createTraceStore(initialEvents: TraceEvent[] = []): TraceStore {{
          let events = [...initialEvents];
          const listeners = new Set<TraceListener>();

          const emit = () => {{
            const snapshot = buildSnapshot(events);
            for (const listener of listeners) {{
              listener(snapshot);
            }}
          }};

          return {{
            getSnapshot: () => buildSnapshot(events),
            record: (event) => {{
              const nextEvent: TraceEvent = {{
                ...event,
                id: event.id ?? `trace-${{events.length + 1}}`,
                at: event.at ?? Date.now(),
              }};
              events = [...events, nextEvent];
              emit();
              return nextEvent;
            }},
            replace: (nextEvents) => {{
              events = [...nextEvents];
              emit();
            }},
            reset: () => {{
              events = [];
              emit();
            }},
            subscribe: (listener) => {{
              listeners.add(listener);
              listener(buildSnapshot(events));
              return () => {{
                listeners.delete(listener);
              }};
            }},
          }};
        }}

        export function formatTraceTime(at: number): string {{
          return new Date(at).toLocaleTimeString([], {{
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }});
        }}

        const sampleStart = new Date("2026-01-01T10:00:00Z").valueOf();

        export const sampleTraceEvents: TraceEvent[] = [
          {{
            id: "request-start",
            at: sampleStart,
            kind: "request",
            label: "{title} started",
            scenarioId: "happy-path",
            source: {{ file: "", symbol: "" }},
            detail: {{ note: "Replace with the real entrypoint event." }},
          }},
          {{
            id: "state-change",
            at: sampleStart + 800,
            kind: "state",
            label: "State advanced",
            scenarioId: "happy-path",
            before: {{}},
            after: {{}},
            invariant: "Name the invariant preserved by this transition.",
          }},
          {{
            id: "edge-case",
            at: sampleStart + 1500,
            kind: "branch",
            label: "Failure path replay",
            scenarioId: "edge-case",
            detail: {{ note: "Replace with a retry, guard failure, or alternate branch." }},
          }},
        ];
        """
    )


def page_template(
    title: str,
    component_name: str,
    artifact_import_path: str,
    trace_import_path: str,
) -> str:
    return dedent(
        f"""
        import {{ notFound }} from "next/navigation";
        import {{ artifact, chunks, scenarios, sourceFiles }} from "{artifact_import_path}";
        import {{ formatTraceTime, sampleTraceEvents }} from "{trace_import_path}";

        export default function {component_name}Page() {{
          if (process.env.NODE_ENV !== "development") {{
            notFound();
          }}

          return (
            <main style={{{{ margin: "0 auto", maxWidth: 1100, padding: "48px 24px 96px" }}}}>
              <header style={{{{ display: "grid", gap: 12, marginBottom: 40 }}}}>
                <p style={{{{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}}}>
                  Explanatory Playground
                </p>
                <h1 style={{{{ fontSize: 40, lineHeight: 1.1 }}}}>{title}</h1>
                <p style={{{{ fontSize: 18, lineHeight: 1.6, maxWidth: 760 }}}}>{'{'}artifact.readerGoal{'}'}</p>
                <p style={{{{ fontSize: 15, lineHeight: 1.6, maxWidth: 760 }}}}>
                  Start by filling out the artifact model in <code>{'{'}artifact.slug{'}'}</code> and replace the placeholder
                  chunks with source-backed claims, tests, and reader experiments.
                </p>
              </header>

              <section style={{{{ display: "grid", gap: 16, marginBottom: 40 }}}}>
                <h2 style={{{{ fontSize: 24 }}}}>Source Index</h2>
                <div style={{{{ display: "grid", gap: 12 }}}}>
                  {'{'}sourceFiles.map((file) => (
                    <article
                      key={{file.label}}
                      style={{{{ border: "1px solid #d6d9e0", borderRadius: 16, padding: 16 }}}}
                    >
                      <strong>{'{'}file.label{'}'}</strong>
                      <p style={{{{ margin: "8px 0 4px" }}}}>{'{'}file.path || "Add a real file path"{'}'}</p>
                      <p style={{{{ margin: 0, color: "#4a5565" }}}}>{'{'}file.reason{'}'}</p>
                    </article>
                  )){'}'}
                </div>
              </section>

              <section style={{{{ display: "grid", gap: 16, marginBottom: 40 }}}}>
                <h2 style={{{{ fontSize: 24 }}}}>Narrative Chunks</h2>
                <div style={{{{ display: "grid", gap: 16 }}}}>
                  {'{'}chunks.map((chunk) => (
                    <article
                      key={{chunk.id}}
                      style={{{{ border: "1px solid #d6d9e0", borderRadius: 16, padding: 20 }}}}
                    >
                      <h3 style={{{{ fontSize: 20, marginBottom: 8 }}}}>{'{'}chunk.title{'}'}</h3>
                      <p style={{{{ fontWeight: 600 }}}}>{'{'}chunk.question{'}'}</p>
                      <p style={{{{ margin: "8px 0" }}}}>{'{'}chunk.claim || "Add the claim this chunk teaches."{'}'}</p>
                      <p style={{{{ margin: "8px 0", color: "#4a5565" }}}}>
                        <strong>Because:</strong> {'{'}chunk.because || "Explain the mechanism or invariant behind the claim."{'}'}
                      </p>
                      <p style={{{{ margin: "8px 0" }}}}>
                        <strong>Try it:</strong> {'{'}chunk.tryIt || "Add a small reader experiment."{'}'}
                      </p>
                      <p style={{{{ margin: "8px 0" }}}}>
                        <strong>Misread to prevent:</strong> {'{'}chunk.misread || "Name the wrong mental model to head off."{'}'}
                      </p>
                    </article>
                  )){'}'}
                </div>
              </section>

              <section style={{{{ display: "grid", gap: 16, marginBottom: 40 }}}}>
                <h2 style={{{{ fontSize: 24 }}}}>Trace Timeline</h2>
                <div style={{{{ display: "grid", gap: 12 }}}}>
                  {'{'}sampleTraceEvents.map((event) => (
                    <article
                      key={{event.id}}
                      style={{{{ border: "1px solid #d6d9e0", borderRadius: 16, padding: 16 }}}}
                    >
                      <div
                        style={{{{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          flexWrap: "wrap",
                        }}}}
                      >
                        <strong>{'{'}event.label{'}'}</strong>
                        <span style={{{{ color: "#4a5565" }}}}>{'{'}formatTraceTime(event.at){'}'}</span>
                      </div>
                      <p style={{{{ margin: "8px 0 4px", color: "#4a5565" }}}}>
                        Kind: {'{'}event.kind{'}'}
                        {'{'}event.scenarioId ? ` | Scenario: ${{event.scenarioId}}` : ""{'}'}
                      </p>
                      <p style={{{{ margin: "4px 0", color: "#4a5565" }}}}>
                        Source: {'{'}event.source?.file || "Add the owning file for this trace event."{'}'}
                      </p>
                      <p style={{{{ margin: "4px 0", color: "#4a5565" }}}}>
                        Invariant: {'{'}event.invariant || "Name the invariant or branch this event helps explain."{'}'}
                      </p>
                    </article>
                  )){'}'}
                </div>
              </section>

              <section style={{{{ display: "grid", gap: 16 }}}}>
                <h2 style={{{{ fontSize: 24 }}}}>Reader Lab</h2>
                <div style={{{{ display: "grid", gap: 12 }}}}>
                  {'{'}scenarios.map((scenario) => (
                    <article
                      key={{scenario.id}}
                      style={{{{ border: "1px solid #d6d9e0", borderRadius: 16, padding: 16 }}}}
                    >
                      <strong>{'{'}scenario.label{'}'}</strong>
                      <p style={{{{ margin: "8px 0 4px" }}}}>{'{'}scenario.goal{'}'}</p>
                      <p style={{{{ margin: "4px 0", color: "#4a5565" }}}}>
                        Setup: {'{'}scenario.setup || "Describe the initial state or input."{'}'}
                      </p>
                      <p style={{{{ margin: "4px 0", color: "#4a5565" }}}}>
                        Expect: {'{'}scenario.expectedObservation || "Record what the reader should observe."{'}'}
                      </p>
                      <p style={{{{ margin: "4px 0", color: "#4a5565" }}}}>
                        Invariant: {'{'}scenario.invariant || "Name the invariant this scenario checks."{'}'}
                      </p>
                    </article>
                  )){'}'}
                </div>
              </section>
            </main>
          );
        }}
        """
    )


def relative_import(from_path: Path, to_path: Path) -> str:
    target = to_path.with_suffix("")
    relative = os.path.relpath(target, from_path.parent)
    normalized = relative.replace(os.sep, "/")
    if not normalized.startswith("."):
        normalized = f"./{normalized}"
    return normalized


def build_paths(repo_root: Path, slug: str, shape: str, app_dir: str, src_dir: str) -> dict[str, Path]:
    docs_dir = repo_root / "docs" / "explanatory" / slug
    paths = {
        "guide": docs_dir / "guide.md",
        "source_index": docs_dir / "source-index.md",
        "chunk_manifest": docs_dir / "chunk-manifest.md",
        "reader_lab": docs_dir / "reader-lab.md",
    }
    if shape == "hybrid":
        paths["page"] = repo_root / app_dir / "__dev" / slug / "page.tsx"
        paths["artifact"] = repo_root / src_dir / "devtools" / slug / "artifact.ts"
        paths["trace"] = repo_root / src_dir / "devtools" / slug / "trace.ts"
    return paths


def create_scaffold(repo_root: Path, title: str, shape: str, app_dir: str, src_dir: str, force: bool) -> list[Path]:
    slug = slugify(title)
    component_name = pascal_case(title)
    paths = build_paths(repo_root, slug, shape, app_dir, src_dir)
    ensure_empty(list(paths.values()), force)

    write_file(paths["guide"], guide_template(title, slug))
    write_file(paths["source_index"], source_index_template(title))
    write_file(paths["chunk_manifest"], chunk_manifest_template(title))
    write_file(paths["reader_lab"], reader_lab_template(title))

    if shape == "hybrid":
        artifact_import_path = relative_import(paths["page"], paths["artifact"])
        trace_import_path = relative_import(paths["page"], paths["trace"])
        write_file(paths["artifact"], artifact_template(title, slug))
        write_file(paths["trace"], trace_template(title))
        write_file(
            paths["page"],
            page_template(title, component_name, artifact_import_path, trace_import_path),
        )

    return list(paths.values())


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Scaffold an explanatory artifact package inside a repo.",
    )
    parser.add_argument("repo_root", help="Path to the repository root")
    parser.add_argument("title", help="Human-readable topic name, for example 'Auth Flow'")
    parser.add_argument(
        "--shape",
        choices=("docs", "hybrid"),
        default="docs",
        help="Create docs only, or docs plus a Next.js-style dev route scaffold.",
    )
    parser.add_argument(
        "--app-dir",
        default="app",
        help="App directory used for the dev route when --shape hybrid is selected.",
    )
    parser.add_argument(
        "--src-dir",
        default="src",
        help="Source directory used for the artifact model when --shape hybrid is selected.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing scaffold files.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    repo_root = Path(args.repo_root).resolve()
    if not repo_root.exists():
        print(f"Repository root does not exist: {repo_root}", file=sys.stderr)
        return 1
    if not repo_root.is_dir():
        print(f"Repository root is not a directory: {repo_root}", file=sys.stderr)
        return 1

    created = create_scaffold(
        repo_root=repo_root,
        title=args.title,
        shape=args.shape,
        app_dir=args.app_dir,
        src_dir=args.src_dir,
        force=args.force,
    )
    for path in created:
        print(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
