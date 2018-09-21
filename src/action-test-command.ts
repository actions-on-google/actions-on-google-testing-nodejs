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
import {Interactive} from './interactive'

export class ActionTestCommand {

    main(): void {
        const def = this._createArgumentsDefinition()
        const args = def.argv
        if (args._.length === 0 || args._[0] !== 'interactive') {
            this._showHelp(def)
        }
    }

    _createArgumentsDefinition(): yargs.Argv {
        return yargs(process.argv.slice(2))
            .usage('Usage: action-test <Command>')
            .command('interactive', 'Interactive mode', (yargs: yargs.Argv) => {
                return yargs
                    .usage('Usage: action-test interactive [Options] [Action] [Prompt]')
                    .example('action-test interactive "Personal Recipe" "to find my recipes"',
                        '')
                    .option('credential', {
                        alias: 'c',
                        description: 'Your credential file path',
                        default: './credentials.json',
                        type: 'string',
                    })
                    .option('locale', {
                        alias: 'l',
                        description: 'Locale string',
                        default: 'en-US',
                        type: 'string',
                    })
            }, async (args: yargs.Arguments) => {
                await this._startInteraction(
                    args._.length >= 2 ? args._[1] : undefined,
                    args._.length >= 3 ? args._[2] : undefined,
                    args.credential,
                    args.locale,
                )
            })
            .fail((msg: string, err: Error) => {
                this._onFailInteraction(err.message)
            })
            .version(false)
            .help()
            .wrap(yargs.terminalWidth())
    }

    async _startInteraction(actionName: string | undefined,
                            prompt: string | undefined,
                            credential: string | undefined,
                            locale: string | undefined): Promise<void> {
        const interactive = this._createInteractive(actionName, prompt, credential, locale)
        await interactive.start()
    }

    _createInteractive(actionName: string | undefined,
                       prompt: string | undefined,
                       credential: string | undefined,
                       locale: string | undefined): Interactive {
        return new Interactive({
            actionName,
            prompt,
            credential,
            locale,
        })
    }

    _onFailInteraction(message: string): void {
        console.error(message)
    }

    _showHelp(def: yargs.Argv): void {
        def.showHelp()
    }

}
