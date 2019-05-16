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

export const getAllDeclareInformations = async (
    email: string,
    password: string,
    siren: string,
    close = true
  ) => {

    const rs = await Promise.all(TYPES.map(t => getDeclareInformations(t, email, password, siren, close)));
    return flat(rs);

}

export const getDeclareInformations = async (
    type: string,
    email: string,
    password: string,
    siren: string,
    close = true
  ) => {

    if (!type) {
      throw new Error('Declaration type not valid');
    }

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
        default:
            return await getAllDeclareInformations(email, password, siren, close);
    }
  
    const status = new Spinner(`Getting ${type} declare informations, please wait...`);

    status.start();
  
    const clean = async (browser, page) => {
      await page.close();
      await browser.close();
    };
  
    try {
  
        const { browser, page } = await selectCompany(email, password, siren);

        // 1. navigate to this page
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
  
        if (close === true) {

            await clean(browser, page);
            return declarations || [];

        } else {
            return { browser, page };
        }

    } catch (error) {

        status.stop();
        // await clean(browser, page);
        throw error;

    }

  };




// 2. click on this button and wait navigation
// <input type="image" name="button.submitValider" src="ressources/images/but_declarer.gif" onclick="this.blur();return validateForm(this.form);" title="Valider" alt="Valider">

// 3. whenn new target opened and loaded scrap table

// get all declarations in past thats work only after 3.
// https://cfspro.impots.gouv.fr/efitvamapi/afficherContexte2.html

