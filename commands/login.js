"use strict";
var _this = this;
exports.__esModule = true;
var tslib_1 = require("tslib");
var helpers_1 = require("./helpers");
var actions = require("./actions");
var inquirer = require('inquirer');
var perf = require('execution-time')();
exports.login = function (program) {
    program
        .command('login')
        .option('-e, --email <your-email>', 'Email used to create your impots.gouv.fr account')
        .option('-p, --password <your-password>', 'Password')
        .description('Login to impots.gouv.fr')
        .action(function (options) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var results, error_1;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    perf.start();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, helpers_1.getCredentials(options)];
                case 2:
                    options = _a.sent();
                    return [4 /*yield*/, actions.login(options.email, options.password)];
                case 3:
                    _a.sent();
                    helpers_1.logSuccess('Logged in your impot.gouv.fr account');
                    results = perf.stop();
                    helpers_1.log("Executed in " + results.time + " ms");
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    // logError('something was wrong during login to impots.gouv.fr : ' + error.message);
                    process.exit(1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); });
};
