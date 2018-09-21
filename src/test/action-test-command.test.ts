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

import test from 'ava'
import * as sinon from 'sinon'
import {ActionTestCommand} from '../action-test-command'

test('When any arguments not specified', t => {
    const subject = new ActionTestCommand()

    const subjectMock = sinon.mock(subject)
    subjectMock
        .expects('_showHelp')
        .once()

    process.argv = ['node', 'main.js']

    subject.main()

    subjectMock.verify()
    t.pass()
})

test('When interactive specified', t => {
    const subject = new ActionTestCommand()

    const interactive = {start: () => {}}
    const interactiveSpy = sinon.spy(interactive, 'start')
    const subjectMock = sinon.mock(subject)
    subjectMock
        .expects('_createInteractive')
        .withArgs(undefined, undefined, './credentials.json', 'en-US')
        .returns(interactive)

    process.argv = ['node', 'main.js', 'interactive']

    subject.main()

    subjectMock.verify()
    t.is(interactiveSpy.calledOnce, true)
})
