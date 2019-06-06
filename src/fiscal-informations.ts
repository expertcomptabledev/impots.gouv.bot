import { logJSON, logError, log, logSuccess, getCredentials } from './helpers';
import * as actions from './actions';
import * as Models from './models';

var Table = require('tty-table');
var chalk = require('chalk');

export const fiscalInformations = (program: any) => {
  program
    .command('fiscal-informations')
    .option('-e, --email <your-email>', 'Email used to create your impots.gouv.fr account')
    .option('-p, --password <your-password>', 'Password')
    .option('-s, --siren <value>', "Company's SIREN")
    .action(async options => {

      try {

        options = await getCredentials(options);
        const infos = await actions.getFiscalInformations(
            options.email,
            options.password,
            options.siren
        );

        logJSON(infos, `Got fiscal informations for ${options.siren} : `);

      } catch (error) {

        logError('something was wrong during login to impots.gouv.fr : ' + error.message);

      }

    });

};
