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

import test, {CallbackTestContext} from 'ava'
import * as sinon from 'sinon'
import {ActionsOnGoogleAva, CoverageResult} from '../actions-on-google-ava'
import {AssistResponse} from '../actions-on-google'
import * as Sample from './expected'
import {getMockConversation} from './test-helpers'

const testCredentialsFile = '../../test-credentials.json'

test.serial('Test is passed when the test is successfully', t => {
    const subject = new ActionsOnGoogleAva(require(testCredentialsFile))

    const context = {
        plan: (count: number) => {},
        pass: () => {},
        end: () => {},
    }
    const planSpy = sinon.spy(context, 'plan')
    const passSpy = sinon.spy(context, 'pass')
    const endSpy = sinon.spy(context, 'end')

    const subjectMock = sinon.mock(subject)
    subjectMock
        .expects('_doTest')
        .withArgs('testName1', sinon.match.func)
        .callsFake((testName: string, callback: (t: CallbackTestContext) => void) => {
            callback(context as CallbackTestContext)
        })
    subjectMock
        .expects('cancel')
        .callsFake(() => {
            return {
                then: (callback: Function) => {
                    callback()
                },
            }
        })

    // tslint:disable-next-line
    subject.startTest('testName1', (action: ActionsOnGoogleAva): Promise<any> => {
        class PromiseMock {
            then(fn: Function) {
                fn()
                return this
            }
            catch(fn: Function) {
                return this
            }
            finally(fn: Function) {
                fn()
            }
        }
        // tslint:disable-next-line
        return new PromiseMock() as Promise<any>
    })

    t.pass()

    subjectMock.verify()
    t.is(planSpy.calledOnce, true)
    t.is(planSpy.getCall(0).args[0], 1)
    t.is(passSpy.calledOnce, true)
    t.is(endSpy.calledOnce, true)

    subjectMock.restore()
    planSpy.restore()
    passSpy.restore()
    endSpy.restore()
})

test.serial('Test failed when the test is not successfully', t => {
    const subject = new ActionsOnGoogleAva(require(testCredentialsFile))

    const context = {
        plan: (count: number) => {},
        pass: () => {},
        end: () => {},
    }
    const planSpy = sinon.spy(context, 'plan')
    const passSpy = sinon.spy(context, 'pass')
    const endSpy = sinon.spy(context, 'end')

    const subjectMock = sinon.mock(subject)
    subjectMock
        .expects('_doTest')
        .withArgs('testName1', sinon.match.func)
        .callsFake((testName: string, callback: (t: CallbackTestContext) => void) => {
            callback(context as CallbackTestContext)
        })
    subjectMock
        .expects('cancel')
        .callsFake(() => {
            return {
                then: (callback: Function) => {
                    callback()
                },
            }
        })

    // tslint:disable-next-line
    subject.startTest('testName1', (action: ActionsOnGoogleAva): Promise<any> => {
        class PromiseMock {
            then(fn: Function) {
                return this
            }
            catch(fn: Function) {
                fn(new Error('error1'))
                return this
            }
            finally(fn: Function) {
                fn()
            }
        }
        // tslint:disable-next-line
        return new PromiseMock() as Promise<any>
    })

    t.pass()

    subjectMock.verify()
    t.is(planSpy.calledOnce, true)
    t.is(planSpy.getCall(0).args[0], 1)
    t.is(passSpy.notCalled, true)
    t.is(endSpy.calledOnce, true)

    subjectMock.restore()
    planSpy.restore()
    passSpy.restore()
    endSpy.restore()
})

test.serial('The result of sending consists of AssistResponse and AdditionalResponse', t => {
    const subject = new ActionsOnGoogleAva(require(testCredentialsFile))
    const mockResponse = sinon.stub(subject._client, 'assist')
    mockResponse.callsFake(() => {
        return getMockConversation(Sample.NUMBER_GENIE_WELCOME_AOG)
    })

    return subject.send('')
        .then((res: AssistResponse) => {
            t.deepEqual(res, Sample.NUMBER_GENIE_WELCOME_VALUES)
            t.is(subject._queryMatchedIntents.size, 1)
            t.is(subject._queryMatchedIntents.has('56da4637-0419-46b2-b851-d7bf726b1b1b'), true)
            mockResponse.restore()
        })
})

test.serial('The actionPackage is used as Dialogflow ZIP path', t => {
    const subject = new ActionsOnGoogleAva(require(testCredentialsFile), {
        actionPackage: 'actionPackage1',
    })
    t.is(subject._getDialogflowZipPath(), 'actionPackage1')
})

test.serial('The dialogflowZip is used as Dialogflow ZIP path', t => {
    const subject = new ActionsOnGoogleAva(require(testCredentialsFile), {
        dialogflowZip: 'dialogflowZip1',
    })
    t.is(subject._getDialogflowZipPath(), 'dialogflowZip1')
})

test.serial('The undefined is used as Dialogflow ZIP path', t => {
    const subject = new ActionsOnGoogleAva(require(testCredentialsFile))
    t.is(subject._getDialogflowZipPath(), undefined)
})

test.serial('Loading Dialogflow ZIP file and retrieving intent IDs', t => {
    const subject = new ActionsOnGoogleAva(require(testCredentialsFile))
    return subject._loadIntentsFromDialogflowZip('./src/test/dialogflow.zip')
        .then((intents: string[]) => {
            t.deepEqual(intents, ['intent2', 'intent3'])
        })
})

test.serial('Loading Dialogflow ZIP file failed', t => {
    const subject = new ActionsOnGoogleAva(require(testCredentialsFile))
    return subject._loadIntentsFromDialogflowZip('./src/test/not_found.zip')
        .then((intents: string[]) => {
            t.fail()
        })
        .catch((e) => {
            t.pass()
        })
})

test.serial('Calculating intents coverage', t => {
    const subject = new ActionsOnGoogleAva(require(testCredentialsFile))
    subject._queryMatchedIntents.add('intent2')
    return subject._calculateIntentCoverage('./src/test/dialogflow.zip')
        .then((result: CoverageResult) => {
            t.is(result.allCount, 2)
            t.is(result.matchedCount, 1)
        })
})

test.serial('Reporting intents coverage', t => {
    const subject = new ActionsOnGoogleAva(require(testCredentialsFile), {
        dialogflowZip: './src/test/dialogflow.zip',
    })
    subject._queryMatchedIntents.add('intent2')

    const consoleLogSpy = sinon.spy(console, 'log')

    return subject.reportIntentCoverage()
        .then(() => {
            t.is(consoleLogSpy.calledOnce, true)
            t.is(consoleLogSpy.args[0][0], '50.00% (1/2) of intents covered in your tests.')
            consoleLogSpy.restore()
        })
})
