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

// Mock implementation of gRPC call that allows server response to be mocked
// tslint:disable-next-line
export const getMockConversation = (data: any) => {
    // Wrap AoG data into object
    const dataToSend = {
        debug_info: {
            aog_agent_to_assistant_json: JSON.stringify(data),
        },
    }
    let onData: Function, onEnd: Function
    return {
        on: (event: string, call: Function) => {
            if (event === 'data') {
                onData = call
            } else if (event === 'end') {
                onEnd = call
            }
        },
        // tslint:disable-next-line
        write: (data: any) => { },
        end() {
            onData(dataToSend)
            onEnd()
        },
    }
}
