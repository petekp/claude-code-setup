"""Extract stats for a single session from JSONL."""
import json
import sys
import os
from collections import Counter, defaultdict
from datetime import datetime

def parse_ts(ts):
    if not ts:
        return None
    try:
        return datetime.fromisoformat(ts.replace('Z', '+00:00'))
    except Exception:
        return None

def analyze(path):
    stats = {
        'path': path,
        'size': os.path.getsize(path),
        'events': 0,
        'user_msgs': 0,
        'user_text_msgs': 0,
        'assistant_msgs': 0,
        'tool_calls': Counter(),
        'tool_errors': Counter(),
        'skill_invocations': Counter(),
        'bash_commands': [],
        'read_paths': [],
        'edit_paths': [],
        'write_paths': [],
        'first_user_prompt': None,
        'user_prompts_first_chars': [],
        'interruptions': 0,
        'course_corrections': 0,
        'compact_events': 0,
        'tool_result_errors': 0,
        'first_ts': None,
        'last_ts': None,
        'total_duration_sec': 0,
        'gap_over_5min': 0,
        'thinking_blocks': 0,
        'subagent_calls': 0,
        'cwd': None,
        'git_branch': None,
        'plan_mode_enters': 0,
        'test_runs': 0,
        'lint_runs': 0,
        'typecheck_runs': 0,
        'permission_denials': 0,
        'user_feedback_pushback': 0,
        'assistant_text_len': 0,
        'long_assistant_text_msgs': 0,
    }
    pushback_markers = [
        'no,', 'nope', 'not what', 'stop,', 'wait,', 'hold on', 'that\'s wrong',
        "that's not", "don't do", 'revert', 'undo', 'why did you', 'why are you',
        'you weren\'t', "you didn't", "that's not what", "i said", "i asked",
        'not sure why you', 'instead of', 'incorrect', 'misread'
    ]
    try:
        with open(path, 'r') as f:
            prev_ts = None
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    ev = json.loads(line)
                except Exception:
                    continue
                stats['events'] += 1
                etype = ev.get('type')
                ts = parse_ts(ev.get('timestamp'))
                if ts:
                    if not stats['first_ts']:
                        stats['first_ts'] = ts
                    stats['last_ts'] = ts
                    if prev_ts and (ts - prev_ts).total_seconds() > 300:
                        stats['gap_over_5min'] += 1
                    prev_ts = ts
                if not stats['cwd']:
                    stats['cwd'] = ev.get('cwd')
                if not stats['git_branch']:
                    stats['git_branch'] = ev.get('gitBranch')

                if etype == 'user':
                    stats['user_msgs'] += 1
                    msg = ev.get('message', {})
                    content = msg.get('content', '')
                    if isinstance(content, str):
                        text = content
                    elif isinstance(content, list):
                        text_parts = []
                        for c in content:
                            if isinstance(c, dict):
                                if c.get('type') == 'text':
                                    text_parts.append(c.get('text', ''))
                                elif c.get('type') == 'tool_result':
                                    tr_content = c.get('content', '')
                                    if isinstance(tr_content, list):
                                        for trc in tr_content:
                                            if isinstance(trc, dict) and trc.get('type') == 'text':
                                                if c.get('is_error') or 'error' in str(trc.get('text',''))[:200].lower():
                                                    stats['tool_result_errors'] += 1
                                                    break
                                    if c.get('is_error'):
                                        stats['tool_result_errors'] += 1
                        text = '\n'.join(text_parts)
                    else:
                        text = ''
                    text_stripped = text.strip()
                    # Count real user text msgs (not tool results, not local-command)
                    if text_stripped and not text_stripped.startswith('<local-command') and not text_stripped.startswith('<command-name>'):
                        stats['user_text_msgs'] += 1
                        if not stats['first_user_prompt']:
                            stats['first_user_prompt'] = text_stripped[:500]
                        stats['user_prompts_first_chars'].append(text_stripped[:300])
                        low = text_stripped.lower()
                        if '[request interrupted' in low or 'tool_use_id was interrupted' in low:
                            stats['interruptions'] += 1
                        for marker in pushback_markers:
                            if marker in low[:200]:
                                stats['user_feedback_pushback'] += 1
                                break
                    if 'interrupted by user' in text.lower() or '[Request interrupted' in text:
                        stats['interruptions'] += 1

                elif etype == 'assistant':
                    stats['assistant_msgs'] += 1
                    msg = ev.get('message', {})
                    content = msg.get('content', [])
                    for c in content:
                        if not isinstance(c, dict):
                            continue
                        t = c.get('type')
                        if t == 'tool_use':
                            name = c.get('name', '')
                            stats['tool_calls'][name] += 1
                            inp = c.get('input', {})
                            if name == 'Bash':
                                cmd = inp.get('command', '')
                                stats['bash_commands'].append(cmd[:300])
                                low = cmd.lower()
                                if 'test' in low or 'vitest' in low or 'jest' in low or 'pytest' in low:
                                    stats['test_runs'] += 1
                                if 'lint' in low or 'eslint' in low or 'ruff' in low:
                                    stats['lint_runs'] += 1
                                if 'tsc' in low or 'typecheck' in low or 'type-check' in low:
                                    stats['typecheck_runs'] += 1
                            elif name == 'Read':
                                stats['read_paths'].append(inp.get('file_path', '')[:200])
                            elif name == 'Edit':
                                stats['edit_paths'].append(inp.get('file_path', '')[:200])
                            elif name == 'Write':
                                stats['write_paths'].append(inp.get('file_path', '')[:200])
                            elif name == 'Skill':
                                sk = inp.get('skill', '')
                                stats['skill_invocations'][sk] += 1
                            elif name in ('Task', 'Agent'):
                                stats['subagent_calls'] += 1
                            elif name == 'ExitPlanMode':
                                stats['plan_mode_enters'] += 1
                        elif t == 'thinking':
                            stats['thinking_blocks'] += 1
                        elif t == 'text':
                            txt = c.get('text', '')
                            stats['assistant_text_len'] += len(txt)
                            if len(txt) > 1500:
                                stats['long_assistant_text_msgs'] += 1
    except Exception as e:
        stats['parse_error'] = str(e)

    if stats['first_ts'] and stats['last_ts']:
        stats['total_duration_sec'] = (stats['last_ts'] - stats['first_ts']).total_seconds()
        stats['first_ts'] = stats['first_ts'].isoformat()
        stats['last_ts'] = stats['last_ts'].isoformat()

    # Convert Counters to dicts for JSON
    stats['tool_calls'] = dict(stats['tool_calls'])
    stats['tool_errors'] = dict(stats['tool_errors'])
    stats['skill_invocations'] = dict(stats['skill_invocations'])
    return stats

if __name__ == '__main__':
    for path in sys.argv[1:]:
        result = analyze(path)
        print(json.dumps(result))
