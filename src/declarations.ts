import { logJSON, logError, log, logSuccess, getCredentials } from './helpers';
import * as actions from './actions';
import * as Models from './models';

var Table = require('tty-table');
var chalk = require('chalk');

const perf = require('execution-time')();

export const declarations = (program: any) => {
  program
    .command('declarations')
    .description('Get your companies')
    .option('-e, --email <your-email>', 'Email used to create your impots.gouv.fr account')
    .option('-p, --password <your-password>', 'Password')
    .option('-s, --siren <value>', "Company's SIREN")
    .option('-S, --save', 'Specify saving pdf')
    .option('-o, --out <value>', 'Specify out directory to save pdf')
    .option('-t, --type <value>', 'Specify declaration type, default value is tva')
    .action(async options => {
      perf.start();

      try {

        options = await getCredentials(options);
        options.type = options.type || 'tva';
        const declarations: Array<Models.Declaration> = await actions.declarations(
          options.type,
          options.email,
          options.password,
          options.siren,
          options.save,
          options.out,
        );

        logSuccess(`Got ${declarations.length} declaration(s)`);
        printDeclarations(declarations);
        
      } catch (error) {
        logError('something was wrong during get declarations : ' + error.message);
      }

      const results = perf.stop();
      log(`Executed in ${results.time} ms`);

    });
};

const printDeclarations = (declarations: Array<Models.Declaration>) => {
  var header = [
    {
      value: 'index',
      alias: '#',
      align: 'center',
    },
    {
      value: 'year',
      alias: 'Year',
      align: 'center',
    },
    {
      value: 'period',
      alias: 'Period',
      align: 'center',
    },
    {
      value: 'amount',
      alias: 'Amount',
      align: 'center',
    },
    {
      value: 'depositDate',
      alias: 'Date',
      align: 'center',
    },
    // {
    //     value : "depositMode",
    //     alias: "Mode",
    //     align: "center"
    // },
    {
      value: 'taxSystem',
      alias: 'System',
      align: 'center',
    },
    {
      value: 'declarationLink',
      alias: 'Link',
      align: 'center',
      formatter: val => (val ? true : false),
      width: 8,
    },
  ];

  const values = declarations.map((c, i) => Object.assign({}, c, { index: i ? i + 1 : 1 }));

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
