import { logJSON, logError, log, logSuccess, getCredentials } from './helpers';
import * as actions from './actions';
import * as Models from './models';

var Table = require('tty-table');
var chalk = require('chalk');

export const companies = (program: any) => {
  program
    .command('companies')
    .option('-e, --email <your-email>', 'Email used to create your impots.gouv.fr account')
    .option('-p, --password <your-password>', 'Password')
    .description('Get your companies')
    .action(async options => {
      try {
        options = await getCredentials(options);
        const companies: Array<Models.Companie> = await actions.getCompanies(options.email, options.password);
        logSuccess(`Got ${companies.length || 0} companies`);
        printCompanies(companies);
      } catch (error) {
        logError('something was wrong during login to impots.gouv.fr : ' + error.message);
      }
    });
};

const printCompanies = companies => {
  var header = [
    {
      value: 'index',
      alias: '#',
      align: 'center',
    },
    {
      value: 'siren',
      alias: 'SIREN',
      align: 'center',
      formatter: function(value) {
        return value.toUpperCase();
      },
    },
    {
      value: 'name',
      alias: 'Name',
      align: 'left',
      formatter: function(value) {
        return value.toUpperCase();
      },
    },
  ];

  const values = companies.map((c, i) => Object.assign({}, c, { index: i ? i + 1 : 1 }));

  var t1 = Table(header, values, {
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
