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
// Version of Google Assistant with Ava testing framework wrapping

'use strict';
const test = require('ava');

const ActionsOnGoogle = require('./actions-on-google');
const promiseFinally = require('promise.prototype.finally');
promiseFinally.shim();

class ActionsOnGoogleAva extends ActionsOnGoogle {
    constructor(credentials) {
        super(credentials);
    }

    startTest(testname, callback) {
        this.isNewConversation = true;
        test.cb(testname, t => {
            this.t_ = t;
            this.t_.plan(1);
            console.log(`** Starting test ${testname} **`);
            callback(this)
                .finally(() => {
                    return this.endConversation()
                        .then((res) => {
                            console.log('debug: test ends');
                            this.t_.end();
                            console.log('\n');
                        });
                })
        });
    }

    endTest() {
        console.log('debug: test passes');
        this.t_.pass();
        return Promise.resolve();
    }

    send(input) {
        this.isNewConversation = false;
        console.log(`> ${input}`);
        return super.send(input)
            .then((res) => {
                console.log(res);
                return Promise.resolve(res);
            });
    }
}

module.exports = ActionsOnGoogleAva;