import { logJSON, logError, log, logSuccess, getCredentials } from './helpers';
import * as actions from './actions';
import * as Models from './models';

var Table = require('tty-table');
var chalk = require('chalk');

export const declareInformations = (program: any) => {
  program
    .command('declare')
    .option('-e, --email <your-email>', 'Email used to create your impots.gouv.fr account')
    .option('-p, --password <your-password>', 'Password')
    .option('-s, --siren <value>', "Company's SIREN")
    .option('-t, --type <value>', 'Specify declaration type, default value is tva')
    .description(`Get your company's declare information by type (['TVA', 'IS', 'TS', 'CVAE', 'RCM', 'RES'])`)
    .action(async options => {

      try {

        options = await getCredentials(options);
        const declareInformations = await actions.getDeclareInformations(
            options.type,
            options.email,
            options.password,
            options.siren
        );

        printDeclarationInformations(declareInformations);

      } catch (error) {

        logError('something was wrong during login to impots.gouv.fr : ' + error.message);

      }

    });

};

const printDeclarationInformations = declarationsInformations => {
  var header = [
    {
        value: 'period',
        alias: 'Period',
        align: 'center',
    },
    {
        value: 'limitDate',
        alias: 'Limit date',
        align: 'center'
    },
    {
        value: 'type',
        alias: 'Type',
        align: 'center'
    },
    {
        value: 'depositDate',
        alias: 'Deposit date',
        align: 'center'
    },
  ];

  var t1 = Table(header, declarationsInformations, {
    borderStyle: 1,
    borderColor: 'white',
    paddingBottom: 0,
    headerAlign: 'center',
    align: 'center',
    color: 'white',
    truncate: '...',
  });

  log(t1.render());

};
