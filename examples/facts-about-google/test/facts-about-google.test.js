/**
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 *
 */
'use strict';
const winston = require('winston');
const { expect } = require('chai');
const assert = require('assert');

// Default logger
winston.loggers.add('DEFAULT_LOGGER', {
    console: {
        level: 'error',
        colorize: true,
        label: 'Default logger',
        json: true,
        timestamp: true
    }
});

const { ActionsOnGoogleAva } = require('../../../dist/');
const action = new ActionsOnGoogleAva(require('../../../test/test-credentials.json'));

// Start action and ask for history facts until there are no more history facts
action.startTest('Facts about Google - history path', action => {
    return action.start()
        .then((res) => {
            return action.send('history')
        })
        .then(({ textToSpeech }) => {
            expect(textToSpeech[0]).to.have.string("Sure, here's a history fact.")
            return action.send('sure')
        })
        .then(({ textToSpeech }) => {
            expect(textToSpeech[0]).to.have.string("Sure, here's a history fact.")
            return action.send('sure')
        })
        .then(({ textToSpeech }) => {
            expect(textToSpeech[0]).to.have.string("Sure, here's a history fact.")
            return action.send('sure')
        })
        .then(({ textToSpeech }) => {
            expect(textToSpeech[0]).to.have.string("Sure, here's a history fact.")
            return action.send('sure')
        })
        .then(({ textToSpeech }) => {
            expect(textToSpeech[0]).to.have.string("Looks like you've heard all there is")
            return action.endTest();
        })
});

// Start action and ask for headquarter facts until there are no more headquarter facts
action.startTest('Facts about Google - headquarters path', action => {
    return action.start()
        .then(({ textToSpeech }) => {
            return action.send('headquarters')
        })
        .then(({ textToSpeech }) => {
            expect(textToSpeech[0]).to.have.string("Okay, here's a headquarters fact.")
            return action.send('sure')
        })
        .then(({ textToSpeech }) => {
            expect(textToSpeech[0]).to.have.string("Okay, here's a headquarters fact.")
            return action.send('sure')
        })
        .then(({ textToSpeech }) => {
            expect(textToSpeech[0]).to.have.string("Okay, here's a headquarters fact.")
            return action.send('sure')
        })
        .then(({ textToSpeech }) => {
            expect(textToSpeech[0]).to.have.string("Looks like you've heard all there is")
            return action.endTest();
        })
});

// Start action and ask for a cat fact right away
action.startTest('Facts about Google - direct cat path', action => {
    return action.start()
        .then(({ textToSpeech }) => {
            return action.send('cats');
        })
        .then(({ ssml }) => {
            expect(ssml[0]).to.have.string("Alright, here's a cat fact.")
            return action.endTest();
        })
});

// Start action and ask for headquarters until there are no more headquarter facts,
// then switch to provide facts about cats
action.startTest('Facts about Google - cat path', action => {
    return action.start()
        .then(({ textToSpeech }) => {
            return action.send('headquarters')
        })
        .then(({ textToSpeech }) => {
            expect(textToSpeech[0]).to.have.string("Okay, here's a headquarters fact.")
            return action.send('sure')
        })
        .then(({ textToSpeech }) => {
            expect(textToSpeech[0]).to.have.string("Okay, here's a headquarters fact.")
            return action.send('sure')
        })
        .then(({ textToSpeech }) => {
            expect(textToSpeech[0]).to.have.string("Okay, here's a headquarters fact.")
            return action.send('sure')
        })
        .then(({ textToSpeech }) => {
            expect(textToSpeech[0]).to.have.string("Looks like you've heard all there is")
            return action.send('cats')
        })
        .then(({ ssml }) => {
            expect(ssml[0]).to.have.string("Alright, here's a cat fact.")
            return action.endTest();
        })
});