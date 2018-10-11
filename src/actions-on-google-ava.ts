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

// Implementation of Google Assistant with Ava testing framework wrapping

import test, { GenericCallbackTestContext } from 'ava'
import * as promiseFinally from 'promise.prototype.finally'
import { ActionsOnGoogle, AssistResponse } from './actions-on-google'

promiseFinally.shim()

/**
 * A class that uses Actions on Google as an Ava test wrapper.
 */
export class ActionsOnGoogleAva extends ActionsOnGoogle {
    /** @hidden */
    // tslint:disable-next-line
    _t: GenericCallbackTestContext<any>

    /**
     * Initializes a new test
     *
     * @param testName The display name for the test
     * @param callback The logic for the test
     *
     * @example
     * ```javascript
     * // Pass in optional user credentials or default to environment variables
     * const action = new ActionsOnGoogleAva(CREDENTIALS);
     * action.startTest('test correct answer', action => {
     *   action.startWith('number genie', 'about 50') // "talk to number genie about 50"
     *     .then(res => {
     *       expect(res.textToSpeech[0]).to.be.equal('I am thinking of a number')
     *     })
     * })
     * ```
     *
     * @public
     */
    // tslint:disable-next-line
    startTest(testName: string, callback: (t: ActionsOnGoogleAva) => Promise<any>) {
        this._isNewConversation = true
        test(testName, async t => {
            this._t = t
            this._t.plan(1)
            console.log(`** Starting test ${testName} **`)
            try {
              await callback(this)
              // The test has completed successfully
              // If the test exits early, only the
              // `finally` function will be run
              console.log('test passes')
              this._t.pass()
            } catch(e) {
              console.log('test error', e)
            } finally {
              await this.cancel()
              console.log('test ends')
              console.log('\n')
            }
        })
    }

    /**
     * Sends a text query to the Action
     *
     * @param input The user-provided query as text
     * @return A Promise with the response from the Action
     *
     * @example
     * ```javascript
     * // Pass in optional user credentials or default to environment variables
     * const action = new ActionsOnGoogleAva(CREDENTIALS);
     * action.startWith('number genie', 'about 50') // "talk to number genie about 50"
     *   .then(res => {
     *     return action.send('what about 49?')
     *   }).then(res => {
     *     expect(res.textToSpeech[0]).to.be.equal('You are very close')
     *   })
     * ```
     *
     * @public
     */
    async send(input: string) {
        this._isNewConversation = false
        console.log(`> ${input}`)
        const res = await super.send(input)
        console.log(res)
        return res as AssistResponse // cast to maintain consistent shared type
    }
}
