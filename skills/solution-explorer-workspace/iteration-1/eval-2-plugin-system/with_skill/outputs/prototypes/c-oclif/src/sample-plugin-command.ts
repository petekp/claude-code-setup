// ============================================================
// Prototype C: oclif-based plugin
// ============================================================
// This shows what a plugin looks like in the oclif ecosystem.
// The plugin is an npm package with a specific directory
// structure. This file would live at:
//   mycli-plugin-deploy/src/commands/deploy.ts
//
// NOTE: This is pseudocode -- it won't run without oclif
// installed. The point is to compare the authoring experience.
// ============================================================

// --- What the plugin author writes ---

// File: src/commands/deploy.ts
import { Command, Flags } from '@oclif/core';

export default class Deploy extends Command {
  static override description = 'Deploy the application to a target environment';

  static override flags = {
    target: Flags.string({
      description: 'Deployment target (staging, production)',
      required: true,
    }),
    'dry-run': Flags.boolean({
      description: 'Preview deployment without executing',
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Deploy);

    this.log(`Deploying to ${flags.target}...`);
    if (flags['dry-run']) {
      this.log('Dry run mode -- skipping actual deployment');
      return;
    }
    this.log(`Working directory: ${this.config.root}`);
    this.log('Deployment complete');
  }
}

// File: src/commands/deploy/rollback.ts (subcommand via directory structure)
// import { Command } from '@oclif/core';
//
// export default class DeployRollback extends Command {
//   static override description = 'Rollback the last deployment';
//
//   async run(): Promise<void> {
//     this.log('Rolling back last deployment...');
//     this.log('Rollback complete');
//   }
// }

// File: src/hooks/prerun.ts
// import { Hook } from '@oclif/core';
//
// const hook: Hook<'prerun'> = async function (options) {
//   this.debug(`[deploy-plugin] About to run: ${options.Command.id}`);
// };
//
// export default hook;

// File: package.json (plugin manifest)
// {
//   "name": "mycli-plugin-deploy",
//   "version": "1.0.0",
//   "oclif": {
//     "commands": "./dist/commands",
//     "hooks": {
//       "prerun": "./dist/hooks/prerun"
//     }
//   }
// }
