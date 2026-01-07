---
name: new-project
description: Create a new project in the ai-sandbox monorepo
arguments:
  - name: name
    description: The name of the new project (e.g., my-cool-app)
    required: true
---

# Create New AI Sandbox Project

Create a new project named `$ARGUMENTS.name` in the ai-sandbox monorepo.

## Steps

1. **Validate the project name**
   - Ensure the name is kebab-case (lowercase with hyphens)
   - Check that a project with this name doesn't already exist in `~/Code/ai-sandbox/apps/`

2. **Copy the template**
   ```bash
   cp -r ~/Code/ai-sandbox/apps/_template ~/Code/ai-sandbox/apps/$ARGUMENTS.name
   ```

3. **Update package.json**
   - Change the `name` field from `_template` to `$ARGUMENTS.name`

4. **Install dependencies**
   ```bash
   cd ~/Code/ai-sandbox && pnpm install
   ```

5. **Build the shared packages** (if not already built)
   ```bash
   cd ~/Code/ai-sandbox && pnpm build --filter=@ai-sandbox/ai --filter=@ai-sandbox/ui
   ```

6. **Report success**
   - Tell the user the project is ready
   - Remind them to:
     - Copy `.env.example` to `.env` and add their API keys
     - Run `pnpm dev --filter=$ARGUMENTS.name` to start the dev server

## Notes

- The new project will have access to all shared packages (`@ai-sandbox/ai`, `@ai-sandbox/ui`)
- The default page includes a chat interface connected to GPT-4o
- To change the model, edit `src/app/api/chat/route.ts`
