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

export interface InteractiveParameters {
    actionName: string | undefined
    prompt: string | undefined
    credential: string | undefined
    locale: string | undefined
}

export class Interactive {

    constructor(private params: InteractiveParameters) {
    }

    async start(): Promise<void> {
        const credential = this.params.credential || './credentials.json'
        const locale = this.params.locale || 'en-US'

        let action: ActionsOnGoogle | undefined
        try {
            action = new ActionsOnGoogle(require(fs.realpathSync(credential)))
            action.setLocale(locale)

            const response = await this.invokeAction(
                action, this.params.actionName, this.params.prompt)
            await this.conversation(action, response)
        } catch(e) {
            if (action) {
                try {
                    await action.endConversation()
                } catch(_) {
                }
            }
            console.log('')
            console.log(`Conversation aborted: ${e.toString()}`)
        }
    }

    private async conversation(action: ActionsOnGoogle, response: AssistResponse): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            console.log('')
            console.log('Action response:')
            console.log(response)
            console.log('')
            try {
                const isContinue = await this.check(response)
                if (isContinue) {
                    const phrase = await this.hear()
                    const response = await this.send(action, phrase)
                    await this.conversation(action, response)
                } else {
                    await action.endConversation()
                    console.log('End conversation.')
                }
                resolve()
            } catch(e) {
                reject(e)
            }
        })
    }

    private async invokeAction(action: ActionsOnGoogle,
                       actionName: string | undefined,
                       prompt: string | undefined): Promise<AssistResponse> {
        return new Promise<AssistResponse>(async (resolve, reject) => {
            try {
                const response =
                    actionName ?
                        await action.startConversationWith(actionName, prompt) :
                        await action.startConversation(prompt)
                resolve(response)
            } catch(e) {
                reject(e)
            }
        })
    }

    private async hear(): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            })
            rl.on('SIGINT', () => {
                rl.close()
                console.log('')
                reject('SIGINT')
            })
            rl.question('> ', async answer => {
                rl.close()
                if (!answer || answer.length === 0) {
                    console.log('Please enter a user phrase.')
                    resolve(await this.hear())
                } else {
                    resolve(answer)
                }
            })
        })
    }

    private async send(action: ActionsOnGoogle, phrase: string): Promise<AssistResponse> {
        return new Promise<AssistResponse>(async (resolve, reject) => {
            try {
                resolve(await action.send(phrase))
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
