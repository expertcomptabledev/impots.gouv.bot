'use strict';
var _this = this;
exports.__esModule = true;
var tslib_1 = require('tslib');
var login_1 = require('./login');
var const_1 = require('./const');
var flat = require('array.prototype.flat');
var logger_1 = require('../helpers/logger');
var COMPANIES_URL = 'https://cfspro.impots.gouv.fr/mire/afficherChoisirDossier.do?idth=dossier2&action=tousMesDossier';
exports.getCompanies = function(email, password, close) {
  if (close === void 0) {
    close = true;
  }
  return tslib_1.__awaiter(_this, void 0, void 0, function() {
    var _a, browser, page_1, links, extractCompanies_1, companies, _b, _c, error_1;
    var _this = this;
    return tslib_1.__generator(this, function(_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 6, , 7]);
          return [4 /*yield*/, login_1.login(email, password, false)];
        case 1:
          (_a = _d.sent()), (browser = _a.browser), (page_1 = _a.page);
          if (!browser || !page_1) {
            throw new Error('browser and page not sent by login feature');
          }
          return [
            4 /*yield*/,
            page_1.goto(COMPANIES_URL, {
              timeout: const_1.TIMEOUT,
              waitUntil: 'domcontentloaded',
            }),
          ];
        case 2:
          _d.sent();
          return [
            4 /*yield*/,
            page_1.evaluate(function() {
              return Array.from(document.querySelectorAll('#ins_contenu > ul li > a'))
                .map(function(node) {
                  return node.href;
                })
                .filter(function(item, pos, self) {
                  return self.indexOf(item) == pos;
                });
            }),
          ];
        case 3:
          links = _d.sent();
          extractCompanies_1 = function(page) {
            return tslib_1.__awaiter(_this, void 0, void 0, function() {
              return tslib_1.__generator(this, function(_a) {
                switch (_a.label) {
                  case 0:
                    return [
                      4 /*yield*/,
                      page.evaluate(function() {
                        return Array.from(
                          document.querySelectorAll('#ins_contenu > form > table.listing.onecol > tbody label'),
                        )
                          .map(function(node) {
                            return node.textContent;
                          })
                          .map(function(company) {
                            return company.split('SIREN');
                          })
                          .map(function(companyData) {
                            return { name: companyData[0].trim(), siren: companyData[1].trim() };
                          })
                          .filter(function(item, pos, self) {
                            return self.indexOf(item) == pos;
                          });
                      }),
                    ];
                  case 1:
                    return [2 /*return*/, _a.sent()];
                }
              });
            });
          };
          return [4 /*yield*/, extractCompanies_1(page_1)];
        case 4:
          companies = _d.sent();
          _c = (_b = companies).concat;
          return [
            4 /*yield*/,
            Promise.all(
              links.map(function(link) {
                return tslib_1.__awaiter(_this, void 0, void 0, function() {
                  return tslib_1.__generator(this, function(_a) {
                    switch (_a.label) {
                      case 0:
                        return [
                          4 /*yield*/,
                          page_1.goto(link, {
                            timeout: const_1.TIMEOUT,
                            waitUntil: 'domcontentloaded',
                          }),
                        ];
                      case 1:
                        _a.sent();
                        return [4 /*yield*/, extractCompanies_1(page_1)];
                      case 2:
                        return [2 /*return*/, _a.sent()];
                    }
                  });
                });
              }),
            ),
          ];
        case 5:
          companies = _c.apply(_b, [_d.sent()]);
          companies = flat(companies);
          browser.close();
          return [2 /*return*/, companies];
        case 6:
          error_1 = _d.sent();
          logger_1.logError('Something was wrong during get companies');
          logger_1.logError(error_1);
          return [3 /*break*/, 7];
        case 7:
          return [2 /*return*/];
      }
    });
  });
};
