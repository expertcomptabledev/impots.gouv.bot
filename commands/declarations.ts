import { logJSON, logError, log, logSuccess, getCredentials } from './helpers';
import * as actions from './actions';
import * as Models from './models';

var Table = require('tty-table');
var chalk = require('chalk');

export const declarations = (program: any) => {

    program
        .command('declarations')
        .description('Get your companies')
        .option('-e, --email <your-email>', 'Email used to create your impots.gouv.fr account')
        .option('-p, --password <your-password>' , 'Password')
        .option('-s, --siren <value>' , 'Companie\'s SIREN')
        .option('-S, --save' , 'Specify saving pdf')
        .option('-o, --out <value>' , 'Specify out directory to save pdf')
        .option('-t, --type <value>' , 'Specify declaration type, default value is tva')
        .action(async (options) => {

            try {

                options = await getCredentials(options);
                options.type = options.type || 'tva';
                const declarations = await actions.declarations(options.type, options.email, options.password, options.siren, options.save, options.out);
                logSuccess(`Got declarations`);
                logJSON(declarations);

            } catch (error) {
                logError('something was wrong during get declarations : ' + error.message);
            }

        });

}

// const printCompanies = (companies) => {

//     var header = [
//         {
//             value : "index",
//             alias: "#",
//             align: "center",
//         },
//         {
//             value : "siren",
//             alias: "SIREN",
//             align: "center",
//             formatter : function(value){
//                 return value.toUpperCase();
//             }
//         },
//         {
//             value : "name",
//             alias: "Name",
//             align: "left",
//             formatter : function(value){
//                 return value.toUpperCase();
//             }
//         }
//     ]

//     const values = companies.map((c, i) => Object.assign({}, c, { index: i ? i + 1 : 1 }));

//     var t1 = Table(header,values,{
//         borderStyle : 1,
//         borderColor : "white",
//         paddingBottom : 0,
//         headerAlign : "center",
//         align : "center",
//         color : "white",
//         truncate: "..."
//     });

//     log(t1.render());

// }

