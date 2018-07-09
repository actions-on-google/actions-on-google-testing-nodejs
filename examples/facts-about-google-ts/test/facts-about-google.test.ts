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
'use strict'

import { expect } from 'chai'
import { ActionsOnGoogleAva, AssistResponse } from 'actions-on-google-testing'

const action: ActionsOnGoogleAva = new ActionsOnGoogleAva(require(
    '../../../test/test-credentials.json'))

// Start action and ask for history facts until there are no more history factsi
action.startTest('Facts about Google - history path', async (action: ActionsOnGoogleAva) => {
    let appResponse: AssistResponse
    await action.startConversation()
    appResponse = await action.send('history')
    expect(appResponse.textToSpeech[0]).to.have.string("Sure, here's a history fact.")
    appResponse = await action.send('sure')
    expect(appResponse.textToSpeech[0]).to.have.string("Sure, here's a history fact.")
    appResponse = await action.send('sure')
    expect(appResponse.textToSpeech[0]).to.have.string("Sure, here's a history fact.")
    appResponse = await action.send('sure')
    expect(appResponse.textToSpeech[0]).to.have.string("Sure, here's a history fact.")
    appResponse = await action.send('sure')
    expect(appResponse.textToSpeech[0]).to.have.string("Looks like you've heard all there is")
})

// Start action and ask for headquarter facts until there are no more headquarter facts
action.startTest('Facts about Google - headquarters path', async (action: ActionsOnGoogleAva) => {
    let appResponse: AssistResponse
    await action.startConversation()
    appResponse = await action.send('headquarters')
    expect(appResponse.textToSpeech[0]).to.have.string("Okay, here's a headquarters fact.")
    appResponse = await action.send('sure')
    expect(appResponse.textToSpeech[0]).to.have.string("Okay, here's a headquarters fact.")
    appResponse = await action.send('sure')
    expect(appResponse.textToSpeech[0]).to.have.string("Okay, here's a headquarters fact.")
    appResponse = await action.send('sure')
    expect(appResponse.textToSpeech[0]).to.have.string("Looks like you've heard all there is")
})

// Start action and ask for a cat fact right away
action.startTest('Facts about Google - direct cat path', async (action: ActionsOnGoogleAva) => {
    let appResponse: AssistResponse
    await action.startConversation()
    appResponse = await action.send('cats')
    expect(appResponse.textToSpeech[0]).to.have.string("Alright, here's a cat fact.")
})

// Start action and ask for headquarters until there are no more headquarter facts,
// then switch to provide facts about cats
action.startTest('Facts about Google - cat path', async (action: ActionsOnGoogleAva) => {
    let appResponse: AssistResponse
    await action.startConversation()
    appResponse = await action.send('headquarters')
    expect(appResponse.textToSpeech[0]).to.have.string("Okay, here's a headquarters fact.")
    appResponse = await action.send('sure')
    expect(appResponse.textToSpeech[0]).to.have.string("Okay, here's a headquarters fact.")
    appResponse = await action.send('sure')
    expect(appResponse.textToSpeech[0]).to.have.string("Okay, here's a headquarters fact.")
    appResponse = await action.send('sure')
    expect(appResponse.textToSpeech[0]).to.have.string("Looks like you've heard all there is")
})
