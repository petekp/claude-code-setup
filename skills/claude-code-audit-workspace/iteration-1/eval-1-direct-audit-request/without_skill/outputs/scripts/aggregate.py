import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

stats_path = sys.argv[1]
out_path = sys.argv[2]

sessions = []
with open(stats_path) as f:
    for line in f:
        line = line.strip()
        if line and line.startswith('{'):
            sessions.append(json.loads(line))

total = {
    'session_count': len(sessions),
    'total_events': 0,
    'total_user_text_msgs': 0,
    'total_assistant_msgs': 0,
    'total_duration_hours': 0,
    'total_gap_over_5min': 0,
    'total_interruptions': 0,
    'total_user_pushback': 0,
    'total_tool_result_errors': 0,
    'total_long_assistant_msgs': 0,
    'total_assistant_text_chars': 0,
    'total_thinking_blocks': 0,
    'total_subagent_calls': 0,
    'total_test_runs': 0,
    'total_lint_runs': 0,
    'total_typecheck_runs': 0,
}
tool_counter = Counter()
skill_counter = Counter()
bash_verbs = Counter()
edited_files = Counter()
read_files = Counter()
per_session_summary = []
cwds = Counter()
branches = Counter()

for s in sessions:
    if 'parse_error' in s:
        continue
    total['total_events'] += s['events']
    total['total_user_text_msgs'] += s['user_text_msgs']
    total['total_assistant_msgs'] += s['assistant_msgs']
    total['total_duration_hours'] += s.get('total_duration_sec', 0) / 3600
    total['total_gap_over_5min'] += s['gap_over_5min']
    total['total_interruptions'] += s['interruptions']
    total['total_user_pushback'] += s['user_feedback_pushback']
    total['total_tool_result_errors'] += s['tool_result_errors']
    total['total_long_assistant_msgs'] += s['long_assistant_text_msgs']
    total['total_assistant_text_chars'] += s['assistant_text_len']
    total['total_thinking_blocks'] += s['thinking_blocks']
    total['total_subagent_calls'] += s['subagent_calls']
    total['total_test_runs'] += s['test_runs']
    total['total_lint_runs'] += s['lint_runs']
    total['total_typecheck_runs'] += s['typecheck_runs']
    tool_counter.update(s['tool_calls'])
    skill_counter.update(s['skill_invocations'])
    if s.get('cwd'):
        cwds[s['cwd']] += 1
    if s.get('git_branch'):
        branches[s['git_branch']] += 1
    # Bash verb: first token
    for cmd in s['bash_commands']:
        tokens = cmd.strip().split()
        if tokens:
            verb = tokens[0].strip(';|&`')
            if verb in ('cd', 'time', 'sudo', 'env'):
                if len(tokens) > 1:
                    verb = tokens[1].strip(';|&`')
            bash_verbs[verb] += 1
    for p in s['read_paths']:
        if p:
            read_files[p] += 1
    for p in s['edit_paths']:
        if p:
            edited_files[p] += 1
    per_session_summary.append({
        'path': s['path'].split('/')[-1],
        'project': s['path'].split('/')[-2] if not s['path'].endswith('.jsonl') else s['path'].split('/')[-2],
        'size_kb': s['size'] // 1024,
        'events': s['events'],
        'user_text_msgs': s['user_text_msgs'],
        'tool_count': sum(s['tool_calls'].values()),
        'duration_hours': round(s.get('total_duration_sec', 0) / 3600, 2),
        'gap_over_5min': s['gap_over_5min'],
        'pushback': s['user_feedback_pushback'],
        'interruptions': s['interruptions'],
        'subagents': s['subagent_calls'],
        'thinking': s['thinking_blocks'],
        'top_tools': dict(Counter(s['tool_calls']).most_common(5)),
        'skills': s['skill_invocations'],
        'first_prompt': (s.get('first_user_prompt') or '')[:200],
        'cwd': s.get('cwd'),
        'branch': s.get('git_branch'),
    })

result = {
    'totals': total,
    'tools': dict(tool_counter.most_common()),
    'skills': dict(skill_counter.most_common()),
    'bash_verbs': dict(bash_verbs.most_common(30)),
    'projects': dict(cwds.most_common(15)),
    'branches': dict(branches.most_common(15)),
    'top_read_files': dict(read_files.most_common(30)),
    'top_edit_files': dict(edited_files.most_common(30)),
    'per_session': per_session_summary,
}

with open(out_path, 'w') as f:
    json.dump(result, f, indent=2)

# Also print a summary to stdout
print("=== TOTALS ===")
for k, v in total.items():
    if 'hours' in k or 'chars' in k:
        print(f"  {k}: {v:.1f}")
    else:
        print(f"  {k}: {v}")
print("\n=== TOOLS ===")
for k, v in list(tool_counter.most_common(15)):
    print(f"  {k}: {v}")
print("\n=== SKILLS ===")
for k, v in list(skill_counter.most_common(15)):
    print(f"  {k}: {v}")
print("\n=== BASH VERBS ===")
for k, v in list(bash_verbs.most_common(20)):
    print(f"  {k}: {v}")
print("\n=== PROJECTS ===")
for k, v in list(cwds.most_common(10)):
    print(f"  {k}: {v}")
