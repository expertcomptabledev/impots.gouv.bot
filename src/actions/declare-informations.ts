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

    for (let i = 0; i < TYPES.length; i++) {
        const type = TYPES[i];
        const r = await getDeclareInformations(type, email, password, siren);
        res.push(r)
    }

    return flat(res);

}

export const getDeclareInformations = async (
    type: string,
    email: string,
    password: string,
    siren: string
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
    
        const clean = async (browser, page) => {
        await page.close();
        await browser.close();
        };

        let { browser, page } = await selectCompany(email, password, siren);

        try {

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

            const pageDeclarations = await newPageHandler();

            await pageDeclarations.waitForSelector('#periodeCalcule > table', { timeout: TIMEOUT });
            await Promise.all([
                pageDeclarations.waitForNavigation({ timeout: TIMEOUT }),
                pageDeclarations.goto(`https://cfspro.impots.gouv.fr/${path}/afficherContexte2.html`, { timeout: TIMEOUT })
            ])
            await pageDeclarations.waitForSelector('#periodeCalcule > table', { timeout: TIMEOUT });
            
            const declarations: Array<DeclareInformation> = await pageDeclarations.evaluate(() => {

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

            status.stop();

            await clean(browser, page);
            return declarations;

        } catch (error) {
            await clean(browser, page);
            return [];
        }
    }

  };
