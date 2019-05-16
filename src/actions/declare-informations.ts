import { selectCompany } from './select-company';

import { log, logError, logSuccess, logPending, logJSON, logWarn } from '../helpers/logger';
import { TIMEOUT } from './const';
import { DeclareInformation } from '../models';
declare var document, fetch;
var PromisePool = require('es6-promise-pool');
const { mkdirSync, existsSync, writeFile } = require('fs');
const { join } = require('path');
const { promisify } = require('util');
const CLI = require('clui');
const Spinner = CLI.Spinner;
var flat = require('array.prototype.flat');

const DECLARE_TVA_URL = 'https://cfspro.impots.gouv.fr/mire/afficherChoisirOCFI.do?idth=declarer.e-declaration.tva&action=declarer';

const DECLARE_IS_URL = `https://cfspro.impots.gouv.fr/mire/afficherChoisirOCFI.do?idth=declarer.e-declaration.is&action=declarer-is`;

const DECLARE_TS_URL = `https://cfspro.impots.gouv.fr/mire/afficherChoisirOCFI.do?idth=declarer.e-declaration.ts&action=declarer-ts`;

const DECLARE_CVAE_URL = `https://cfspro.impots.gouv.fr/mire/afficherChoisirOCFI.do?idth=declarer.e-declaration.cvae&action=declarer-cvae`;

const DECLARE_RCM_URL = `https://cfspro.impots.gouv.fr/mire/afficherChoisirOCFI.do?idth=declarer.e-declaration.rcm&action=declarer-rcm`;

const DECLARE_RES = `https://cfspro.impots.gouv.fr/mire/afficherChoisirOCFI.do?idth=declarer.e-declaration.resultat&action=declarer-resultat`;

const TYPES = ['TVA', 'IS', 'TS', 'CVAE', 'RCM', 'RES'];

const getAllDeclareInformations = async (
    email: string,
    password: string,
    siren: string
  ) => {

    const res = [];

    try {
        let context = await selectCompany(email, password, siren);
        for (let i = 0; i < TYPES.length; i++) {
            const type = TYPES[i];
            const close = i === (TYPES.length - 1) ? true : false;
            const r = await getDeclareInformations(type, email, password, siren, close, Object.assign({}, context, { companySet: true }));
            res.push(r)
        }
    } catch (e) {

    } finally {
        return flat(res);
    }

}

export const getDeclareInformations = async (
    type: string,
    email: string,
    password: string,
    siren: string,
    close = true,
    context?: { browser: any, page: any, companySet: boolean }
  ) => {

    let url, path;
    switch (type) {
        case 'TVA':
            url = DECLARE_TVA_URL;
            path = 'efitvamapi';
            break;
        case 'IS': 
            url = DECLARE_IS_URL;
            path = `efipromapi`;
            break;
        case 'TS':
            url = DECLARE_TS_URL;
            path = `efipromapi`;
            break;
        case 'CVAE':
            url = DECLARE_CVAE_URL;
            path = `efipromapi`;
            break;
        case 'RCM':
            url = DECLARE_RCM_URL;
            path = `efipromapi`;
            break;
        case 'RES':
            url = DECLARE_RES;
            path = `efipromapi`;
    }

    if(!url && !path) {

        return await getAllDeclareInformations(email, password, siren);

    } else {
  
        const status = new Spinner(`Getting ${type} declare informations, please wait...`);

        status.start();
    
        let browser, page, declarations: Array<DeclareInformation> = [], pageDeclarations;

        const pageClosedHandler = (timeout = 1500): Promise<any> => new Promise( async (resolve, reject) => {
            let done = false;
            setTimeout(() => {
                if(done === false) {
                    reject(`Timeout fired`);
                }
            }, timeout);

            browser.on('targetdestroyed',async (target) => {
                const p = await target.page();
                resolve(p);
            });
        })

        const clean = async (browser, page) => {
            await page.close();
            await pageClosedHandler();
            await browser.close();
        };

        try {

            if(context && context.browser && context.page && context.companySet === true) {
                browser = context.browser;
                page = context.page;
            } else {
                let res = await selectCompany(email, password, siren);
                browser = res.browser;
                page = res.page;
            }

            await page.goto(url, { timeout: TIMEOUT });

            const newPageHandler = (timeout = 1500): Promise<any> => new Promise(async (resolve, reject) => {

                let done = false;
                setTimeout(() => {
                    if(done === false) {
                        reject(`Timeout fired`);
                    }
                }, timeout);

                browser.on('targetcreated',async (target) => {
                    const p = await target.page();
                    resolve(p);
                });

            })

            const selector = '#ins_contenu > form > table.buttonsDouble > tbody > tr > td.buttonsDoubleDec > input[type=image]';
            await page.waitForSelector(selector, { timeout: TIMEOUT });
            await page.$eval('#ins_contenu > form', form => form.submit());

            pageDeclarations = await newPageHandler();

            await pageDeclarations.waitForSelector('#periodeCalcule > table', { timeout: TIMEOUT });
            await Promise.all([
                pageDeclarations.waitForNavigation({ timeout: TIMEOUT }),
                pageDeclarations.goto(`https://cfspro.impots.gouv.fr/${path}/afficherContexte2.html`, { timeout: TIMEOUT })
            ])

            await pageDeclarations.waitForSelector('#periodeCalcule > table', { timeout: TIMEOUT });
            
            declarations = await pageDeclarations.evaluate(() => {

                const tableau = document.querySelector('#periodeCalcule > table');
                const lines = tableau.querySelectorAll('tr');

                const declarations = [];
                for (let index = 1; index < lines.length; index++) {
                    const line = lines[index];
                    // get td
                    const cells = line.querySelectorAll('td');
                    if(cells.length === 4) {
                        declarations.push({
                            period: cells[0].textContent.trim(),
                            limitDate: cells[1].textContent.trim(),
                            type: cells[2].textContent.trim(),
                            depositDate: cells[3].textContent.trim(),
                        });
                    }
                }
                return declarations;

            });

            if(pageDeclarations) {
                await pageDeclarations.close();
                await pageClosedHandler();
            }

        } catch (error) {

        } finally {

            status.stop();

            if(close === true) {
                await clean(browser, page);
            }

            return declarations;

        }

    }

  };
