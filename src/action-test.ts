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
import {Interactive} from './interactive'

class ActionTest {

    main(): void {
        const def = yargs
            .usage('Usage: action-test <Command>')
            .command('interactive', 'Interactive mode', (yargs) => {
                return yargs
                    .usage('Usage: action-test interactive [Options] [Action] [Prompt]')
                    .example('action-test interactive "Personal Recipe" "to find my recipes"', '')
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
            }, async (args) => {
                const actionName = args._.length >= 2 ? args._[1] : undefined
                const prompt = args._.length >= 3 ? args._[2] : undefined
                const interactive = new Interactive({
                    actionName,
                    prompt,
                    credential: args.credential,
                    locale: args.locale,
                })
                await interactive.start()
            })
            .version(false)
            .help()
            .wrap(yargs.terminalWidth())
        const args = def.argv
        if (args._.length === 0 || args._[0] !== 'interactive') {
            def.showHelp()
        }
    }

}

new ActionTest().main()
