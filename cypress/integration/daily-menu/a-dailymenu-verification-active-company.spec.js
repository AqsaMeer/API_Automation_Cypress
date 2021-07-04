import moment from 'moment-timezone'
const TESTDATA = require('../../fixtures/' + Cypress.env('fixtureFile') + '')
let email = "EmailTest-c14df3762c72@yopmail.net"
let deliverAtHome = 0
let categoryId = '1'
let orderQuantity = 2
let branchCapacity = 6
import { skipOn } from '@cypress/skip-test'
let currentDay = Cypress.dayjs().format('dddd');

skipOn(currentDay === 'Friday' || currentDay === 'Saturday', () => {

    describe('Daily Menu Verification of Active  Company-One Restaurant', function () {
        before(function () {
            // CurrentDate
            cy.getCurrentDate(deliverAtHome).then(($currentDate) => {
                this.currentDate = $currentDate.format('YYYY-MM-DD');
                cy.log(this.currentDate)
            })

        })
        beforeEach(function () {
            cy.log("*********USER LOGIN**********")
            cy.login(email, TESTDATA.validLoginCredentials.password).then((userToken) => {
                cy.setLocalStorage('token', userToken)
            })
        })
        // After Each for Test Status Updation in TestRail
        afterEach(function () {

            cy.log("*********CANCEL ALL ORDERS OF SPECIFIC BRANCH FOR CURRENT DATE*********")
            cy.cancelOrders(TESTDATA.byoRestaurant01Active.restaurantBranchId)

            if (this.currentTest.state === 'passed') {
                cy.passTest(this.currentTest.testcaseId)
            }
            if (this.currentTest.state === 'failed') {
                cy.sendSlackNotification(this.currentTest.title, this.currentTest.err.stack)
                cy.failTest(this.currentTest.testcaseId)

            }
            // Save Data in local Storage
            cy.saveLocalStorage();
        })
        it("C134978 Lunch Menu Verification of Active Company", function () {
            this.test.testcaseId = 134978
            categoryId = 2
            cy.log("*********GETTING TOKEN FROM LOCAL STORAGE **********")
            cy.getLocalStorage("token").then(userToken => {
                cy.log("*********SET BRANCH ORDER CAPACITY**********")
                cy.setBranchCapacity(TESTDATA.byoRestaurant01Active.restaurantBranchId, branchCapacity)
                cy.log("*********SET BRANCH LEVEL MEAL LIMIT**********")
                cy.setBranchMealLimit(TESTDATA.byoRestaurant01Active.restaurantBranchId, TESTDATA.byoRestaurant01Active.lunchMealID1, null, orderQuantity, null)
                cy.setBranchMealLimit(TESTDATA.byoRestaurant01Active.restaurantBranchId, TESTDATA.byoRestaurant01Active.lunchMealID2, null, orderQuantity, null)
                cy.setBranchMealLimit(TESTDATA.byoRestaurant01Active.restaurantBranchId, TESTDATA.byoRestaurant01Active.lunchMealID3, null, orderQuantity, null)

                //  Multiple Cut off
                cy.log("*********VERIFICATION OF CUT OFF TIME**********")
                let time12Format = ""
                cy.getTime(true, 120, false).then(returnedTime => {
                    cy.log("GET TIME - 2 HRS LEFT")
                    cy.log("TIME:" + returnedTime)
                    cy.log("*********SET BRANCH ALL CUT OFF TO BEFORE**********")
                    cy.changeCutOffTimeDB(TESTDATA.byoRestaurant01Active.lunchCutOff01ID, categoryId, TESTDATA.byoRestaurant01Active.restaurantBranchId, returnedTime)
                    cy.changeCutOffTimeDB(TESTDATA.byoRestaurant01Active.lunchCutOff02ID, categoryId, TESTDATA.byoRestaurant01Active.restaurantBranchId, returnedTime)
                    cy.changeCutOffTimeDB(TESTDATA.byoRestaurant01Active.lunchCutOff03ID, categoryId, TESTDATA.byoRestaurant01Active.restaurantBranchId, returnedTime)
                    time12Format = moment(returnedTime, "HH mm").format("hh:mm a")


                })

                cy.log("*********SET MEAL PREFERENCE TO 1(MEAT)**********")
                cy.setUserMealPreferences(1)
                this.token = userToken;
                cy.getuserInformation(this.token).then(returnedResponse => {
                    this.preferenceId = returnedResponse.body.notifications.dailyMenuPreference
                    this.userId = returnedResponse.body.userId
                    cy.log("*********GET DAILY MENU FOR MEAL PREFERENCE 1(MEAT)**********")
                    cy.dailyMenu(this.token, this.userId, deliverAtHome, categoryId, this.currentDate).then(returnedMenu => {
                        cy.log("*********VERIFICATION OF SCHEMA (DAILY-MENU)**********")
                        // Verify Daily Menu Scheme
                        expect(returnedMenu.body.menus).to.be.an('array')
                        expect(returnedMenu.body.menus[0].restaurant).to.be.an('string')
                        expect(returnedMenu.body.menus[0].id).to.be.an('number')
                        expect(returnedMenu.body.menus[0].meals).to.be.an('array')
                        expect(returnedMenu.body.menus[0].meals[0].id).to.be.an('number')
                        expect(returnedMenu.body.menus[0].meals[0].name).to.be.an('string')
                        expect(returnedMenu.body.menus[0].meals[0].isSpicy).to.be.an('boolean')
                        expect(returnedMenu.body.menus[0].meals[0].mealTags.priorityTag).to.be.an('number')
                        expect(returnedMenu.body.menus[0].meals[0].mealTags.tags).to.be.an('array')
                        expect(returnedMenu.body.menus[0].meals[0].caloriesCount).to.be.an('number')
                        expect(returnedMenu.body.menus[0].meals[0].imageName).to.be.an('string')
                        expect(returnedMenu.body.menus[0].meals[0].soldOut).to.be.an('boolean')
                        expect(returnedMenu.body.menus[0].meals[0].mealLimit).to.be.an('number')
                        expect(returnedMenu.body.menus[0].meals[0].description).to.be.an('string')
                        expect(returnedMenu.body.menus[0].meals[0].comesWith).to.be.an('string')
                        expect(returnedMenu.body.menus[0].meals[0].image).to.be.an('string')
                        expect(returnedMenu.body.menus[0].restaurantTags).to.be.an('array')
                        // Check Restaurant New Tag
                        cy.log("*********CHECK NEW TAG OF THE RESTAURANT**********")
                        expect(returnedMenu.body.menus[0].restaurantTags[0]).to.be.eq('NEW!')

                        expect(returnedMenu.body.menus[0].orderWindows[0]).to.be.an('object')
                        expect(returnedMenu.body.menus[0].orderWindows[0].timingId).to.be.an('number')
                        expect(returnedMenu.body.menus[0].orderWindows[0].isCutoffTimeRemaining).to.be.an('boolean')
                        expect(returnedMenu.body.menus[0].orderWindows[0].cutOffTime).to.be.an('string')
                        expect(returnedMenu.body.menus[0].orderWindows[0].deliversBy).to.be.an('string')
                        expect(returnedMenu.body.menus[0].orderWindows[0].userDeliveryTime).to.be.an('string')
                        expect(returnedMenu.body.menus[0].orderWindows[0].cutOffColorId).to.be.an('number')
                        // Verify Daily Menu Data For Meal -USER PREFERENCE-MEAT
                        cy.log("*********VERIFICATION OF DAILY MENU FOR PREFERENCE 1(MEAT)**********")
                        expect(returnedMenu.body.menus[0].restaurant).to.be.eq(TESTDATA.byoRestaurant01Active.restaurantName)
                        expect(returnedMenu.body.menus[0].id).to.be.eq(TESTDATA.byoRestaurant01Active.lunchMenuId)
                        expect(returnedMenu.body.menus[0].meals[0].id).to.be.eq(TESTDATA.byoRestaurant01Active.lunchMealID3)
                        expect(returnedMenu.body.menus[0].meals[0].name).to.be.eq(TESTDATA.byoRestaurant01Active.lunchMealName3)
                        expect(returnedMenu.body.menus[0].meals[0].isSpicy).to.be.eq(TESTDATA.byoRestaurant01Active.lunchMeal3IsSpicy)
                        expect(returnedMenu.body.menus[0].meals[0].soldOut).to.be.eq(false)
                        expect(returnedMenu.body.menus[0].meals[0].mealLimit).to.be.eq(orderQuantity)

                        expect(returnedMenu.body.menus[0].meals[0].mealTags.tags[0]).to.be.eq(TESTDATA.byoRestaurant01Active.lunchMeal3Tag0)
                        expect(returnedMenu.body.menus[0].meals[0].mealTags.tags[1]).to.be.eq(TESTDATA.byoRestaurant01Active.lunchMeal3Tag1)
                        expect(returnedMenu.body.menus[0].meals[0].mealTags.tags[2]).to.be.eq(TESTDATA.byoRestaurant01Active.lunchMeal3Tag2)

                        expect(returnedMenu.body.menus[0].meals[0].caloriesCount).to.be.eq(TESTDATA.byoRestaurant01Active.lunchMeal3CaloriesCount)
                        expect(returnedMenu.body.menus[0].meals[0].description).to.be.eq(TESTDATA.byoRestaurant01Active.lunchMeal3Description)
                        expect(returnedMenu.body.menus[0].deliveryFee).to.be.eq(TESTDATA.byoRestaurant01Active.deliveryFee)

                        //Verification of Order Window
                        cy.log("ORDER WINDOW FIRST CUT OFF VERIFICATION")
                        expect(returnedMenu.body.menus[0].orderWindows[0].timingId).to.be.eq(TESTDATA.byoRestaurant01Active.lunchCutOff01ID)
                        expect(returnedMenu.body.menus[0].orderWindows[0].cutOffTime).to.be.eq(time12Format)
                        expect(returnedMenu.body.menus[0].orderWindows[0].isCutoffTimeRemaining).to.be.eq(true)
                        expect(returnedMenu.body.menus[0].orderWindows[0].cutOffColorId).to.be.eq(0)
                        cy.log(" Daily Menu Time******:" + returnedMenu.body.menus[0].orderWindows[0].timingId)

                        cy.log("ORDER WINDOW FIRST CUT OFF VERIFICATION - 2nd")
                        expect(returnedMenu.body.menus[0].orderWindows[1].timingId).to.be.eq(TESTDATA.byoRestaurant01Active.lunchCutOff02ID)
                        // expect(returnedMenu.body.menus[0].orderWindows[0].cutOffTime).to.be.eq(time12Format)
                        expect(returnedMenu.body.menus[0].orderWindows[1].isCutoffTimeRemaining).to.be.eq(true)
                        expect(returnedMenu.body.menus[0].orderWindows[1].cutOffColorId).to.be.eq(0)

                        cy.log("ORDER WINDOW FIRST CUT OFF VERIFICATION - 3rd")
                        expect(returnedMenu.body.menus[0].orderWindows[2].timingId).to.be.eq(TESTDATA.byoRestaurant01Active.lunchCutOff03ID)
                        // expect(returnedMenu.body.menus[0].orderWindows[0].cutOffTime).to.be.eq(time12Format)
                        expect(returnedMenu.body.menus[0].orderWindows[2].isCutoffTimeRemaining).to.be.eq(true)
                        expect(returnedMenu.body.menus[0].orderWindows[2].cutOffColorId).to.be.eq(0)

                    })

                    // Change User Prefernece
                    cy.log("*********SET MEAL PREFERENCE TO 2(VEG)**********")
                    this.preferenceId = 2
                    cy.setUserMealPreferences(this.preferenceId)
                    // Multiple Cut off
                    cy.log("*********VERIFICATION OF CUT OFF TIME**********")

                    cy.getTime(true, 10, false).then(returnedTime => {
                        cy.log("GET TIME - 10 MIN LEFT")
                        cy.log("TIME:" + returnedTime)
                        cy.log("****SET TIME IN DATABASE*****")
                        cy.changeCutOffTimeDB(TESTDATA.byoRestaurant01Active.lunchCutOff01ID, categoryId, TESTDATA.byoRestaurant01Active.restaurantBranchId, returnedTime)
                        time12Format = moment(returnedTime, "HH mm").format("hh:mm a")

                    })
                    cy.log("*********VERIFICATION OF DAILY MENU FOR PREFERENCE 2(VEG)**********")
                    cy.dailyMenu(this.token, this.userId, deliverAtHome, categoryId, this.currentDate).then(returnedMenu => {
                        expect(returnedMenu.body.menus[0].restaurant).to.be.eq(TESTDATA.byoRestaurant01Active.restaurantName)
                        expect(returnedMenu.body.menus[0].meals[0].id).to.be.eq(TESTDATA.byoRestaurant01Active.lunchMealID2)
                        expect(returnedMenu.body.menus[0].meals[0].name).to.be.eq(TESTDATA.byoRestaurant01Active.lunchMealName2)
                        expect(returnedMenu.body.menus[0].meals[0].isSpicy).to.be.eq(TESTDATA.byoRestaurant01Active.lunchMeal2IsSpicy)
                        expect(returnedMenu.body.menus[0].meals[0].soldOut).to.be.eq(false)
                        expect(returnedMenu.body.menus[0].meals[0].mealLimit).to.be.eq(orderQuantity)

                        expect(returnedMenu.body.menus[0].meals[0].mealTags.tags[0]).to.be.eq(TESTDATA.byoRestaurant01Active.lunchMeal2Tag0)
                        expect(returnedMenu.body.menus[0].meals[0].mealTags.tags[1]).to.be.eq(TESTDATA.byoRestaurant01Active.lunchMeal2Tag1)
                        // expect(returnedMenu.body.menus[0].meals[0].mealTags.tags[2]).to.be.eq(TESTDATA.byoRestaurant01Active.lunchMeal2Tag2)

                        expect(returnedMenu.body.menus[0].meals[0].caloriesCount).to.be.eq(TESTDATA.byoRestaurant01Active.lunchMeal2CaloriesCount)
                        expect(returnedMenu.body.menus[0].meals[0].description).to.be.eq(TESTDATA.byoRestaurant01Active.lunchMeal2Description)
                        expect(returnedMenu.body.menus[0].deliveryFee).to.be.eq(TESTDATA.byoRestaurant01Active.deliveryFee)
                        //Verification of Order Window
                        cy.log("ORDER WINDOW FIRST CUT OFF VERIFICATION - 1st")
                        expect(returnedMenu.body.menus[0].orderWindows[0].timingId).to.be.eq(TESTDATA.byoRestaurant01Active.lunchCutOff01ID)
                        expect(returnedMenu.body.menus[0].orderWindows[0].cutOffTime).to.be.eq(time12Format)
                        expect(returnedMenu.body.menus[0].orderWindows[0].isCutoffTimeRemaining).to.be.eq(true)
                        expect(returnedMenu.body.menus[0].orderWindows[0].cutOffColorId).to.be.eq(1)
                        cy.log(" Daily Menu Time******:" + returnedMenu.body.menus[0].orderWindows[0].timingId)

                        cy.log("ORDER WINDOW FIRST CUT OFF VERIFICATION - 2nd")
                        expect(returnedMenu.body.menus[0].orderWindows[1].timingId).to.be.eq(TESTDATA.byoRestaurant01Active.lunchCutOff02ID)
                        // expect(returnedMenu.body.menus[0].orderWindows[0].cutOffTime).to.be.eq(time12Format)
                        expect(returnedMenu.body.menus[0].orderWindows[1].isCutoffTimeRemaining).to.be.eq(true)
                        expect(returnedMenu.body.menus[0].orderWindows[1].cutOffColorId).to.be.eq(0)

                        cy.log("ORDER WINDOW FIRST CUT OFF VERIFICATION - 3rd")
                        expect(returnedMenu.body.menus[0].orderWindows[2].timingId).to.be.eq(TESTDATA.byoRestaurant01Active.lunchCutOff03ID)
                        // expect(returnedMenu.body.menus[0].orderWindows[0].cutOffTime).to.be.eq(time12Format)
                        expect(returnedMenu.body.menus[0].orderWindows[2].isCutoffTimeRemaining).to.be.eq(true)
                        expect(returnedMenu.body.menus[0].orderWindows[2].cutOffColorId).to.be.eq(0)
                    })

                    // Change User Prefernece
                    cy.log("*********SET MEAL PREFERENCE TO 2(LITE)**********")
                    this.preferenceId = 3
                    cy.setUserMealPreferences(this.preferenceId)
                    cy.log("*********VERIFICATION OF DAILY MENU FOR PREFERENCE 3(LITE)**********")
                    cy.dailyMenu(this.token, this.userId, deliverAtHome, categoryId, this.currentDate).then(returnedMenu => {
                        expect(returnedMenu.body.menus[0].restaurant).to.be.eq(TESTDATA.byoRestaurant01Active.restaurantName)
                        expect(returnedMenu.body.menus[0].meals[0].id).to.be.eq(TESTDATA.byoRestaurant01Active.lunchMealID1)
                        expect(returnedMenu.body.menus[0].meals[0].name).to.be.eq(TESTDATA.byoRestaurant01Active.lunchMealName1)
                        expect(returnedMenu.body.menus[0].meals[0].isSpicy).to.be.eq(TESTDATA.byoRestaurant01Active.lunchMeal1IsSpicy)
                        expect(returnedMenu.body.menus[0].meals[0].soldOut).to.be.eq(false)
                        expect(returnedMenu.body.menus[0].meals[0].mealLimit).to.be.eq(orderQuantity)

                        expect(returnedMenu.body.menus[0].meals[0].mealTags.tags[0]).to.be.eq(TESTDATA.byoRestaurant01Active.lunchMeal1Tag0)
                        expect(returnedMenu.body.menus[0].meals[0].mealTags.tags[1]).to.be.eq(TESTDATA.byoRestaurant01Active.lunchMeal1Tag1)
                        expect(returnedMenu.body.menus[0].meals[0].mealTags.tags[2]).to.be.eq(TESTDATA.byoRestaurant01Active.lunchMeal1Tag2)

                        expect(returnedMenu.body.menus[0].meals[0].caloriesCount).to.be.eq(TESTDATA.byoRestaurant01Active.lunchMeal1CaloriesCount)
                        expect(returnedMenu.body.menus[0].meals[0].description).to.be.eq(TESTDATA.byoRestaurant01Active.lunchMeal1Description)
                        expect(returnedMenu.body.menus[0].deliveryFee).to.be.eq(TESTDATA.byoRestaurant01Active.deliveryFee)

                    })





                    // Daily Menu For Yesterday
                    // cy.getPreviousDate().then(returnedYesterday => {
                    //     // cy.getFutureDate()
                    //     cy.dailyMenu(this.token, this.userId, deliverAtHome, categoryId, returnedYesterday).then(returnedMenu => {
                    //         expect(returnedMenu.body.menus[0].cutOffColorId).to.be.eq(2)

                    //     })
                    // })

                    // Daily Menu For Tomorrow
                    // cy.getFutureDate().then(returnedTomorrow => {
                    //     cy.dailyMenu(this.token, this.userId, deliverAtHome, categoryId, returnedTomorrow).then(returnedMenu => {
                    //         expect(returnedMenu.body.menus[0].cutOffColorId).to.be.eq(0)

                    //     })
                    // })

                    cy.log("*********SET BRANCH ORDER CAPACITY TO -1(SOLD OUT BRANCH)**********")
                    branchCapacity = -1
                    cy.setBranchCapacity(TESTDATA.byoRestaurant01Active.restaurantBranchId, branchCapacity)
                    cy.dailyMenu(this.token, this.userId, deliverAtHome, categoryId, this.currentDate).then(returnedMenu => {
                        expect(returnedMenu.body.menus[0].restaurant).to.be.eq(TESTDATA.byoRestaurant01Active.restaurantName)
                        expect(returnedMenu.body.menus[0].meals[0].soldOut).to.be.eq(true)
                        expect(returnedMenu.body.menus[0].meals[0].mealLimit).to.be.eq(0)
                        expect(returnedMenu.body.menus[0].meals[1].soldOut).to.be.eq(true)
                        expect(returnedMenu.body.menus[0].meals[1].mealLimit).to.be.eq(0)
                        expect(returnedMenu.body.menus[0].meals[2].soldOut).to.be.eq(true)
                        expect(returnedMenu.body.menus[0].meals[2].mealLimit).to.be.eq(0)

                    })


                    cy.log("*********SET BRANCH ORDER CAPACITY**********")
                    branchCapacity = 6
                    cy.setBranchCapacity(TESTDATA.byoRestaurant01Active.restaurantBranchId, branchCapacity)

                    // Place Order For lunch
                    cy.log("*********PLACE ORDER FOR FIRST MEAL**********")
                    cy.placeOrderCommand(this.token, TESTDATA.byoRestaurant01Active.lunchMenuId, TESTDATA.byoRestaurant01Active.lunchMealID1, TESTDATA.byoRestaurant01Active.restaurantBranchId, orderQuantity, this.currentDate, deliverAtHome, TESTDATA.byoRestaurant01Active.lunchCutOff01ID)
                    cy.log("*********REMOVE FIRST CUT OFF**********")
                    cy.getTime(false, 10, false).then(returnedTime => {
                        cy.log("GET TIME -10 MIN Aahead")
                        cy.log("TIME:" + returnedTime)
                        cy.log("****SET TIME IN DATABASE*****")
                        cy.changeCutOffTimeDB(TESTDATA.byoRestaurant01Active.lunchCutOff01ID, categoryId, TESTDATA.byoRestaurant01Active.restaurantBranchId, returnedTime)
                        time12Format = moment(returnedTime, "HH mm").format("hh:mm a")

                    })
                    cy.log("*********VERIFICATION OF FIST MEAL/ FIRST CUT OFF**********")

                    cy.dailyMenu(this.token, this.userId, deliverAtHome, categoryId, this.currentDate).then(returnedMenu => {
                        expect(returnedMenu.body.menus[0].meals[2].soldOut).to.be.eq(true)
                        expect(returnedMenu.body.menus[0].meals[2].mealLimit).to.be.eq(0)
                        cy.log("ORDER WINDOW FIRST CUT OFF VERIFICATION - 1st")
                        expect(returnedMenu.body.menus[0].orderWindows[0].timingId).to.be.eq(TESTDATA.byoRestaurant01Active.lunchCutOff02ID)
                        // expect(returnedMenu.body.menus[0].orderWindows[0].cutOffTime).to.be.eq(time12Format)
                        expect(returnedMenu.body.menus[0].orderWindows[0].isCutoffTimeRemaining).to.be.eq(true)
                        expect(returnedMenu.body.menus[0].orderWindows[0].cutOffColorId).to.be.eq(0)

                        cy.log("ORDER WINDOW FIRST CUT OFF VERIFICATION - 2nd")
                        expect(returnedMenu.body.menus[0].orderWindows[1].timingId).to.be.eq(TESTDATA.byoRestaurant01Active.lunchCutOff03ID)
                        // expect(returnedMenu.body.menus[0].orderWindows[0].cutOffTime).to.be.eq(time12Format)
                        expect(returnedMenu.body.menus[0].orderWindows[1].isCutoffTimeRemaining).to.be.eq(true)
                        expect(returnedMenu.body.menus[0].orderWindows[1].cutOffColorId).to.be.eq(0)
                    })
                    cy.log("*********PLACE ORDER FOR SECOND MEAL**********")
                    cy.placeOrderCommand(this.token, TESTDATA.byoRestaurant01Active.lunchMenuId, TESTDATA.byoRestaurant01Active.lunchMealID2, TESTDATA.byoRestaurant01Active.restaurantBranchId, orderQuantity, this.currentDate, deliverAtHome, TESTDATA.byoRestaurant01Active.lunchCutOff02ID)
                    // cy.placeOrderCommand(this.token, TESTDATA.byoRestaurant01Active.lunchMenuId, TESTDATA.byoRestaurant01Active.lunchMealID3, TESTDATA.byoRestaurant01Active.restaurantBranchId, orderQuantity, this.currentDate, deliverAtHome)
                    cy.log("*********REMOVE SECOND CUT OFF**********")
                    cy.getTime(false, 10, false).then(returnedTime => {
                        cy.log("GET TIME -10 MIN Aahead")
                        cy.log("TIME:" + returnedTime)
                        cy.log("****SET TIME IN DATABASE*****")
                        cy.changeCutOffTimeDB(TESTDATA.byoRestaurant01Active.lunchCutOff02ID, categoryId, TESTDATA.byoRestaurant01Active.restaurantBranchId, returnedTime)
                        time12Format = moment(returnedTime, "HH mm").format("hh:mm a")

                    })
                    cy.log("*********VERIFICATION OF SECOND MEAL/ SECOND CUT OFF**********")
                    cy.dailyMenu(this.token, this.userId, deliverAtHome, categoryId, this.currentDate).then(returnedMenu => {
                        expect(returnedMenu.body.menus[0].meals[2].soldOut).to.be.eq(true)
                        expect(returnedMenu.body.menus[0].meals[2].mealLimit).to.be.eq(0)
                        cy.log("ORDER WINDOW FIRST CUT OFF VERIFICATION - 1st")
                        expect(returnedMenu.body.menus[0].orderWindows[0].timingId).to.be.eq(TESTDATA.byoRestaurant01Active.lunchCutOff03ID)
                        // expect(returnedMenu.body.menus[0].orderWindows[0].cutOffTime).to.be.eq(time12Format)
                        expect(returnedMenu.body.menus[0].orderWindows[0].isCutoffTimeRemaining).to.be.eq(true)
                        expect(returnedMenu.body.menus[0].orderWindows[0].cutOffColorId).to.be.eq(0)
                    })
                    // Place Order For lunch
                    cy.log("*********PLACE ORDER FOR THIRD MEAL**********")
                    cy.placeOrderCommand(this.token, TESTDATA.byoRestaurant01Active.lunchMenuId, TESTDATA.byoRestaurant01Active.lunchMealID1, TESTDATA.byoRestaurant01Active.restaurantBranchId, orderQuantity, this.currentDate, deliverAtHome, TESTDATA.byoRestaurant01Active.lunchCutOff03ID)
                    cy.log("*********REMOVE THIRD CUT OFF**********")
                    cy.getTime(false, 10, false).then(returnedTime => {
                        cy.log("GET TIME -10 MIN Aahead")
                        cy.log("TIME:" + returnedTime)
                        cy.log("****SET TIME IN DATABASE*****")
                        cy.changeCutOffTimeDB(TESTDATA.byoRestaurant01Active.lunchCutOff03ID, categoryId, TESTDATA.byoRestaurant01Active.restaurantBranchId, returnedTime)
                        time12Format = moment(returnedTime, "HH mm").format("hh:mm a")

                    })
                    cy.log("*********VERIFICATION OF THIRD MEAL/ THIRD CUT OFF**********")

                    cy.dailyMenu(this.token, this.userId, deliverAtHome, categoryId, this.currentDate).then(returnedMenu => {
                        expect(returnedMenu.body.menus[0].meals[2].soldOut).to.be.eq(true)
                        expect(returnedMenu.body.menus[0].meals[2].mealLimit).to.be.eq(0)
                        cy.log("ORDER WINDOW ALL CUT OFF PASSED VERIFICATION - 1st")
                        expect(returnedMenu.body.menus[0].orderWindows[0].timingId).to.be.eq(TESTDATA.byoRestaurant01Active.lunchCutOff03ID)
                        expect(returnedMenu.body.menus[0].orderWindows[0].isCutoffTimeRemaining).to.be.eq(false)
                        expect(returnedMenu.body.menus[0].orderWindows[0].cutOffColorId).to.be.eq(2)
                    })

                })

            })
        })
    })
})