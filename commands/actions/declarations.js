"use strict";
var _this = this;
exports.__esModule = true;
var tslib_1 = require("tslib");
var get_fiscal_account_1 = require("./get-fiscal-account");
var get_fiscal_links_1 = require("./get-fiscal-links");
var logger_1 = require("../helpers/logger");
var const_1 = require("./const");
var PromisePool = require('es6-promise-pool');
var _a = require('fs'), mkdirSync = _a.mkdirSync, existsSync = _a.existsSync, writeFile = _a.writeFile;
var join = require('path').join;
var promisify = require('util').promisify;
var CLI = require('clui');
var Spinner = CLI.Spinner;
var flat = require('array.prototype.flat');
var typesDeclaration = {
    'tva': 'DeclarationsTVA'
};
exports.declarations = function (type, email, password, siren, save, out, close) {
    if (save === void 0) { save = false; }
    if (out === void 0) { out = undefined; }
    if (close === void 0) { close = true; }
    return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var status, clean, getLink, _a, browser, page, links, _b, _c, declarations_1, _d, linksToScrap_1, count_1, concurrency, promiseProducer, pool, error_1;
        var _this = this;
        return tslib_1.__generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!typesDeclaration[type]) {
                        throw new Error('Declaration type not valid');
                    }
                    else {
                        type = typesDeclaration[type];
                    }
                    status = new Spinner('Getting declarations, please wait...');
                    status.start();
                    clean = function (browser, page) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                        return tslib_1.__generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, page.close()];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, browser.close()];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    getLink = function (links, _type) {
                        if (Array.isArray(links)) {
                            return links.filter(function (l) { return l.indexOf(_type) > -1; })[0] || null;
                        }
                        else {
                            throw new Error('No links provided');
                        }
                    };
                    return [4 /*yield*/, get_fiscal_account_1.getFiscalAccount(email, password, siren, false)];
                case 1:
                    _a = _e.sent(), browser = _a.browser, page = _a.page;
                    _e.label = 2;
                case 2:
                    _e.trys.push([2, 13, , 15]);
                    return [4 /*yield*/, get_fiscal_links_1.getFiscalLinks(page)];
                case 3:
                    links = _e.sent();
                    _c = (_b = page).goto;
                    return [4 /*yield*/, getLink(links, type)];
                case 4: 
                // log('got all fiscal links here :')
                // logJSON(links);
                return [4 /*yield*/, _c.apply(_b, [_e.sent(), { timeout: const_1.TIMEOUT }])];
                case 5:
                    // log('got all fiscal links here :')
                    // logJSON(links);
                    _e.sent();
                    _d = flat;
                    return [4 /*yield*/, page.evaluate(function () {
                            return Array.from(document.querySelectorAll('.tableau_pliable'))
                                .map(function (tableau) {
                                // année dans child h1 > span
                                var year = tableau.querySelector('h1 > span').textContent.trim().match(/\d{4}/g);
                                if (Array.isArray(year) && year.length === 1) {
                                    year = year[0];
                                }
                                // déclaration dans les tr SAUF la première qui contient les entêtes
                                var lines = tableau.querySelectorAll('tr');
                                var getPeriod = function (periodText) {
                                    if (periodText.indexOf("«") > -1) {
                                        periodText.split("«")[0];
                                    }
                                    else {
                                        return periodText;
                                    }
                                };
                                var getReceiptCode = function (periodText) {
                                    if (periodText.indexOf("«") > -1) {
                                        periodText.split("«")[1].slice(0, -1);
                                    }
                                    else {
                                        return periodText;
                                    }
                                };
                                var declarations = [];
                                for (var index = 1; index < lines.length; index++) {
                                    var line = lines[index];
                                    // get td
                                    var cells = line.querySelectorAll('td');
                                    declarations.push({
                                        year: year,
                                        period: getPeriod(cells[0].textContent.trim()),
                                        receiptCode: getReceiptCode(cells[0].textContent.trim()),
                                        taxSystem: cells[1].textContent.trim(),
                                        type: cells[2].textContent.trim(),
                                        depositMode: cells[3].textContent.trim(),
                                        depositDate: cells[4].textContent.trim(),
                                        amount: cells[5].textContent.trim(),
                                        declarationLink: cells[0].querySelectorAll('a')[0].href,
                                        receiptLink: cells[0].querySelectorAll('a')[1] ? cells[0].querySelectorAll('a')[1].href : undefined
                                    });
                                }
                                return declarations;
                            });
                        })];
                case 6:
                    declarations_1 = _d.apply(void 0, [_e.sent()]);
                    linksToScrap_1 = [];
                    declarations_1.forEach(function (declaration) {
                        linksToScrap_1.push(declaration.receiptLink);
                        linksToScrap_1.push(declaration.declarationLink);
                    });
                    if (!(save === true)) return [3 /*break*/, 9];
                    // logJSON(linksToScrap);
                    return [4 /*yield*/, page.setDefaultNavigationTimeout(30 * 1000 * 2)];
                case 7:
                    // logJSON(linksToScrap);
                    _e.sent();
                    count_1 = 0, concurrency = 3;
                    promiseProducer = function () {
                        if (count_1 < linksToScrap_1.length) {
                            count_1++;
                            return exports.getDocument(browser, linksToScrap_1[count_1 - 1], out); // TODO : better log avancement
                        }
                        else {
                            return null;
                        }
                    };
                    pool = new PromisePool(promiseProducer, concurrency);
                    return [4 /*yield*/, pool.start()];
                case 8:
                    _e.sent();
                    _e.label = 9;
                case 9:
                    status.stop();
                    if (!(close === true)) return [3 /*break*/, 11];
                    return [4 /*yield*/, clean(browser, page)];
                case 10:
                    _e.sent();
                    return [2 /*return*/, declarations_1];
                case 11: return [2 /*return*/, { browser: browser, page: page }];
                case 12: return [3 /*break*/, 15];
                case 13:
                    error_1 = _e.sent();
                    status.stop();
                    return [4 /*yield*/, clean(browser, page)];
                case 14:
                    _e.sent();
                    throw error_1;
                case 15: return [2 /*return*/];
            }
        });
    });
};
exports.getDocument = function (browser, link, out) {
    if (out === void 0) { out = './out'; }
    return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var page, menuSelector, error_2, links, linkPrint, response, myUrl, params, idPdf, downloadLink, file, arr, buffer, filename, write;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!link)
                        return [2 /*return*/];
                    return [4 /*yield*/, browser.newPage()];
                case 1:
                    page = _a.sent();
                    // logPending(`Get document ${link}`)
                    return [4 /*yield*/, page.goto(link, {
                            timeout: const_1.TIMEOUT,
                            waitUntil: 'domcontentloaded'
                        })];
                case 2:
                    // logPending(`Get document ${link}`)
                    _a.sent();
                    menuSelector = '#menuPdf > ul a';
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, page.waitForSelector(menuSelector, { timeout: 10000 })];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    error_2 = _a.sent();
                    logger_1.logError('can\t load print menu');
                    return [3 /*break*/, 6];
                case 6: return [4 /*yield*/, page.evaluate(function (menuSelector) {
                        return Array.from(document.querySelectorAll(menuSelector))
                            .map(function (node) { return node.href; })
                            .filter(function (item, pos, self) {
                            return self.indexOf(item) == pos;
                        });
                    }, menuSelector)];
                case 7:
                    links = _a.sent();
                    linkPrint = links.filter(function (l) { return l.indexOf("lancerImpression") > -1; })[0] || null;
                    if (!!linkPrint) return [3 /*break*/, 8];
                    return [2 /*return*/, null];
                case 8: return [4 /*yield*/, page.goto(linkPrint, { timeout: const_1.TIMEOUT, waitUntil: 'domcontentloaded' })];
                case 9:
                    response = _a.sent();
                    return [4 /*yield*/, response.url()];
                case 10:
                    myUrl = _a.sent();
                    params = require('querystring').parse(myUrl);
                    idPdf = params.idPdf;
                    // log(`pdfId : ${idPdf}`)
                    return [4 /*yield*/, page.waitForFunction(function (pdfId) {
                            if (!pdfId)
                                return false;
                            var res = Array.from(document.querySelectorAll('.outil a'))
                                .map(function (node) { return node.href; })
                                .filter(function (a) { return a.indexOf(pdfId) > -1 && a.indexOf('getPdf') > -1; });
                            return res.length > 0;
                        }, { timeout: 60000, polling: 100 }, idPdf)
                        // print asked wait to recuperate
                    ];
                case 11:
                    // log(`pdfId : ${idPdf}`)
                    _a.sent();
                    return [4 /*yield*/, page.evaluate(function (pdfId) {
                            return Array.from(document.querySelectorAll('.outil a'))
                                .map(function (node) { return node.href; })
                                .filter(function (a) { return a.indexOf(pdfId) > -1; })[0];
                        }, idPdf)
                        // log(`Got link to download pdf ${idPdf} :`)
                        // log(downloadLink)
                    ];
                case 12:
                    downloadLink = _a.sent();
                    return [4 /*yield*/, page.evaluate(function (downloadLink) {
                            var bufferToArray = function (buffer) { return Object.values(new Uint8Array(buffer)); };
                            return fetch(downloadLink, { credentials: 'include' })
                                .then(function (response) { return response.arrayBuffer(); })
                                .then(function (buffer) { return bufferToArray(buffer); });
                        }, downloadLink)];
                case 13:
                    file = _a.sent();
                    if (!existsSync(out))
                        mkdirSync(out);
                    arr = new Uint8Array(file);
                    buffer = Buffer.from(arr);
                    filename = join(process.cwd(), out + "/" + idPdf + ".pdf");
                    write = promisify(writeFile);
                    return [4 /*yield*/, write(filename, buffer)];
                case 14:
                    _a.sent();
                    page.close();
                    return [2 /*return*/, { link: link, idPdf: idPdf, filename: filename }];
            }
        });
    });
};
