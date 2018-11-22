"use strict";
var _this = this;
exports.__esModule = true;
var tslib_1 = require("tslib");
var inquirer = require('inquirer');
exports.getCredentials = function (options) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var _a, _b, _c, _d;
    return tslib_1.__generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _a = options;
                _b = options.email;
                if (_b) return [3 /*break*/, 2];
                return [4 /*yield*/, inquirer.prompt([{
                            name: 'email',
                            message: 'Enter your email'
                        }]).then(function (res) { return res.email; })];
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
                return [2 /*return*/, options];
        }
    });
}); };
