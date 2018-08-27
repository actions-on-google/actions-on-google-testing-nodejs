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
import {ActionsOnGoogle, SendResponse, UserCredentials} from './actions-on-google'
import * as fs from 'fs'
import * as unzip from 'unzip'
import * as readline from 'readline'

export interface ActionsOnGoogleAvaOptions {
    actionPackage?: string
    dialogflowZip?: string
}

promiseFinally.shim()

export class ActionsOnGoogleAva extends ActionsOnGoogle {
    // tslint:disable-next-line
    _t: GenericCallbackTestContext<any>
    _options?: ActionsOnGoogleAvaOptions
    _queryMatchedIntents: Set<string>

    constructor(credentials: UserCredentials, options?: ActionsOnGoogleAvaOptions) {
        super(credentials)
        this._options = options
        this._queryMatchedIntents = new Set<string>()
    }

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
                    return this.cancel()
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
        return super.doSend(input)
            .then((res: SendResponse) => {
                const {assistResponse, additionalResponse} = res
                if (additionalResponse.queryMatchedIntent) {
                    this._queryMatchedIntents.add(additionalResponse.queryMatchedIntent)
                }
                console.log(assistResponse)
                return Promise.resolve(assistResponse)
            })
    }

    reportIntentCoverage(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const dialogflowZip = this.getDialogflowZipPath()
            if (dialogflowZip) {
                this.loadIntentsFromDialogflowZip(dialogflowZip)
                    .then((allIntents: string[]) => {
                        const matchedCount = allIntents.reduce((a: number, c: string): number => {
                            return a += this._queryMatchedIntents.has(c) ? 1 : 0
                        }, 0)
                        const converage = (matchedCount / allIntents.length * 100).toFixed(2)
                        const fraction = `${matchedCount}/${allIntents.length}`
                        console.log(`${converage}% (${fraction}) of intents covered in your tests.`)
                        resolve()
                    })
            } else {
                resolve()
            }
        })
    }

    private getDialogflowZipPath(): string | undefined {
        if (this._options) {
            if (this._options.actionPackage) {
                return this._options.actionPackage
            } else if (this._options.dialogflowZip) {
                return this._options.dialogflowZip
            }
        }
        return undefined
    }

    private loadIntentsFromDialogflowZip(dialogflowZip: string): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            const intents: string[] = []
            fs.createReadStream(fs.realpathSync(dialogflowZip))
                .pipe(unzip.Parse())
                .on('entry', entry => {
                    if (entry.path.startsWith('intents/') && !/says_.+\.json/.test(entry.path)) {
                        const buf: string[] = []
                        const reader = readline.createInterface({input: entry})
                        reader.on('line', data => {
                            buf.push(data)
                        })
                        reader.on('close', () => {
                            const intent = JSON.parse(buf.join('\n'))
                            intents.push(intent.id)
                        })
                    } else {
                        entry.autodrain()
                    }
                })
                .on('close', () => {
                    resolve(intents)
                })
        })
    }

}