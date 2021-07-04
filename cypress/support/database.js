
//Load Data file before every test
const TESTDATA = require('../fixtures/' + Cypress.env('fixtureFile') + '')

/*******************************************************************
 * Command Name : getSchedule
 * Parameters :  startDate
 * Return Type : Scheduled Menu Array
 * Functionality: it returns the menu scheduled on the specific date
 * Written By : Aqsa
 ******************************************************************/
 Cypress.Commands.add("getSchedule", (startDate) => {
    let menu = ''
    let menuArray = []
    let menuTypes = new Map([
        [3434, "Breakfast"],
        [3435, "Lunch",],
        [3436, "Dinner"],
    ]);
    cy.task('queryDb', 'SELECT COUNT(DISTINCT menu_id) as menusCount FROM ( SELECT * FROM ' + Cypress.env('database') +
        '.menu_schedules_building where building_id ="' + TESTDATA.resto.buildingId + '"'
        + 'UNION SELECT *  FROM '+Cypress.env('database')+'.menu_schedules where company_id="' + TESTDATA.resto.companyId + '") as buildingCompany'
        + ' where buildingCompany.schedule_on =" ' + startDate + '"').then((rs) => {
            const MENUCOUNT = rs[0].menusCount

            cy.task('queryDb', 'SELECT DISTINCT menu_id FROM ( SELECT * FROM ' + Cypress.env('database') +
                '.menu_schedules_building where building_id ="' + TESTDATA.resto.buildingId + '"'
                + 'UNION SELECT *  FROM '+Cypress.env('database')+'.menu_schedules where company_id="' + TESTDATA.resto.companyId + '") as buildingCompany'
                + ' WHERE buildingCompany.schedule_on =" ' + startDate + '"').then((rs) => {

                    for (let i = 0; i < MENUCOUNT; i++) {
                        menu = menuTypes.get(rs[i].menu_id)
                        menuArray.push(menu)

                    }
                })
        })
    return cy.wrap(menuArray)


})