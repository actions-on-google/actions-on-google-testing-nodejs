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

import test from 'ava'
import {Interactive} from '../interactive'
import * as sinon from 'sinon'
import {AssistResponse} from '../actions-on-google'

test('When the action immediately returns a response with micOpen=false', async t => {
    const interactive = new Interactive({
        credential: './test-credentials.json',
        locale: 'en-US',
        actionName: 'actionName1',
        prompt: 'prompt1',
    })
    const mockAction = sinon.mock(interactive._action)
    mockAction
        .expects('startConversationWith')
        .withArgs('actionName1', 'prompt1')
        .once()
        .callsFake((actionName: string, prompt: string) => {
            return new Promise<AssistResponse>((resolve, reject) => {
                const assistResponse: AssistResponse = {
                    micOpen: false,
                    textToSpeech: [],
                    displayText: [],
                    ssml: [],
                    suggestions: [],
                }
                resolve(assistResponse)
            })
        })
    const mockInteractive = sinon.mock(interactive)
    mockInteractive
        .expects('output')
        .withArgs(['', 'Action response:', sinon.match({micOpen: false}), ''])
        .once()
    mockAction
        .expects('endConversation')
        .once()
    mockInteractive
        .expects('output')
        .withArgs(['End conversation.'])
        .once()
    await interactive.start()
    mockAction.verify()
    mockInteractive.verify()
    t.pass()
})

test('When the action asks something', async t => {
    const interactive = new Interactive({
        credential: './test-credentials.json',
        locale: 'en-US',
        actionName: 'actionName1',
        prompt: 'prompt1',
    })
    const mockAction = sinon.mock(interactive._action)
    mockAction
        .expects('startConversationWith')
        .withArgs('actionName1', 'prompt1')
        .once()
        .callsFake((actionName: string, prompt: string) => {
            return new Promise<AssistResponse>((resolve, reject) => {
                const assistResponse: AssistResponse = {
                    micOpen: true,
                    textToSpeech: [
                        'welcome message',
                    ],
                    displayText: [],
                    ssml: [],
                    suggestions: [],
                }
                resolve(assistResponse)
            })
        })
    const mockInteractive = sinon.mock(interactive)
    mockInteractive
        .expects('output')
        .withArgs(['', 'Action response:', sinon.match({micOpen: true}), ''])
        .once()
    mockInteractive
        .expects('hear')
        .once()
        .returns(new Promise<string>((resolve, reject) => {
            resolve('')
        }))
    mockInteractive
        .expects('hear')
        .once()
        .returns(new Promise<string>((resolve, reject) => {
            resolve('input1')
        }))
    mockAction
        .expects('send')
        .withArgs('input1')
        .once()
        .callsFake((phrase: string) => {
            return new Promise<AssistResponse>((resolve, reject) => {
                const assistResponse: AssistResponse = {
                    micOpen: false,
                    textToSpeech: [],
                    displayText: [],
                    ssml: [],
                    suggestions: [],
                }
                resolve(assistResponse)
            })
        })
    mockInteractive
        .expects('output')
        .withArgs(['', 'Action response:', sinon.match({micOpen: false}), ''])
        .once()
    mockAction
        .expects('endConversation')
        .once()
    mockInteractive
        .expects('output')
        .withArgs(['End conversation.'])
        .once()
    await interactive.start()
    mockAction.verify()
    mockInteractive.verify()
    t.pass()
})

test('When inputting SIGINT', async t => {
    const interactive = new Interactive({
        credential: './test-credentials.json',
        locale: 'en-US',
        actionName: 'actionName1',
        prompt: 'prompt1',
    })
    const mockAction = sinon.mock(interactive._action)
    mockAction
        .expects('startConversationWith')
        .withArgs('actionName1', 'prompt1')
        .once()
        .callsFake((actionName: string, prompt: string) => {
            return new Promise<AssistResponse>((resolve, reject) => {
                const assistResponse: AssistResponse = {
                    micOpen: true,
                    textToSpeech: [
                        'welcome message',
                    ],
                    displayText: [],
                    ssml: [],
                    suggestions: [],
                }
                resolve(assistResponse)
            })
        })
    const mockInteractive = sinon.mock(interactive)
    mockInteractive
        .expects('output')
        .withArgs(['', 'Action response:', sinon.match({micOpen: true}), ''])
        .once()
    mockInteractive
        .expects('hear')
        .once()
        .returns(new Promise<string>((resolve, reject) => {
            reject('SIGINT')
        }))
    mockAction
        .expects('endConversation')
        .once()
    mockInteractive
        .expects('output')
        .withArgs(['', 'Conversation aborted: SIGINT'])
        .once()
    await interactive.start()
    mockAction.verify()
    mockInteractive.verify()
    t.pass()
})

test('When the sending phrase failed', async t => {
    const interactive = new Interactive({
        credential: './test-credentials.json',
        locale: 'en-US',
        actionName: 'actionName1',
        prompt: 'prompt1',
    })
    const mockAction = sinon.mock(interactive._action)
    mockAction
        .expects('startConversationWith')
        .withArgs('actionName1', 'prompt1')
        .once()
        .callsFake((actionName: string, prompt: string) => {
            return new Promise<AssistResponse>((resolve, reject) => {
                const assistResponse: AssistResponse = {
                    micOpen: true,
                    textToSpeech: [
                        'welcome message',
                    ],
                    displayText: [],
                    ssml: [],
                    suggestions: [],
                }
                resolve(assistResponse)
            })
        })
    const mockInteractive = sinon.mock(interactive)
    mockInteractive
        .expects('output')
        .withArgs(['', 'Action response:', sinon.match({micOpen: true}), ''])
        .once()
    mockInteractive
        .expects('hear')
        .once()
        .returns(new Promise<string>((resolve, reject) => {
            resolve('input1')
        }))
    mockAction
        .expects('send')
        .withArgs('input1')
        .once()
        .callsFake((phrase: string) => {
            return new Promise<AssistResponse>((resolve, reject) => {
                reject('error1')
            })
        })
    mockAction
        .expects('endConversation')
        .once()
    mockInteractive
        .expects('output')
        .withArgs(['', 'Conversation aborted: error1'])
        .once()
    await interactive.start()
    mockAction.verify()
    mockInteractive.verify()
    t.pass()
})
