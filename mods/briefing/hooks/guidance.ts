// What the agent reads about the briefing: the record tool's description and
// schema, and the standing guidance. Both must stay identical for a session,
// since the engine caches them with the prompt.

export const TOOL_NAME = 'record'
export const TOOL = 'mcp__briefing__record'

export const TOOL_DESCRIPTION = `Record what the person needs to see in their briefing, the shared record of this session shown beside the chat and in their sidebar. One call can set the goal, ask decisions, record choices you made, add tasks only the person can do, and close items. Items get ids (d1, t1) that you and the person use to refer to them. The reply lists the ids, and anything refused with why.`

const ITEM_QUESTION =
  'The question in plain words, at most 12 words, readable without your reply. Keep its meaning and every alternative it names.'

export const TOOL_SCHEMA = {
  type: 'object',
  properties: {
    goal: {
      type: 'string',
      description:
        "The goal of the current work in one sentence, in the person's terms. Set it when a task starts or the person changes direction.",
    },
    ask: {
      type: 'array',
      description:
        'Decisions only the person can make: anything their instructions reserve for their approval, such as scope changes, commits and spending money; product, design and creative calls; and anything with no reasonable default. Calls the briefing holds for a Run press need no question of their own.',
      items: {
        type: 'object',
        properties: {
          question: { type: 'string', description: ITEM_QUESTION },
          label: {
            type: 'string',
            description: 'At most 16 characters naming it in the person\'s sidebar, as in "Publish to npm".',
          },
          options: {
            type: 'array',
            items: { type: 'string' },
            description: '2 to 4 options, at most 5 words each. Omit for an open question.',
          },
          recommend: { type: 'string', description: 'The option you recommend.' },
          reason: { type: 'string', description: 'One line: why you recommend it, or why you have no recommendation.' },
          detail: {
            type: 'string',
            description:
              'What each option leads to when it is not obvious, such as files changed, a PR opened, or production affected.',
          },
        },
        required: ['question'],
      },
    },
    chose: {
      type: 'array',
      description:
        'Decisions you made yourself that the person might reasonably have made differently. They see each one and can switch it with one press. Include things outside the task you decided to leave alone, such as a bug you noticed or a part you could not test.',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description:
              'The id of a decision the person left to you with "Your call", when this records what you decided for it.',
          },
          question: { type: 'string', description: ITEM_QUESTION },
          options: {
            type: 'array',
            items: { type: 'string' },
            description: 'The option you took and the ones you set aside, at most 5 words each.',
          },
          took: { type: 'string', description: 'The option you took.' },
          reason: { type: 'string', description: 'One line: why.' },
          detail: { type: 'string', description: 'What switching would change.' },
        },
        required: ['took'],
      },
    },
    task: {
      type: 'array',
      description:
        'Things only the person can do: sign in, check something on their own device, reply to a teammate. Do everything else yourself.',
      items: {
        type: 'object',
        properties: {
          what: { type: 'string', description: 'The step in plain words, at most 12 words.' },
          label: {
            type: 'string',
            description: 'At most 16 characters naming it in the person\'s sidebar, as in "Sign in to npm".',
          },
          run: {
            type: 'string',
            description:
              'A command only the person can run, which they run with ! in the prompt. The task closes when they run it.',
          },
          open: { type: 'string', description: 'A file to open.' },
          link: { type: 'string', description: 'A URL to open.' },
        },
        required: ['what'],
      },
    },
    close: {
      type: 'array',
      description: 'Items the person answered in chat, that are resolved, or that were wrong.',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          answer: { type: 'string', description: "The person's answer in their words, when they answered in chat." },
          reason: { type: 'string', description: 'Why it no longer applies, when it was not answered.' },
        },
        required: ['id'],
      },
    },
  },
}

export const GUIDANCE = `# Briefing

The person sees a briefing of this session beside the chat and in their sidebar: the goal, what waits on them, what you chose for them, and measured facts such as check results and stops. It is how they catch up after working in other sessions. Keep it true with the briefing's \`record\` tool.

- When a task starts, or the person changes direction, record the goal in one sentence.
- Ask for the person's calls; decide the rest. Ask for anything their instructions reserve for their approval, for product, design and creative calls, and for anything with no reasonable default, each with your recommendation and why. Decide everything else yourself, record the choices they might have made differently, and keep working.
- A question about what the person saw or meant, which they answer in their next message, is not a decision. Keep it in your reply.
- Record tasks only the person can do. Do every other chore yourself.
- When the person answers an item in chat, close it with their answer. Close items that are resolved or were wrong. Answers and presses from the briefing are recorded already.
- In your reply, name recorded items by id, as in "d3 waits on you: publish now?". Do not list them again as numbered questions.
- The briefing holds outward and destructive calls until the person presses Run: pushes, PRs, releases, publishes and deploys that their latest message did not ask for, and every force-push, discard of local work, deletion and outward message. When one is the next step, make the call instead of asking about it: the held call shows the person the exact command with a Run button.
- The briefing shows check results it measured from your commands. Before you say something works or passes, run a check after your last edit, or say it is untested.
- AskUserQuestion still works when you cannot continue without an answer and the person is at their desk. The briefing shows that question too.`
