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

export class ActionsOnGoogleAva extends ActionsOnGoogle {
    // tslint:disable-next-line
    _t: GenericCallbackTestContext<any>

    // It doesn't matter what type of Promise being returned
    // tslint:disable-next-line
    startTest(testName: string, callback: (t: ActionsOnGoogleAva) => Promise<any>) {
        this._isNewConversation = true
        test.cb(testName, t => {
            this._t = t
            this._t.plan(1)
            console.log(`** Starting test ${testName} **`)
            callback(this)
                .then(() => {
                    // The test has completed successfully
                    // If the test exits early, only the
                    // `finally` function will be run
                    console.log('test passes')
                    this._t.pass()
                })
                .catch((e: Error) => {
                    console.log('test error', e)
                })
                .finally(() => {
                    return this.endConversation()
                        .then((res) => {
                            console.log('test ends')
                            this._t.end()
                            console.log('\n')
                        })
                })
        })
    }

    send(input: string) {
        this._isNewConversation = false
        console.log(`> ${input}`)
        return super.send(input)
            .then((res) => {
                console.log(res)
                return res as AssistResponse // cast to maintain consistent shared type
            })
    }
}
