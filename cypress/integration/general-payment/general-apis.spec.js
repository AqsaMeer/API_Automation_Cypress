/// <reference types="Cypress" />
import Faker from 'faker'
const TESTDATA = require('../../fixtures/' + Cypress.env('fixtureFile') + '')
const RANDOMNUMBER = Faker.random.number({ min: 9999999, max: 999999999 });
describe('Buildings and General Config and Days Api', function () {
  const email = "automation" + Faker.random.uuid() + "@yopmail.net"

  before(function () {
    cy.userSignup(email).then(($userToken) => {
      this.userAccessToken = $userToken
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

  it('C52542 Get Buildings Api', function () {
    this.test.testcaseId = 52542
    cy.api({
      method: 'GET',
      url: '' + Cypress.env('baseUrlapi') + '/api/esBuildings',
      headers: { "Content-Type": "application/json;charset=UTF-8", "Origin": "" + Cypress.config().baseUrl + "", "Authorization": "Bearer " + this.userAccessToken + " " },
      qs: {
        query: "T"
      }
    })//Tests
      .its('body')
      .then((body) => {
        expect(body.status).to.eq(200)
        expect(body.message).to.eq("All Buildings.")
        expect(body.body.buildings).to.be.an('array')
        expect(body.body.buildings[0].id).to.be.an('number')
        expect(body.body.buildings[0].status).to.be.an('number')
        expect(body.body.buildings[0].name).to.be.an('string')
        expect(body.body.buildings[0].coordinates.longitude).to.be.an('number')
        expect(body.body.buildings[0].coordinates.latitude).to.be.an('number')
        if (Cypress.env('baseUrlapi').includes('ksa')) {
          expect(body.body.buildings[0].name_ar).to.be.an('string')
        }

        const RESPONSE = JSON.stringify(body)
        cy.log(RESPONSE)
      })
  })

  it('C5730 Get Company Info Api', function () {
    this.test.testcaseId = 5730
    cy.api({
      method: 'GET',
      url: '' + Cypress.env('baseUrlapi') + '/api/offCompanyInfo',
      headers: { "Content-Type": "application/json;charset=UTF-8", "Origin": "" + Cypress.config().baseUrl + "", "Authorization": "Bearer " + this.userAccessToken + " " },
    })
      .its('body')
      .then((body) => {
        expect(body.status).eq(200)
        expect(body.message).eq('Off page info')
        expect(body.body.isAreaActive).to.be.an('boolean')
        expect(body.body.companyStatus).to.be.an('number')
        expect(body.body.companyVirtualStatus).to.be.an('boolean')
        expect(body.body.isFilled).to.be.an('boolean')
        expect(body.body.usersLeft).to.be.an('number')
        expect(body.body.currentUsers).to.be.an('number')
        expect(body.body.minimumRequiredUsers).to.be.an('number')
        expect(body.body.company).to.be.an('string')
        expect(body.body.areaName).to.be.an('string')
      })
  })

  it('C52544  Get Version Api', function () {
    this.test.testcaseId = 52544

    cy.api({
      method: 'GET',
      url: '' + Cypress.env('baseUrlapi') + '/api/getVersion',
      headers: { "Content-Type": "application/json;charset=UTF-8", "Origin": "" + Cypress.config().baseUrl + "", "Authorization": "Bearer " + this.userAccessToken + " ", 'User-Agent': 'Alamofire' },

    })//Tests
      .its('body')
      .then((body) => {
        expect(body.status).to.eq(200)
        expect(body.message).to.eq("Version Found!")
        expect(body.body).to.be.an('object')
        expect(body.body.version).to.be.an('string')
        expect(body.body.is_forcefully_update).to.be.an('number')
      })
  })

})