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

    startTest(testName: string, callback: (t: ActionsOnGoogleAva) => Promise<AssistResponse>) {
        this._isNewConversation = true
        test.cb(testName, t => {
            this._t = t
            this._t.plan(1)
            console.log(`** Starting test ${testName} **`)
            callback(this)
                .finally(() => {
                    return this.endConversation()
                        .then((res) => {
                            console.log('debug: test ends')
                            this._t.end()
                            console.log('\n')
                        })
                })
        })
    }

    endTest() {
        console.log('debug: test passes')
        this._t.pass()
        return Promise.resolve()
    }

    send(input: string) {
        this._isNewConversation = false
        console.log(`> ${input}`)
        return super.send(input)
            .then((res) => {
                console.log(res)
                return Promise.resolve(res)
            })
    }
}