// scrap this to extract informations
/*
<div id="espaceDialogue">
<div id="cadrePreliminaire">
    Régime d'imposition :<span class="texteGras">&nbsp;Miniréel</span>
    <br>
    Activité :<span class="texteGras">&nbsp;Fabrication de produits électroniques grand public</span>
    <br>
    Commune de l'adresse fiscale de taxation :<span class="texteGras">&nbsp;PARIS 09</span>
    </div>

<form id="formContexte" method="post" class="invisible">
    <input type="hidden" name="token" value="4287-9Y5T-VVW9-QKKP-3VPR-WY1T-46I0-9JK8">
</form>

<div id="PeriodesPreCalculees" class="blocBandeau">

    <div class="bandeauAffichage">
        <div class="partieDroiteCadre">
            <div class="bandeauOrange">
                1 - Sélectionnez dans le tableau suivant la période de votre déclaration</div>
            <div id="periodeCalcule" class="zoneMessageBeige">

                <table>
                    <tbody><tr>
                        <th id="t1" class="t1">Période d'imposition</th>
                        <th id="t2" class="t2">Date limite de dépôt</th>
                        <th id="t3" class="t3">Type de déclaration</th>
                        <th id="t4" class="t4">Date de dépôt</th>
                    </tr>

                    <tr class="ligneTab periode">
                                <td headers="t1" class="t1">
                                    <a name="periode0" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '01/01/2019', 'dateFinPeriode', '31/03/2019', 'dld', '24/04/2019');">1er trimestre 2019</a></td>
                                <td headers="t2" class="t2">24/04/2019</td>
                                <td headers="t3" class="t3">3310CA3</td>
                                <td headers="t4" class="t4">
                                    <a name="periode0" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '01/01/2019', 'dateFinPeriode', '31/03/2019', 'dld', '24/04/2019');">24/04/2019</a></td>
                            </tr>
                        <tr class="ligneTab periode">
                                <td headers="t1" class="t1">
                                    <a name="periode1" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '01/12/2018', 'dateFinPeriode', '31/12/2018', 'dld', '24/01/2019');">Décembre 2018</a></td>
                                <td headers="t2" class="t2">24/01/2019</td>
                                <td headers="t3" class="t3">3310CA3</td>
                                <td headers="t4" class="t4">
                                    <a name="periode1" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '01/12/2018', 'dateFinPeriode', '31/12/2018', 'dld', '24/01/2019');">05/02/2019</a></td>
                            </tr>
                        <tr class="ligneTab periode">
                                <td headers="t1" class="t1">
                                    <a name="periode2" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '01/11/2018', 'dateFinPeriode', '30/11/2018', 'dld', '24/12/2018');">Novembre 2018</a></td>
                                <td headers="t2" class="t2">24/12/2018</td>
                                <td headers="t3" class="t3">3310CA3</td>
                                <td headers="t4" class="t4">
                                    <a name="periode2" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '01/11/2018', 'dateFinPeriode', '30/11/2018', 'dld', '24/12/2018');">26/12/2018</a></td>
                            </tr>
                        <tr class="ligneTab periode">
                                <td headers="t1" class="t1">
                                    <a name="periode3" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '01/10/2018', 'dateFinPeriode', '31/10/2018', 'dld', '26/11/2018');">Octobre 2018</a></td>
                                <td headers="t2" class="t2">26/11/2018</td>
                                <td headers="t3" class="t3">3310CA3</td>
                                <td headers="t4" class="t4">
                                    <a name="periode3" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '01/10/2018', 'dateFinPeriode', '31/10/2018', 'dld', '26/11/2018');">23/11/2018</a></td>
                            </tr>
                        <tr class="ligneTab periode">
                                <td headers="t1" class="t1">
                                    <a name="periode4" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '01/09/2018', 'dateFinPeriode', '30/09/2018', 'dld', '24/10/2018');">Septembre 2018</a></td>
                                <td headers="t2" class="t2">24/10/2018</td>
                                <td headers="t3" class="t3">3310CA3</td>
                                <td headers="t4" class="t4">
                                    <a name="periode4" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '01/09/2018', 'dateFinPeriode', '30/09/2018', 'dld', '24/10/2018');">22/10/2018</a></td>
                            </tr>
                        <tr class="ligneTab periode">
                                <td headers="t1" class="t1">
                                    <a name="periode5" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '01/08/2018', 'dateFinPeriode', '31/08/2018', 'dld', '24/09/2018');">Août 2018</a></td>
                                <td headers="t2" class="t2">24/09/2018</td>
                                <td headers="t3" class="t3">3310CA3</td>
                                <td headers="t4" class="t4">
                                    <a name="periode5" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '01/08/2018', 'dateFinPeriode', '31/08/2018', 'dld', '24/09/2018');">26/09/2018</a></td>
                            </tr>
                        <tr class="ligneTab periode">
                                <td headers="t1" class="t1">
                                    <a name="periode6" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '01/07/2018', 'dateFinPeriode', '31/07/2018', 'dld', '24/08/2018');">Juillet 2018</a></td>
                                <td headers="t2" class="t2">24/08/2018</td>
                                <td headers="t3" class="t3">3310CA3</td>
                                <td headers="t4" class="t4">
                                    <a name="periode6" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '01/07/2018', 'dateFinPeriode', '31/07/2018', 'dld', '24/08/2018');">20/08/2018</a></td>
                            </tr>
                        <tr class="ligneTab periode">
                                <td headers="t1" class="t1">
                                    <a name="periode7" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '01/06/2018', 'dateFinPeriode', '30/06/2018', 'dld', '24/07/2018');">Juin 2018</a></td>
                                <td headers="t2" class="t2">24/07/2018</td>
                                <td headers="t3" class="t3">3310CA3</td>
                                <td headers="t4" class="t4">
                                    <a name="periode7" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '01/06/2018', 'dateFinPeriode', '30/06/2018', 'dld', '24/07/2018');">26/07/2018</a></td>
                            </tr>
                        <tr class="ligneTab periode">
                                <td headers="t1" class="t1">
                                    <a name="periode8" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '01/05/2018', 'dateFinPeriode', '31/05/2018', 'dld', '25/06/2018');">Mai 2018</a></td>
                                <td headers="t2" class="t2">25/06/2018</td>
                                <td headers="t3" class="t3">3310CA3</td>
                                <td headers="t4" class="t4">
                                    <a name="periode8" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '01/05/2018', 'dateFinPeriode', '31/05/2018', 'dld', '25/06/2018');">25/06/2018</a></td>
                            </tr>
                        <tr class="ligneTab periode">
                                <td headers="t1" class="t1">
                                    <a name="periode9" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '01/04/2018', 'dateFinPeriode', '30/04/2018', 'dld', '24/05/2018');">Avril 2018</a></td>
                                <td headers="t2" class="t2">24/05/2018</td>
                                <td headers="t3" class="t3">3310CA3</td>
                                <td headers="t4" class="t4">
                                    <a name="periode9" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '01/04/2018', 'dateFinPeriode', '30/04/2018', 'dld', '24/05/2018');">25/05/2018</a></td>
                            </tr>
                        <tr class="ligneTab periode">
                                <td headers="t1" class="t1">
                                    <a name="periode10" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '01/03/2018', 'dateFinPeriode', '31/03/2018', 'dld', '24/04/2018');">Mars 2018</a></td>
                                <td headers="t2" class="t2">24/04/2018</td>
                                <td headers="t3" class="t3">3310CA3</td>
                                <td headers="t4" class="t4">
                                    <a name="periode10" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '01/03/2018', 'dateFinPeriode', '31/03/2018', 'dld', '24/04/2018');">25/04/2018</a></td>
                            </tr>
                        <tr class="ligneTab periode">
                                <td headers="t1" class="t1">
                                    <a name="periode11" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '01/02/2018', 'dateFinPeriode', '28/02/2018', 'dld', '26/03/2018');">Février 2018</a></td>
                                <td headers="t2" class="t2">26/03/2018</td>
                                <td headers="t3" class="t3">3310CA3</td>
                                <td headers="t4" class="t4">
                                    <a name="periode11" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '01/02/2018', 'dateFinPeriode', '28/02/2018', 'dld', '26/03/2018');">10/03/2018</a></td>
                            </tr>
                        <tr class="ligneTab periode">
                                <td headers="t1" class="t1">
                                    <a name="periode12" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '01/01/2018', 'dateFinPeriode', '31/01/2018', 'dld', '26/02/2018');">Janvier 2018</a></td>
                                <td headers="t2" class="t2">26/02/2018</td>
                                <td headers="t3" class="t3">3310CA3</td>
                                <td headers="t4" class="t4">
                                    <a name="periode12" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '01/01/2018', 'dateFinPeriode', '31/01/2018', 'dld', '26/02/2018');">17/02/2018</a></td>
                            </tr>
                        <tr class="ligneTab periode">
                                <td headers="t1" class="t1">
                                    <a name="periode13" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '01/12/2017', 'dateFinPeriode', '31/12/2017', 'dld', '24/01/2018');">Décembre 2017</a></td>
                                <td headers="t2" class="t2">24/01/2018</td>
                                <td headers="t3" class="t3">3310CA3</td>
                                <td headers="t4" class="t4">
                                    <a name="periode13" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '01/12/2017', 'dateFinPeriode', '31/12/2017', 'dld', '24/01/2018');">16/02/2018</a></td>
                            </tr>
                        <tr class="ligneTab periode">
                                <td headers="t1" class="t1">
                                    <a name="periode14" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '01/11/2017', 'dateFinPeriode', '30/11/2017', 'dld', '26/12/2017');">Novembre 2017</a></td>
                                <td headers="t2" class="t2">26/12/2017</td>
                                <td headers="t3" class="t3">3310CA3</td>
                                <td headers="t4" class="t4">
                                    <a name="periode14" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '01/11/2017', 'dateFinPeriode', '30/11/2017', 'dld', '26/12/2017');">16/02/2018</a></td>
                            </tr>
                        <tr class="ligneTab periode">
                                <td headers="t1" class="t1">
                                    <a name="periode15" title="Accéder au formulaire de saisie" onclick="ouvrirPeriode('codeNdoc', '3310CA3', 'dateDebutPeriode', '02/10/2017', 'dateFinPeriode', '31/10/2017', 'dld', '24/11/2017');">02/10/2017 au 31/10/2017</a></td>
                                <td headers="t2" class="t2">24/11/2017</td>
                                <td headers="t3" class="t3">3310CA3</td>
                                <td headers="t4" class="t4">
                                    </td>
                            </tr>
                        </tbody></table>
            </div>
            <div class="bandeauBeigeFonce">&nbsp;</div>
        </div>
    </div>
    
    <div class="sousCadre">
        Pour accéder au formulaire de saisie, cliquez sur la période de référence</div>
<div class="styleBouton blocBas">
        <table> 
            <tbody><tr>
                <td>
                    <table id="btn_retour" onmouseover="imageSurvoleeInterne('retour')" onmouseout="imageNonSurvoleeInterne('retour')" class="boutonAction tailleStandard curseurMain" title="Retour à la page d'accès au formulaire de saisie" summary=""><tbody><tr><td class="gauche" id="btn_retour_gauche" onclick="if(onClickBouton('retour')) {executeLien('afficherContexte.html');}"></td><td class="milieu" id="btn_retour_milieu" onclick="if(onClickBouton('retour')) {executeLien('afficherContexte.html');}"><button class="curseurMain" type="button" id="btn_retour_input">Retour</button>
</td><td class="droit" id="btn_retour_droit" onclick="if(onClickBouton('retour')) {executeLien('afficherContexte.html');}"></td></tr></tbody></table></td>
            </tr>
        </tbody></table>
    </div>
</div>

</div>
*/