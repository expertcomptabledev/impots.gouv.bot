'use strict';
var _this = this;
exports.__esModule = true;
var tslib_1 = require('tslib');
var helpers_1 = require('./helpers');
var Table = require('tty-table');
var chalk = require('chalk');
var perf = require('execution-time')();
exports.declarations = function(program) {
  program
    .command('declarations')
    .description('Get avis Cotisation Foncière des Entreprise')
    .option('-e, --email <your-email>', 'Email used to create your impots.gouv.fr account')
    .option('-p, --password <your-password>', 'Password')
    .option('-s, --siren <value>', "Companie's SIREN")
    .option('-S, --save', 'Specify saving pdf')
    .option('-o, --out <value>', 'Specify out directory to save pdf')
    .option('-y, --year <value>', 'Specify year')
    .action(function(options) {
      return tslib_1.__awaiter(_this, void 0, void 0, function() {
        var results, error_1;
        return tslib_1.__generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              perf.start();
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [4 /*yield*/, helpers_1.getCredentials(options)];
            case 2:
              options = _a.sent();
              results = perf.stop();
              helpers_1.log('Executed in ' + results.time + ' ms');
              return [3 /*break*/, 4];
            case 3:
              error_1 = _a.sent();
              helpers_1.logError('something was wrong during get CFE : ' + error_1.message);
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    });
};
// const printDeclarations = (declarations: Array<Models.Declaration>) => {
//     var header = [
//         {
//             value : "index",
//             alias: "#",
//             align: "center",
//         },
//         {
//             value : "year",
//             alias: "Year",
//             align: "center"
//         },
//         {
//             value : "period",
//             alias: "Period",
//             align: "center",
//         },
//         {
//             value : "amount",
//             alias: "Amount",
//             align: "center"
//         },
//         {
//             value : "depositDate",
//             alias: "Date",
//             align: "center"
//         },
//         // {
//         //     value : "depositMode",
//         //     alias: "Mode",
//         //     align: "center"
//         // },
//         {
//             value : "taxSystem",
//             alias: "System",
//             align: "center"
//         },
//         {
//             value : "declarationLink",
//             alias: "Link",
//             align: "center",
//             formatter: (val) => val ? true : false,
//             width: 8
//         }
//     ]
//     const values = declarations.map((c, i) => Object.assign({}, c, { index: i ? i + 1 : 1 }));
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
