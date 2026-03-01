// ============================================================
// Sample plugin: what a plugin author writes
// ============================================================

import { definePlugin, LoggerService, ConfigService } from './types';
import type { Logger, CLIConfig } from './types';

export default definePlugin({
  name: 'deploy',
  version: '1.0.0',
  description: 'Deployment commands for mycli',

  register(host) {
    // Access shared services via typed DI tokens
    const logger: Logger = host.getService(LoggerService);
    const config: CLIConfig = host.getService(ConfigService);

    host.registerCommand({
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
        ctx.logger.info(`Working directory: ${config.cwd}`);
        ctx.logger.info('Deployment complete');
      },
    });

    host.registerCommand({
      name: 'deploy:rollback',
      description: 'Rollback the last deployment',
      run: async (_flags, ctx) => {
        ctx.logger.info('Rolling back last deployment...');
        ctx.logger.info('Rollback complete');
      },
    });

    // Strongly typed hooks -- typos in event name would be a compile error
    host.hook('preRun', (ctx) => {
      logger.debug(`[deploy-plugin] About to run: ${ctx.commandName}`);
    });

    host.hook('onError', (ctx, error) => {
      logger.error(`[deploy-plugin] Command "${ctx.commandName}" failed: ${error.message}`);
    });
  },
});
