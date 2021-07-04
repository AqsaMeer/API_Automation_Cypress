/// <reference types="Cypress" />
import Faker from 'faker'
const TESTDATA = require('../../fixtures/' + Cypress.env('fixtureFile') + '')
const email = "automation" + Faker.random.uuid() + "@yopmail.net"

describe('Page Payment Method and Redeem Promo Apis', function () {

  before(function () {
    cy.userSignup(email).then((userToken) => {
      this.userToken = userToken;
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
  });

  it('C52591 Add card to Sandbox from App', function () {
    this.test.testcaseId = 52591
    cy.log("" + TESTDATA.cardDetails2.number + "")
    //Get PaymentToken
    cy.api({
      method: 'POST',
      url: 'https://api.sandbox.checkout.com/tokens',
      headers: { "Content-Type": "application/json;charset=UTF-8", "authorization": "" + Cypress.env('Pay_Auth') + "" },
      body: {
        number: "" + TESTDATA.cardDetails2.number + "",
        expiry_month: TESTDATA.cardDetails2.expiryMonth,
        expiry_year: TESTDATA.cardDetails2.expiryYear,
        cvv: TESTDATA.cardDetails2.cvv,
        type: "card"
      }
    })//Tests
      .its('body')
      .then((body) => {
        this.paymentToken = body.token
        expect(body.type).to.be.an('string')
        expect(body.token).to.be.an('string')
        expect(body.expires_on).to.be.an('string')
        expect(body.expiry_month).to.be.an('number')
        expect(body.expiry_year).to.be.an('number')
        expect(body.scheme).to.be.an('string')
        expect(body.last4).to.be.an('string')
        expect(body.bin).to.be.an('string')
        expect(body.card_type).to.be.an('string')
        expect(body.card_category).to.be.an('string')
        expect(body.issuer).to.be.an('string')
        expect(body.issuer_country).to.be.an('string')
        expect(body.product_id).to.be.an('string')
        expect(body.product_type).to.be.an('string')
      })
  })

  it('C2523 Add Card from App', function () {
    this.test.testcaseId = 2523
    //Add another card
    cy.api({
      method: 'POST',
      url: '' + Cypress.env('baseUrlapi') + '/api/addCardFromApp',
      headers: { "Content-Type": "application/json;charset=UTF-8", "Origin": "" + Cypress.config().baseUrl + "", "Authorization": "Bearer " + this.userToken + " " },
      body: {
        cardToken: "" + this.paymentToken + "",
        makeDefault: 1
      }

    })//Tests
      .its('body')
      .then((body) => {
        expect(body.status).to.eq(200)
        expect(body.message).to.eq('Your payment method has been successfully added.')
      })
  })

  it('C4881 Get Payment Token', function () {
    this.test.testcaseId = 4881
    //Get PaymentToken
    cy.api({
      method: 'GET',
      url: '' + Cypress.env('baseUrlapi') + '/api/paymentToken',
      headers: { "Content-Type": "application/json;charset=UTF-8", "Origin": "" + Cypress.config().baseUrl + "", "Authorization": "Bearer " + this.userToken + " " },
    })//Tests
      .its('body')
      .then((body) => {
        expect(body.status).to.eq(200)
        expect(body.body.payment_token).to.be.an('string')
        this.paymentToken = body.body.payment_token
        cy.log(this.paymentToken)
      })
  })

  it('C52591 Add Card to Sandbox', function () {
    this.test.testcaseId = 52591
    //Get PaymentToken
    cy.api({
      method: 'POST',
      url: 'https://sandbox.checkout.com/api2/v2/charges/js/card',
      headers: { "Content-Type": "application/json;charset=UTF-8", "Host": "" + Cypress.env('Pay_Host') + "", "authorization": "" + Cypress.env('Pay_Auth') + "" },
      body: { "card": { "number": "" + TESTDATA.cardDetails.number + "", "expiryMonth": "" + TESTDATA.cardDetails.expiryMonth + "", "expiryYear": "" + TESTDATA.cardDetails.expiryYear + "", "cvv": "" + TESTDATA.cardDetails.cvv + "" }, "paymentToken": "" + this.paymentToken + "", "forceRedirect": true, "isForceRedirect": true, "apiSource": "JS" }
    })//Tests
      .its('body')
      .then((body) => {
        expect(body.responseCode).to.eq("10000")
        expect(body.chargeMode).to.eq(1)
        expect(body.id).to.be.an('string')
        expect(body.liveMode).to.be.an('boolean')
        expect(body.responseCode).to.be.an('string')
        this.paymentToken = body.id
        cy.log(this.paymentToken)
        const response = JSON.stringify(body)
        cy.log(response)
      })
  })

  it('C2523 Add Payment Method Api', function () {
    this.test.testcaseId = 2523
    cy.api({
      method: 'POST',
      url: '' + Cypress.env('baseUrlapi') + '/api/addCard',
      headers: { "Content-Type": "application/json;charset=UTF-8", "Origin": "" + Cypress.config().baseUrl + "", "Authorization": "Bearer " + this.userToken + " " },
      body: {

        paymentToken: "" + this.paymentToken + ""
      }
    })//Tests
      .its('body')
      .then((body) => {
        expect(body.status).to.eq(200)
        expect(body.body.last4).to.eq(TESTDATA.paymentCard.last4)
        expect(body.body.type).to.eq(TESTDATA.paymentCard.type)
        expect(body.body.expiry).to.eq(TESTDATA.paymentCard.expiry)
        this.cardID = body.body.id
        cy.log(this.cardID)
        var response = JSON.stringify(body)
        cy.log(response)
      })

  })

})