#!/usr/bin/env node

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

import * as yargs from 'yargs'
import * as inquirer from 'inquirer'
import * as fs from 'fs'
import {ActionsOnGoogle, AssistResponse} from './actions-on-google'

class Interactive {

    async main(): Promise<void> {
        const argv = yargs
            .usage('Usage: action-interactive [Options] [Action] [Prompt]')
            .example('action-interactive -c ./credentials.json "my test app"', '')
            .option('credential', {
                alias: 'c',
                description: 'Your credential file path',
                type: 'string',
            })
            .option('locale', {
                alias: 'l',
                description: 'Locale string',
                type: 'string',
            })
            .version(false)
            .argv
        const actionName = argv._.length >= 1 ? argv._[0] : undefined
        const prompt = argv._.length >= 2 ? argv._[1] : undefined
        const credential = argv.credential || './credentials.json'
        const locale = argv.locale || 'en-US'

        let action: ActionsOnGoogle | undefined
        try {
            action = new ActionsOnGoogle(require(fs.realpathSync(credential)))
            action.setLocale(locale)

            const response = await this.start(action, actionName, prompt)
            this.conversation(action, response)
        } catch(e) {
            if (action) {
                try {
                    await action.endConversation()
                } catch(_) {
                }
            }
            console.log(`Conversation aborted: ${e.toString()}`)
        }
    }

    async conversation(action: ActionsOnGoogle, response: AssistResponse): Promise<void> {
        console.log('')
        console.log('\x1b[33m%s\x1b[0m', 'Action response:')
        console.log(response)
        console.log('')
        const isContinue = await this.check(response)
        if (isContinue) {
            const phrase = await this.hear()
            const response = await this.send(action, phrase)
            this.conversation(action, response)
        } else {
            await action.endConversation()
            console.log('End conversation.')
        }
    }

    async start(action: ActionsOnGoogle,
                actionName: string | undefined,
                prompt: string | undefined): Promise<AssistResponse> {
        return new Promise<AssistResponse>(async (resolve, reject) => {
            const response =
                actionName ?
                    await action.startConversationWith(actionName, prompt) :
                    await action.startConversation(prompt)
            resolve(response)
        })
    }

    async hear(): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            const answers = await inquirer.prompt<{ phrase: string }>([
                {
                    type: 'input',
                    name: 'phrase',
                    message: 'User phrase:',
                },
            ])
            resolve(answers.phrase)
        })
    }

    async send(action: ActionsOnGoogle, phrase: string): Promise<AssistResponse> {
        return new Promise<AssistResponse>(async (resolve, reject) => {
            resolve(await action.send(phrase))
        })
    }

    async check(response: AssistResponse): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            resolve(response.micOpen)
        })
    }

}

new Interactive().main()
