# Actions on Google Testing Library
This library allows developers to write automated testing for their actions in Node.js.

Examples can be found in the `/examples` directory for two sample apps.

The [Assistant SDK](https://developers.google.com/assistant/sdk) is used to give developers
programmatic access to the Assistant and returns debug information about their actions that
are in a test state.

**Note: This library is currently in an alpha, experimental state. APIs may break between releases. Feedback and bugs can be provided by filing an issue in this repository.**

## How to get started

1. Go to the [Actions console](http://console.actions.google.com)
1. Create a new project. This project can be independent of your other projects.
    * You can use this project to test any of your actions that are in a test state
1. For this new project, enable the [Google Assistant API](https://console.developers.google.com/apis/api/embeddedassistant.googleapis.com/overview)
1. Go to the **Device Registration** section.
1. Click **REGISTER MODEL**
    1. Fill out the product and manufacturer name
    1. Set the Device type to *Light*, although the choice does not matter
1. Download the `credentials.json` file
1. Make sure you have [Python](http://python.org) installed
1. Run these commands to configure your environment:

```bash
sudo apt-get update
sudo apt-get install python3-dev python3-venv
python3 -m venv env
env/bin/python -m pip install --upgrade pip setuptools wheel
source env/bin/activate
python -m pip install --upgrade google-assistant-sdk[samples]
google-oauthlib-tool --scope https://www.googleapis.com/auth/assistant-sdk-prototype \
          --save --headless --client-secrets /path/to/credentials.json
```

9. Copy and paste the URL and enter the authorization code. You will see a response
similar to the following:

`credentials saved: /path/to/.config/google-oauthlib-tool/credentials.json`

10. Open up this file in a text editor. Take note of the:

* `client_id`
* `client_secret`
* `refresh_token`

11. Create a new JSON file: `test-credentials.json`
12. Enter these properties in that file

```json
{
    "client_id": "my-client-id",
    "client_secret": "my-client-secret",
    "refresh_token": "my-refresh-token",
    "type": "authorized_user"
}
```

13. Create a JavaScript file for your tests: `test.js`

```javascript
'use strict';
const { ActionsOnGoogleAva } = require('actions-on-google-testing');
const { expect } = require('chai');
const action = new ActionsOnGoogleAva(require('./test-credentials.json'));

// Start out with giving a name to this test
action.startTest('Facts about Google - direct cat path', action => {
    // Return a promise that starts a conversation with your test app
    return action.startConversation()
        .then(({ textToSpeech }) => {
            // Get a response back from your fulfillment.
            // To continue the conversation, you can send
            // a new text query. This starts the next
            // turn of the conversation.
            return action.send('cats');
        })
        .then(({ ssml }) => {
            // The entire set of responses are listed below.
            // You can use Chai to verify responses.
            expect(ssml[0]).to.have.string("Alright, here's a cat fact.")
            return action.endTest();
        })
});
```

14. Run `npm install`
15. Update your `package.json` to add this test file to your test script.

```JSON
"scripts": {
    "test": "./node_modules/.bin/ava -c 1 -s ./test.js"
},
```
16. Run `npm test`. You should see your test be executed.

## Possible responses

These responses will come from your fulfillment, and will consist of whatever
objects that you return.

```
res
  .micOpen - Boolean
  .textToSpeech - String[]
  .displayText - String[]
  .ssml - String[]
  .cards - Card[]
    .title - String
    .subtitle - String
    .text - String
    .imageUrl - String
    .imageAltText - String
    .buttons - Button[]
      .title - String
      .url - String
  .carousel - Array for Browse Carousel or Selection Carousel
    .title - String
    .description - String,
    .imageUrl - String,
    .imageAltText - String,
    .url - String
  .list
    .title - String
    .items - Item[]
      .title - String
      .description - String
      .imageUrl - String
      .imageAltText - String
  .mediaResponse
    .type - String
    .name - String
    .description - String
    .sourceUrl - String
    .icon - String
  .suggestions - String[]
  .linkOutSuggestion
    .url - String
    .name - String
```

## Additional features

You can run a few different types of automated test scenarios.

* `action.setLocation([latitude, longitude]);`
* `action.setLocale('en-US'); // Or any other supported locale`

## Known Issues

* Testing transactions does not work
* Testing smart home fulfillment does not work
* Unable to set surface capabilities
* Selecting an item for a ListSelect and CarouselSelect do not work

## License
See `LICENSE`