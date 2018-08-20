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

import * as fs from 'fs'
import * as readline from 'readline'
import {ActionsOnGoogle, AssistResponse} from './actions-on-google'

export class Interactive {

    _action: ActionsOnGoogle

    constructor(
        private params: {
            actionName: string | undefined,
            prompt: string | undefined,
            credential: string | undefined,
            locale: string | undefined,
        }) {
        const credential = this.params.credential || './credentials.json'
        const locale = this.params.locale || 'en-US'
        this._action = this.createActionsOnGoogle(credential, locale)
    }

    async start(): Promise<void> {
        try {
            const response = await this.invokeAction(
                this.params.actionName, this.params.prompt)
            await this.conversation(response)
        } catch(e) {
            try {
                await this._action.endConversation()
            } catch(_) {
            }
            this.output([
                '',
                `Conversation aborted: ${e.toString()}`,
            ])
        }
    }

    output(messages: (string | AssistResponse)[]): void {
        messages.forEach((message: string) => {
            console.log(message)
        })
    }

    private createActionsOnGoogle(credential: string, locale: string): ActionsOnGoogle {
        const action = new ActionsOnGoogle(require(fs.realpathSync(credential)))
        action.setLocale(locale)
        return action
    }

    private async conversation(response: AssistResponse): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            this.output([
                '',
                'Action response:',
                response,
                '',
            ])
            try {
                const isContinue = await this.check(response)
                if (isContinue) {
                    let phrase = undefined
                    while (!phrase || phrase.length === 0) {
                        phrase = await this.hear()
                    }
                    const response = await this.send(phrase)
                    await this.conversation(response)
                } else {
                    await this._action.endConversation()
                    this.output([
                        'End conversation.',
                    ])
                }
                resolve()
            } catch(e) {
                reject(e)
            }
        })
    }

    private async invokeAction(actionName: string | undefined,
                               prompt: string | undefined): Promise<AssistResponse> {
        return new Promise<AssistResponse>(async (resolve, reject) => {
            try {
                const response =
                    actionName ?
                        await this._action.startConversationWith(actionName, prompt) :
                        await this._action.startConversation(prompt)
                resolve(response)
            } catch(e) {
                reject(e)
            }
        })
    }

    async hear(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            })
            rl.on('SIGINT', () => {
                rl.close()
                console.log('')
                reject('SIGINT')
            })
            rl.question('> ', answer => {
                rl.close()
                resolve(answer)
            })
        })
    }

    private async send(phrase: string): Promise<AssistResponse> {
        return new Promise<AssistResponse>(async (resolve, reject) => {
            try {
                resolve(await this._action.send(phrase))
            } catch(e) {
                reject(e)
            }
        })
    }

    private async check(response: AssistResponse): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            resolve(response.micOpen)
        })
    }

}
