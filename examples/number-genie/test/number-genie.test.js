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

// Should start action, presetting the answer to fifty. Then guess a few times until the answer is 50.
action.startTest('Number Genie - should guess the right answer', action => {
    return action.startConversation('about 50')
        .then(({ displayText, cards }) => {
            expect(displayText[0]).to.have.string("I'm thinking of a number from 0 to 100.");
            expect(displayText[1]).to.be.equal("What's your first guess?");

            expect(cards[0].imageAltText).to.be.equal('mystical crystal ball');
            expect(cards[0].imageUrl).to.have.string('/images/INTRO.gif');
            return action.send('49');
        })
        .then(({ displayText }) => {
            expect(displayText[1]).to.be.oneOf(["What's your next guess?",
                "Try another.", "Have another guess?"]);
            return action.send('48');
        })
        .then(({ displayText, cards }) => {
            expect(displayText[0]).to.have.string('higher than 49');

            expect(cards[0].imageAltText).to.be.equal('cool genie');
            expect(cards[0].imageUrl).to.have.string('/images/COOL.gif');
            return action.send('50');
        })
        .then(({ displayText, cards }) => {
            expect(displayText[1]).to.be.oneOf(["Wanna play again?",
                "Want to try again?",
                "Hey, should we do that again?"]);
            expect(cards[0].imageAltText).to.be.equal('celebrating genie');
            expect(cards[0].imageUrl).to.have.string('/images/WIN.gif');
        });
});

// Should start action, presetting the answer to a number higher than the range 0-100
action.startTest('Number Genie - starts with invalid number', action => {
    return action.startConversation('about 250')
        .then(({ displayText }) => {
            expect(displayText[0]).to.have.string("Woah there! I can't use that number.");
            expect(displayText[1]).to.be.equal("What's your first guess?");
            return action.send('251');
        })
        .then(({ displayText, cards }) => {
            expect(displayText[0]).to.have.string("lower");

            expect(cards[0].imageAltText).to.be.equal('cold genie');
            expect(cards[0].imageUrl).to.have.string('/images/COLD.gif');
        });
});

// Should start action using the French locale, and confirm the response is also in French
action.startTest('Number Genie French', action => {
    action.setLocale('fr-FR');
    return action.send('parle avec mon application test') // Talk to my test app
        .then(({ displayText, cards }) => {
            expect(displayText[1]).to.be.equal("Quel est votre premier essai ?");

            expect(cards[0].imageAltText).to.be.equal('Boule de crystal mystique');
            expect(cards[0].imageUrl).to.have.string('/images/INTRO.gif');
            return action.send('annuler'); // Cancel
        });
});