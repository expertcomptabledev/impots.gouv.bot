'use strict';
var _this = this;
exports.__esModule = true;
var tslib_1 = require('tslib');
var helpers_1 = require('./helpers');
var actions = require('./actions');
var Table = require('tty-table');
var chalk = require('chalk');
exports.companies = function(program) {
  program
    .command('companies')
    .option('-e, --email <your-email>', 'Email used to create your impots.gouv.fr account')
    .option('-p, --password <your-password>', 'Password')
    .description('Get your companies')
    .action(function(options) {
      return tslib_1.__awaiter(_this, void 0, void 0, function() {
        var companies_1, error_1;
        return tslib_1.__generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, , 4]);
              return [4 /*yield*/, helpers_1.getCredentials(options)];
            case 1:
              options = _a.sent();
              return [4 /*yield*/, actions.getCompanies(options.email, options.password)];
            case 2:
              companies_1 = _a.sent();
              helpers_1.logSuccess('Got ' + (companies_1.length || 0) + ' companies');
              printCompanies(companies_1);
              return [3 /*break*/, 4];
            case 3:
              error_1 = _a.sent();
              helpers_1.logError('something was wrong during login to impots.gouv.fr : ' + error_1.message);
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    });
};
var printCompanies = function(companies) {
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
  var values = companies.map(function(c, i) {
    return Object.assign({}, c, { index: i ? i + 1 : 1 });
  });
  var t1 = Table(header, values, {
    borderStyle: 1,
    borderColor: 'white',
    paddingBottom: 0,
    headerAlign: 'center',
    align: 'center',
    color: 'white',
    truncate: '...',
  });
  helpers_1.log(t1.render());
};
