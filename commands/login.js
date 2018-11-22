"use strict";
var _this = this;
exports.__esModule = true;
var tslib_1 = require("tslib");
var helpers_1 = require("./helpers");
var actions = require("./actions");
var inquirer = require('inquirer');
exports.login = function (program) {
    program
        .command('login')
        .option('-e, --email <your-email>', 'Email used to create your impots.gouv.fr account')
        .option('-p, --password <your-password>', 'Password')
        .description('Login to impots.gouv.fr')
        .action(function (options) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var error_1;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, helpers_1.getCredentials(options)];
                case 1:
                    options = _a.sent();
                    return [4 /*yield*/, actions.login(options.email, options.password)];
                case 2:
                    _a.sent();
                    helpers_1.logSuccess('Logged in your impot.gouv.fr account');
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    helpers_1.logError('something was wrong during login to impots.gouv.fr : ' + error_1.message);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
};
