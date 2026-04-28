"""Render a session as readable markdown, compressing tool results."""
import json
import sys
import os

def trunc(s, n=400):
    if not s:
        return ''
    s = str(s)
    return s[:n] + ('...' if len(s) > n else '')

def main(path, out_path, max_lines=2000):
    out = []
    events_seen = 0
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                ev = json.loads(line)
            except Exception:
                continue
            etype = ev.get('type')
            ts = ev.get('timestamp', '')
            if etype == 'user':
                msg = ev.get('message', {})
                content = msg.get('content', '')
                if isinstance(content, str):
                    text = content
                elif isinstance(content, list):
                    text_parts = []
                    tool_result_parts = []
                    for c in content:
                        if isinstance(c, dict):
                            if c.get('type') == 'text':
                                text_parts.append(c.get('text', ''))
                            elif c.get('type') == 'tool_result':
                                tr_content = c.get('content', '')
                                is_error = c.get('is_error', False)
                                if isinstance(tr_content, list):
                                    for trc in tr_content:
                                        if isinstance(trc, dict) and trc.get('type') == 'text':
                                            tool_result_parts.append((is_error, trc.get('text','')))
                                else:
                                    tool_result_parts.append((is_error, str(tr_content)))
                    text = '\n'.join(text_parts)
                    if tool_result_parts:
                        for is_err, t in tool_result_parts:
                            out.append(f"  [TOOL_RESULT{'ERR' if is_err else ''}] {trunc(t, 300)}")
                else:
                    text = ''
                text_stripped = text.strip()
                if text_stripped and not text_stripped.startswith('<local-command-'):
                    out.append(f"\n### USER [{ts}]")
                    out.append(trunc(text_stripped, 1500))
            elif etype == 'assistant':
                msg = ev.get('message', {})
                content = msg.get('content', [])
                for c in content:
                    if not isinstance(c, dict):
                        continue
                    t = c.get('type')
                    if t == 'text':
                        txt = c.get('text', '').strip()
                        if txt:
                            out.append(f"\n### ASSISTANT [{ts}]")
                            out.append(trunc(txt, 800))
                    elif t == 'thinking':
                        think = c.get('thinking', '')
                        out.append(f"  [THINK] {trunc(think, 200)}")
                    elif t == 'tool_use':
                        name = c.get('name', '')
                        inp = c.get('input', {})
                        if name == 'Bash':
                            out.append(f"  [BASH] {trunc(inp.get('command',''), 200)}")
                        elif name == 'Read':
                            out.append(f"  [READ] {inp.get('file_path','')}")
                        elif name == 'Edit':
                            out.append(f"  [EDIT] {inp.get('file_path','')}")
                        elif name == 'Write':
                            out.append(f"  [WRITE] {inp.get('file_path','')}")
                        elif name == 'Skill':
                            out.append(f"  [SKILL] {inp.get('skill','')} args={trunc(inp.get('args',''), 80)}")
                        elif name in ('Task','Agent'):
                            out.append(f"  [AGENT] {trunc(json.dumps(inp)[:200], 200)}")
                        elif name in ('TaskCreate','TaskUpdate'):
                            out.append(f"  [{name}] {trunc(json.dumps(inp)[:200], 200)}")
                        else:
                            out.append(f"  [{name}] {trunc(json.dumps(inp)[:120], 120)}")
            events_seen += 1
            if len(out) > max_lines:
                out.append("\n... (truncated)")
                break
    with open(out_path, 'w') as f:
        f.write('\n'.join(out))

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
    print(f"rendered to {sys.argv[2]}")
