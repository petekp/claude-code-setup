// ============================================================
// Sample plugin: what a plugin author writes
// ============================================================

import { definePlugin } from './types';

export default definePlugin({
  manifest: {
    name: 'deploy',
    version: '1.0.0',
    description: 'Deployment commands for mycli',
    compatibleWith: '>=1.0.0 <2.0.0',
  },

  commands: [
    {
      name: 'deploy',
      description: 'Deploy the application to a target environment',
      flags: {
        target: {
          type: 'string',
          description: 'Deployment target (staging, production)',
          required: true,
        },
        dryRun: {
          type: 'boolean',
          description: 'Preview deployment without executing',
          default: false,
        },
      },
      run: async (flags, ctx) => {
        ctx.logger.info(`Deploying to ${flags.target}...`);
        if (flags.dryRun) {
          ctx.logger.info('Dry run mode -- skipping actual deployment');
          return;
        }
        // actual deployment logic here
        ctx.logger.info('Deployment complete');
      },
    },
    {
      name: 'deploy:rollback',
      description: 'Rollback the last deployment',
      run: async (_flags, ctx) => {
        ctx.logger.info('Rolling back last deployment...');
        ctx.logger.info('Rollback complete');
      },
    },
  ],

  hooks: {
    preRun: async (commandName, ctx) => {
      ctx.logger.debug(`[deploy-plugin] About to run: ${commandName}`);
    },
    onError: async (commandName, error, ctx) => {
      ctx.logger.error(`[deploy-plugin] Command "${commandName}" failed: ${error.message}`);
    },
  },
});
