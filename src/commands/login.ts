import { logJSON, logError, log, logSuccess, getCredentials } from './helpers';
import * as actions from './actions';
const inquirer = require('inquirer');
const perf = require('execution-time')();

export const login = (program: any) => {
  program
    .command('login')
    .option('-e, --email <your-email>', 'Email used to create your impots.gouv.fr account')
    .option('-p, --password <your-password>', 'Password')
    .description('Login to impots.gouv.fr')
    .action(async options => {
      perf.start();

      try {
        options = await getCredentials(options);
        await actions.login(options.email, options.password);
        logSuccess('Logged in your impot.gouv.fr account');
        const results = perf.stop();
        log(`Executed in ${results.time} ms`);
      } catch (error) {
        // logError('something was wrong during login to impots.gouv.fr : ' + error.message);
        process.exit(1);
      }
    });
};
