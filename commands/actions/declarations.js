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
var typesDeclaration = {
    'tva': 'DeclarationsTVA'
};
exports.declarations = function (type, email, password, siren, save, out, close) {
    if (save === void 0) { save = false; }
    if (out === void 0) { out = undefined; }
    if (close === void 0) { close = true; }
    return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var clean, getLink, _a, browser, page, links, _b, _c, declarationsByYear, linksToScrap, count_1, concurrency, promiseProducer, pool;
        var _this = this;
        return tslib_1.__generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!typesDeclaration[type]) {
                        throw new Error('Declaration type not valid');
                    }
                    else {
                        type = typesDeclaration[type];
                    }
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
                    _a = _d.sent(), browser = _a.browser, page = _a.page;
                    return [4 /*yield*/, get_fiscal_links_1.getFiscalLinks(page)];
                case 2:
                    links = _d.sent();
                    logger_1.log('got all fiscal links here :');
                    logger_1.logJSON(links);
                    _c = (_b = page).goto;
                    return [4 /*yield*/, getLink(links, type)];
                case 3: return [4 /*yield*/, _c.apply(_b, [_d.sent(), { timeout: const_1.TIMEOUT }])];
                case 4:
                    _d.sent();
                    return [4 /*yield*/, page.evaluate(function () {
                            return Array.from(document.querySelectorAll('.tableau_pliable'))
                                .map(function (tableau) {
                                // année dans child h1 > span
                                var year = tableau.querySelector('h1 > span').textContent.trim();
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
                                return {
                                    year: year,
                                    declarations: declarations
                                };
                            });
                        })];
                case 5:
                    declarationsByYear = _d.sent();
                    linksToScrap = [];
                    declarationsByYear.forEach(function (declarationYear) {
                        var declarations = declarationYear.declarations;
                        declarations.forEach(function (d) {
                            linksToScrap.push(d.receiptLink);
                            linksToScrap.push(d.declarationLink);
                        });
                    });
                    if (!(save === true)) return [3 /*break*/, 8];
                    // logJSON(linksToScrap);
                    return [4 /*yield*/, page.setDefaultNavigationTimeout(30 * 1000 * 2)];
                case 6:
                    // logJSON(linksToScrap);
                    _d.sent();
                    count_1 = 0, concurrency = 3;
                    promiseProducer = function () {
                        if (count_1 < linksToScrap.length) {
                            count_1++;
                            return exports.getDocument(browser, linksToScrap[count_1 - 1], out);
                        }
                        else {
                            return null;
                        }
                    };
                    pool = new PromisePool(promiseProducer, concurrency);
                    return [4 /*yield*/, pool.start()];
                case 7:
                    _d.sent();
                    _d.label = 8;
                case 8:
                    if (!(close === true)) return [3 /*break*/, 10];
                    return [4 /*yield*/, clean(browser, page)];
                case 9:
                    _d.sent();
                    return [2 /*return*/, declarationsByYear];
                case 10: return [2 /*return*/, { browser: browser, page: page }];
            }
        });
    });
};
exports.getDocument = function (browser, link, out) {
    if (out === void 0) { out = './out'; }
    return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var page, menuSelector, error_1, links, linkPrint, response, myUrl, params, idPdf, downloadLink, file, arr, buffer, filename, write;
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
                    error_1 = _a.sent();
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
                        }, { timeout: 60000, polling: 500 }, idPdf)
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
                    filename = join(__dirname, out + "/" + idPdf + ".pdf");
                    write = promisify(writeFile);
                    return [4 /*yield*/, write(filename, buffer)];
                case 14:
                    _a.sent();
                    logger_1.logSuccess("Got PDF " + idPdf + " and save it to " + filename);
                    page.close();
                    return [2 /*return*/, { link: link, idPdf: idPdf, filename: filename }];
            }
        });
    });
};