const { IncomingWebhook } = require('@slack/webhook');
Cypress.Commands.add("sendSlackNotification", (title, stack) => {
    // Read a url from the environment variables
    const url = 'https://hooks.slack.com/services/**********';

    // Initialize
    const webhook = new IncomingWebhook(url);
    var message = ''
    if (Cypress.config().baseUrl.includes('uae')) {
        message = "\n>`UAE Region`\n>`TestCase Title: " + title + "`"
    } else {
        message = "\n>`KSA Region`\n>`TestCase Title: " + title + "`"
    }
    if (Cypress.env('ci_status') == true) {
        webhook.send({
            username: "Api Test",
            text: message + "\n>`Failure Exception: `\n>" + "`" + stack + "`",
            icon_emoji: ":zap:"
        });
    }
})