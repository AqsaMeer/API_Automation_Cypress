
/// <reference types="Cypress" />
import Hashids from 'hashids'
import Faker from 'faker'
const TESTDATA = require('../../fixtures/' + Cypress.env('fixtureFile') + '')
const email = "automation" + Faker.random.uuid() + "@yopmail.net"

describe('User Settings Api', function () {
    before(function () {
        cy.userSignup(email).then((userToken) => {
            this.token = userToken;
            cy.mobileVerificationAPI(email, this.token)
            cy.addCard(this.token)

        })
        cy.getCurrentDate().then(($currentDat) => {
            this.currentDate = $currentDat.format('YYYY-MM-DD');
            cy.log(this.currentDate)
        })
        cy.getFutureDate().then(($futureDate) => {
            this.futureDate = $futureDate;
            cy.log("Future Datee:" + this.futureDate)
        })
    })

    afterEach(function () {
        if (this.currentTest.state === 'passed') {
            cy.passTest(this.currentTest.testcaseId)
        }
        if (this.currentTest.state === 'failed') {
            cy.failTest(this.currentTest.testcaseId)
            cy.sendSlackNotification(this.currentTest.title, this.currentTest.err.stack)
        }
    })
    it('C53736 Verify Via Email', function () {
        this.test.testcaseId = 53736
        cy.task('queryDb', 'SELECT * FROM ' + Cypress.env('database') + '.users where email ="' + email + '"').then((rs) => {
            const code = rs[0].email_verification_code
            cy.api({
                method: 'POST',
                url: '' + Cypress.env('baseUrlapi') + '/api/verifyAccountViaEmail',
                headers: { "Content-Type": "application/json;charset=UTF-8", "Origin": "" + Cypress.config().baseUrl + "" },
                body: {
                    activationCode: "" + code + ""
                }
            })//Tests
                .its('body')
                .then((body) => {
                    expect(body.status).to.eq(200)
                    expect(body.message).to.eq('Your Email Address has been successfully activated')

                })
            })
        })
    it('C53737 Resend Email Activation Api', function () {
        this.test.testcaseId = 53737
        cy.api({
            method: 'POST',
            url: '' + Cypress.env('baseUrlapi') + '/api/resendActivationEmail',
            headers: { "Content-Type": "application/json;charset=UTF-8", "Origin": "" + Cypress.config().baseUrl + "", "Authorization": "Bearer " + this.token + " " },
        })//Tests
            .its('body')
            .then((body) => {
                expect(body.status).to.eq(200)
                expect(body.message).to.eq('Account activation email has been sent to your registered email address.')
                const response = JSON.stringify(body)
                cy.log(response)
            })
    })

    it('C53738 Activate User Account', function () {
        this.test.testcaseId = 53738
        cy.task('queryDb', 'SELECT * FROM ' + Cypress.env('database') + '.users where email ="' + email + '"').then((rs) => {
            const code = rs[0].email_verification_code
            cy.log(code)
            cy.api({
                method: 'POST',
                url: '' + Cypress.env('baseUrlapi') + '/api/user/activateAccount',
                headers: { "Content-Type": "application/json;charset=UTF-8", "Origin": "" + Cypress.config().baseUrl + "", "Authorization": "Bearer " + this.token + " " },
                body: {
                    activationCode: "" + code + ""
                }

            })//Tests
                .its('body')
                .then((body) => {
                    expect(body.status).to.eq(200)
                    expect(body.message).to.eq('Your Email Address has been successfully activated')
                    var response = JSON.stringify(body)
                    cy.log(response)
                })
        })
    })

})