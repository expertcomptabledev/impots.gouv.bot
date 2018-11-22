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
        var _a, _b, _c, _d, error_1;
        return tslib_1.__generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 6, , 7]);
                    _a = options;
                    _b = options.email;
                    if (_b) return [3 /*break*/, 2];
                    return [4 /*yield*/, inquirer.prompt([{
                                name: 'email',
                                message: 'Enter your email'
                            }]).then(function (res) { return res.password; })];
                case 1:
                    _b = (_e.sent());
                    _e.label = 2;
                case 2:
                    _a.email = _b;
                    _c = options;
                    _d = options.password;
                    if (_d) return [3 /*break*/, 4];
                    return [4 /*yield*/, inquirer.prompt([{
                                name: 'password',
                                type: 'password',
                                message: 'Enter your password'
                            }]).then(function (res) { return res.password; })];
                case 3:
                    _d = (_e.sent());
                    _e.label = 4;
                case 4:
                    _c.password = _d;
                    return [4 /*yield*/, actions.login(options.email, options.password)];
                case 5:
                    _e.sent();
                    helpers_1.logSuccess('Logged in your impot.gouv.fr account');
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _e.sent();
                    helpers_1.logError('something was wrong during login to impots.gouv.fr : ' + error_1.message);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); });
};
