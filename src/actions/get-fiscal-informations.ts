// get tva and resultats informations
import { login } from './login';
import { TIMEOUT } from './const';
declare var document;
import { log, logError, logSuccess, logPending, logJSON, logWarn } from '../helpers/logger';
import { getFiscalAccount, getFiscalAccountFromLoggedSession } from './get-fiscal-account';
import { getLink, typesDeclaration } from './declarations';
import { getFiscalLinks } from './get-fiscal-links';

import { clean } from '../helpers/clean';

export enum Impots {
    BIC = 'BIC',
    BNC = 'BNC',
    IS = 'IS' // IS is in last position due to bug into impots.gouv -> do not move this
}

export enum RegimesFiscaux {
    REEL_NORMAL = 'Réel simplifié d\'imposition',
    REEL_SIMPLIFIE = 'Réel normal',
    DECLARATION_CONTROLEE = 'Déclaration contrôlée'
}

export enum RegimesTVA {
    MINI_REEL = "Miniréel",
    REEL = "Réel normal",
    RSI = "Réel simplifié d'imposition",
    FRANCHISE = "Franchise en base"
}

export const getFiscalInformationsFromSirenArray = async (email: string, password: string, sirens: Array<string>, close = true) => {

    const results = {} ;

    if(sirens && sirens.length >= 1) {

        // get first result
        const { browser, page } = await getFiscalAccount(email, password, sirens[0])
        const res = await doWork(browser, page);
        results[sirens[0]] = res;

        sirens.splice(0,1);

        // iterate
        for await(let s of sirens) {

            const { browser: b, page: p } = await getFiscalAccountFromLoggedSession(browser, page, s);
            const res = await doWork(b, p);
            results[s] = res;

        }

        clean(browser);

    }

    return results;

}

export const getFiscalInformationsFromLoggedSession = async (browser, page, siren) => {
    const { browser: b, page: p } = await getFiscalAccountFromLoggedSession(browser, page, siren);
    return await doWork(b, p);
}

export const getFiscalInformations = async (email: string, password: string, siren: string, close = true) => {

    const { browser, page } = await getFiscalAccount(email, password, siren);
    const res = await doWork(browser, page);
    clean(browser);
    return res;

};

const doWork = async (browser, page) => {

    // get tva informations
    const links = await getFiscalLinks(page);
    await page.goto(await getLink(links, typesDeclaration.tva), { timeout: TIMEOUT });

    const title = await page.evaluate(() => {
        return document.querySelector('#titre').textContent;
    });

    // parse title : "Miniréel" "Réel normal" "Réel simplifié d'imposition" ? 
    const tva = getRegimeFromEnum(title, RegimesTVA);

    const linkRegimeFiscal = await getLink(links, 'DeclarationsRP');

    // go to page
    await page.goto(linkRegimeFiscal);
    const titleRegime = await page.evaluate(() => {
        return document.querySelector('#titre').textContent;
    });

    const impot = getRegimeFromEnum(linkRegimeFiscal, Impots);
    const regimeFiscal = getRegimeFromEnum(titleRegime, RegimesFiscaux);


    return { tva, impot, regimeFiscal };
}

export const getRegimeFromEnum = (text: string, myEnum) => {

    let res;
    
    Object.keys(myEnum)
        .map(key => {
            const val = myEnum[key];
            if(text.indexOf(val) > -1) {
                res = myEnum[key];
            }
        });

    return res;

}
