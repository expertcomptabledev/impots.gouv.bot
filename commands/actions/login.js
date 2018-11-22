"use strict";
var _this = this;
exports.__esModule = true;
var tslib_1 = require("tslib");
var const_1 = require("./const");
var CLI = require('clui');
var Spinner = CLI.Spinner;
var puppeteer = require('puppeteer');
var logger_1 = require("../helpers/logger");
var IMPOTS_AUTH_URL = 'https://cfspro.impots.gouv.fr/mire/accueil.do';
exports.login = function (email, password, close) {
    if (close === void 0) { close = true; }
    return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var status, page, browser, browser_1, response, error_1;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!email) {
                        throw new Error('email must be filled');
                    }
                    if (!password) {
                        throw new Error('password must be filled');
                    }
                    status = new Spinner('Authenticating you to impots.gouv.fr, please wait...');
                    status.start();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 13, , 18]);
                    return [4 /*yield*/, puppeteer.launch({
                            headless: true,
                            args: [
                                '--no-sandbox',
                                '--disable-setuid-sandbox',
                                '--disable-dev-shm-usage',
                            ]
                        })];
                case 2:
                    browser_1 = _a.sent();
                    return [4 /*yield*/, browser_1.newPage()];
                case 3:
                    page = _a.sent();
                    return [4 /*yield*/, page.goto(IMPOTS_AUTH_URL, {
                            waitUntil: 'networkidle0',
                            timeout: const_1.TIMEOUT
                        })];
                case 4:
                    _a.sent();
                    page.on('request', function (req) {
                        // log(req.url());
                    });
                    return [4 /*yield*/, page.type('#LMDP_Spi_tmp', email)];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, page.type('#LMDP_Password_tmp', password)];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, Promise.all([
                            page.waitForNavigation({
                                timeout: const_1.TIMEOUT
                            }),
                            page.$eval('#lmdp > div > form', function (form) { return form.submit(); })
                        ])];
                case 7:
                    response = (_a.sent())[0];
                    return [4 /*yield*/, page.waitForSelector("#mon_cpte", {
                            timeout: const_1.TIMEOUT
                        })];
                case 8:
                    _a.sent();
                    if (!(close === true)) return [3 /*break*/, 11];
                    return [4 /*yield*/, page.close()];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, browser_1.close()];
                case 10:
                    _a.sent();
                    status.stop();
                    return [2 /*return*/];
                case 11:
                    status.stop();
                    return [2 /*return*/, { browser: browser_1, page: page }];
                case 12: return [3 /*break*/, 18];
                case 13:
                    error_1 = _a.sent();
                    status.stop();
                    if (!page) return [3 /*break*/, 15];
                    return [4 /*yield*/, page.close()];
                case 14:
                    _a.sent();
                    _a.label = 15;
                case 15:
                    if (!browser) return [3 /*break*/, 17];
                    return [4 /*yield*/, browser.close()];
                case 16:
                    _a.sent();
                    _a.label = 17;
                case 17:
                    logger_1.logError('Error during impot login');
                    logger_1.logError(error_1);
                    return [3 /*break*/, 18];
                case 18: return [2 /*return*/];
            }
        });
    });
};
