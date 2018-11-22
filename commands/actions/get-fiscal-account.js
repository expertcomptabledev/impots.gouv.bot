"use strict";
var _this = this;
exports.__esModule = true;
var tslib_1 = require("tslib");
var login_1 = require("./login");
var const_1 = require("./const");
exports.getFiscalAccount = function (email, password, siren, close) {
    if (close === void 0) { close = true; }
    return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var url, _a, browser, page, selector, textCheminFer;
        return tslib_1.__generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    url = "https://cfspro.impots.gouv.fr/webadelie/servlet/consulterEntreprise.html?&vue=usager&t=L&siren=" + siren;
                    return [4 /*yield*/, login_1.login(email, password, false)];
                case 1:
                    _a = _b.sent(), browser = _a.browser, page = _a.page;
                    return [4 /*yield*/, page.goto(url, {
                            timeout: const_1.TIMEOUT
                        })];
                case 2:
                    _b.sent();
                    selector = '#chemin_de_fer > a';
                    return [4 /*yield*/, page.waitForSelector(selector, { timeout: const_1.TIMEOUT })];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, page.evaluate(function (selector) { return document.querySelector(selector).textContent; }, selector)];
                case 4:
                    textCheminFer = _b.sent();
                    if (textCheminFer.indexOf('compte fiscal') > -1) {
                        return [2 /*return*/, { browser: browser, page: page }];
                    }
                    else {
                        throw new Error('Something looks wrong during get fiscal account');
                    }
                    return [2 /*return*/];
            }
        });
    });
};
