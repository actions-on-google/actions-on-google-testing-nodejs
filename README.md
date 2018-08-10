# Actions on Google Testing Library
This library allows developers to write automated testing for their actions in Node.js.

[![NPM Version](https://img.shields.io/npm/v/actions-on-google-testing.svg)](https://www.npmjs.org/package/actions-on-google-testing)

Examples can be found in the `/examples` directory for two sample apps.

The [Assistant SDK](https://developers.google.com/assistant/sdk) is used to give developers
programmatic access to the Assistant and returns debug information about their actions that
are in a test state.

**Note: This library is currently in an alpha, experimental state. APIs may break between releases. Feedback and bugs can be provided by filing an issue in this repository.**

## How to get started

1. Go to the [Actions console](http://console.actions.google.com)
2. Create a new project. This project can be independent of your other projects.
    * You can use this project to test any of your actions that are in a test state
3. For this new project, enable the [Google Assistant API](https://console.developers.google.com/apis/api/embeddedassistant.googleapis.com/overview)
4. Go to the **Device Registration** section.
5. Click **REGISTER MODEL**
    1. Fill out the product and manufacturer name
    1. Set the Device type to *Light*, although the choice does not matter
6. Download the `credentials.json` file
7. Use this credentials file to generate test credentials:

```bash
node generate-credentials.js /path/to/credentials.json
```

8. Copy and paste the URL and enter the authorization code. You will see a response
similar to the following:

`Saved user credentials in "test-credentials.json"`

9. Create a JavaScript file for your tests: `test.js`

```javascript
'use strict';
const { ActionsOnGoogleAva } = require('actions-on-google-testing');
const { expect } = require('chai');
const action = new ActionsOnGoogleAva(require('./test/test-credentials.json'));

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
        })
});
```

10. Run `yarn`
11. Update your `package.json` to add this test file to your test script.

```JSON
"scripts": {
    "test": "./node_modules/.bin/ava -c 1 -s ./test.js"
},
```
12. Run `yarn test`. You should see your test be executed.

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
  .table
    .headers - String[]
    .rows - Row[]
      .cells - String[]
      .divider - Boolean
```

## Additional features

You can run a few different types of automated test scenarios.

* `action.location = [latitude, longitude];`
* `action.locale = 'en-US'; // Or any other supported locale`

## Known Issues

* Testing transactions does not work
* Testing smart home fulfillment does not work
* Unable to set surface capabilities
* Selecting an item for a ListSelect and CarouselSelect do not work

## Interactive Prompt

You can use an "Interactive Prompt" to test your actions. This mode allows you to communicate with your actions as
like the Actions Simulator easily.

If you have already installed this library by the steps described on "How to get started" section, the
`action-test` command has been installed at the same time. You can use the command right now, if you have
installed this library for global. Otherwise, you should be able to find the command at `./node_modues/.bin`
directory.

When you want to test your actions using the command, run the following:

```bash
$ action-test interactive -l <LOCALE> -c <CREDENTIAL_FILE> "<YOUR_ACTION_NAME>" "<PROMPT>"
```

* `<YOUR_ACTION_NAME` - The name to invoke your action. If omitted, the default app name for test app is used (ex. "my test app").
* `<PROMPT>` - The additional prompt you want to pass to your action.
* `<LOCALE>` - The locale string. If omitted, "en-US" is used. This is case-sensitive, and all supported locales are defined on the [Language and Locale Support](https://developers.google.com/actions/localization/languages-locales) page.
* `<CREDENTIAL_FILE>` - The file path of your credential file which was created by the previous step. If omitted, "./credentials.json" is used.

All options above can be omitted. If you execute `action-test interactive` without any options, it means the following:

```bash
action-test interactive -l en-US -c ./credentials.json "my test app"
```

If your test app can be invoked normally, you can interact with the action as like the following:

```
Action response:
{ micOpen: true,
  textToSpeech: [ 'What's your first guess?' ],
  displayText: [],
  ssml: [],
  suggestions: [] }

> 48

Action response:
{ micOpen: true,
  textToSpeech: [ 'higher than 49' ],
  displayText: [],
  ssml: [],
  suggestions: [] }

...
```

## License
See `LICENSE`