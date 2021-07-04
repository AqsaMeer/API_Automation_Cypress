
const TESTDATA = require('../../fixtures/' + Cypress.env('fixtureFile') + '')
describe('General Company Apis', function () {

  afterEach(function () {
    if (this.currentTest.state === 'passed') {
      cy.passTest(this.currentTest.testcaseId)
    }
    if (this.currentTest.state === 'failed') {
      cy.failTest(this.currentTest.testcaseId)
      cy.sendSlackNotification(this.currentTest.title, this.currentTest.err.stack)
    }
  })

  it('C52540 Api Get All Verified Companies', function () {

    this.test.testcaseId = 52540
    cy.api({
      method: 'GET',
      url: '' + Cypress.env('baseUrlapi') + '/api/allVerifiedCompaniesES',
      headers: { "Content-Type": "application/json;charset=UTF-8", "Origin": "" + Cypress.config().baseUrl + "" },
      qs: {
        app: 0,
        query: TESTDATA.signup.companyName
      }
    })
      .its('body')
      .then((body) => {
        expect(body.status).to.eq(200)
        expect(body.message).to.eq('All Verified Companies from ES!')
        expect(body.body).to.be.an('object')
        expect(body.body.companies).to.be.an('array')
        if (body.body.companies.length > 0) {
          expect(body.body.companies[0].companyId).to.be.an('number')
          expect(body.body.companies[0].status).to.be.an('number')
          expect(body.body.companies[0].company).to.be.an('string')
          expect(body.body.companies[0].coordinates).to.be.an('object')
          expect(body.body.companies[0].coordinates.latitude).to.be.an('number')
          expect(body.body.companies[0].coordinates.longitude).to.be.an('number')
          if (Cypress.env('baseUrlapi').includes('ksa')) {
            expect(body.body.companies[0].company_ar).to.be.an('string')
          }
        }
        const response = JSON.stringify(body)
        cy.log(response)
      })
  })

  it('C2528 Api Suggest Company', function () {
    this.test.testcaseId = 2528
    cy.api({
      method: 'POST',
      url: '' + Cypress.env('baseUrlapi') + '/api/suggestCompany',
      headers: {},
      body: {
        company: "technology"
      }
    })//Tests
      .its('body')
      .then((body) => {
        expect(body.status).to.eq(200)
        expect(body.message).to.eq("Company Suggestions!")
        expect(body.body.companies[0].companyId).to.be.an('number')
        expect(body.body.companies[0].company).to.be.an('string')

      })
  })
})