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
// Boilerplate for a test
import { AssistResponse, UserCredentials } from '../actions-on-google'
import { ActionsOnGoogleAva } from '../actions-on-google-ava'
import test from 'ava'
import * as sinon from 'sinon'
import * as winston from 'winston'
import * as Sample from './expected'

// Default logger
winston.loggers.add('DEFAULT_LOGGER', {
  format: winston.format.combine(
    winston.format.label({ label: 'Default logger' }),
    winston.format.json(),
    winston.format.colorize(),
    winston.format.timestamp(),
  ),
  transports: [
    new winston.transports.Console({ level: 'error'}),
  ],
})

const testCredentials: UserCredentials = {
  client_id: 'client_id',
  client_secret: 'client_secret',
  refresh_token: 'refresh_token',
  type: 'authorized_user',
}

const HTML_SAMPLE = '<html><body>hello</body></html>'

// Mock implementation of gRPC call that allows server response to be mocked
// tslint:disable-next-line
const getMockConversation = (data: any, audioOutBuffer?: Buffer, screenOutHtml?: String) => {
  // Wrap AoG data into object
  const audioOut = audioOutBuffer ? { audio_data: audioOutBuffer } : null
  const screenOut = screenOutHtml ? { format: 'HTML', data: screenOutHtml } : null

  const dataToSend = {
    audio_out: audioOut,
    screen_out: screenOut,
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

test.serial('sends correct request parameters - en-US', t => {
  const action = new ActionsOnGoogleAva(testCredentials)
  const mockResponse = sinon.stub(action._client, 'assist')

  mockResponse.callsFake(() => {
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
      write: (data: any) => {
        t.is(data.config.text_query, 'Talk to my test app')
        t.is(data.config.dialog_state_in.language_code, 'en-US')
        t.is(data.config.debug_config.return_debug_info, true)
      },
      end() {
        onData({})
        onEnd()
      },
    }
  })

  return action.start('')
    .then(res => {
      t.pass()
      mockResponse.restore()
    })
})

test.serial('sends correct request parameters - fr-FR', t => {
  const action = new ActionsOnGoogleAva(testCredentials)
  const mockResponse = sinon.stub(action._client, 'assist')

  mockResponse.callsFake(() => {
    // tslint:disable-next-line
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
      write: (data: any) => {
        t.is(data.config.text_query, 'Parler avec mon application test')
        t.is(data.config.dialog_state_in.language_code, 'fr-FR')
        t.is(data.config.debug_config.return_debug_info, true)
      },
      end() {
        onData({})
        onEnd()
      },
    }
  })

  action.locale = 'fr-FR'
  return action.start('')
    .then(res => {
      t.pass()
      action.locale = 'en-US'
      mockResponse.restore()
    })
})

test.serial('opens and exits action', t => {
  const action = new ActionsOnGoogleAva(testCredentials)
  const mockResponse = sinon.stub(action._client, 'assist')
  mockResponse.callsFake(() => {
    const conversation = getMockConversation(Sample.NUMBER_GENIE_WELCOME_AOG)
    return conversation
  })

  return action.start('')
    .then((res: AssistResponse) => {
      t.deepEqual(res, Sample.NUMBER_GENIE_WELCOME_VALUES)
      mockResponse.restore()
    })
})

test.serial('verifies parsing closing response of conversation', t => {
  const action = new ActionsOnGoogleAva(testCredentials)
  const mockResponse = sinon.stub(action._client, 'assist')
  mockResponse.callsFake(() => {
    const conversation = getMockConversation(Sample.NUMBER_GENIE_EXIT)
    return conversation
  })

  return action.start('')
    .then((res: AssistResponse) => {
      t.is(res.textToSpeech[0],
        '<speak>OK, I\'m already thinking of a number for next time.</speak>')
      t.is(res.displayText[0], 'OK, I\'m already thinking of a number for next time.')
      t.is(res.micOpen, false)
      mockResponse.restore()
    })
})

test.serial('verifies parsing textToSpeech, displayText, suggestions', t => {
  const action = new ActionsOnGoogleAva(testCredentials)
  const mockResponse = sinon.stub(action._client, 'assist')
  mockResponse.callsFake(() => {
    const conversation = getMockConversation(Sample.CONVERSATION_WELCOME)
    return conversation
  })

  return action.start('')
    .then((res: AssistResponse) => {
      t.is(res.textToSpeech[0], 'Hi there!')
      t.is(res.textToSpeech[1], 'I can show you basic cards, lists and carousels as well as ' +
        'suggestions on your phone')
      t.is(res.displayText[0], 'Hello there!')
      t.is(res.displayText[1], 'I can show you basic cards, lists and carousels as well as ' +
        'suggestions')
      t.deepEqual(res.suggestions, ['Basic Card', 'Browse Carousel', 'Carousel', 'List', 'Media',
        'Suggestions'])
      mockResponse.restore()
    })
})

test.serial('verifies parsing basic cards', t => {
  const action = new ActionsOnGoogleAva(testCredentials)
  const mockResponse = sinon.stub(action._client, 'assist')
  mockResponse.callsFake(() => {
    const conversation = getMockConversation(Sample.CONVERSATION_BASIC_CARDS)
    return conversation
  })

  return action.start('')
    .then((res: AssistResponse) => {
      const basicCard = res.cards![0]
      t.is(basicCard.title, 'Title: this is a title')
      t.is(basicCard.subtitle, 'This is a subtitle')
      t.is(basicCard.text, 'This is a basic card.  Text in a\n      basic card can include ' +
        '\"quotes\" and most other unicode characters\n      including emoji 📱.  Basic cards ' +
        'also support some markdown\n      formatting like *emphasis* or _italics_, **strong** or' +
        ' __bold__,\n      and ***bold itallic*** or ___strong emphasis___ as well as other ' +
        ' things\n      like line  \nbreaks')
      t.is(basicCard.imageUrl,
        'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png')
      t.is(basicCard.imageAltText, 'Image alternate text')
      t.is(basicCard.buttons[0].title, 'This is a button')
      t.is(basicCard.buttons[0].url, 'https://assistant.google.com/')
      mockResponse.restore()
    })
})

test.serial('verifies parsing a browse carousel', t => {
  const action = new ActionsOnGoogleAva(testCredentials)
  const mockResponse = sinon.stub(action._client, 'assist')
  mockResponse.callsFake(() => {
    const conversation = getMockConversation(Sample.CONVERSATION_BROWSE_CAROUSEL)
    return conversation
  })

  return action.start('')
    .then((res: AssistResponse) => {
      const firstItem = res.carousel![0]
      const secondItem = res.carousel![1]
      t.is(firstItem.title, 'Title of item 1')
      t.is(secondItem.title, 'Title of item 2')
      t.is(firstItem.description, 'Description of item 1')
      t.is(firstItem.footer, 'Item 1 footer')
      t.is(firstItem.imageUrl,
        'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png')
      t.is(firstItem.imageAltText, 'Google Assistant Bubbles')
      t.is(firstItem.url, 'https://google.com')
      mockResponse.restore()
    })
})

test.serial('verifies parsing a carousel', t => {
  const action = new ActionsOnGoogleAva(testCredentials)
  const mockResponse = sinon.stub(action._client, 'assist')
  mockResponse.callsFake(() => {
    const conversation = getMockConversation(Sample.CONVERSATION_CAROUSEL)
    return conversation
  })

  return action.start('')
    .then((res: AssistResponse) => {
      const firstItem = res.carousel![0]
      t.is(res.carousel!.length, 4)
      t.is(firstItem.title, 'Title of First List Item')
      t.is(firstItem.description, 'This is a description of a carousel item')
      t.is(firstItem.imageUrl,
        'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png')
      t.is(firstItem.imageAltText, 'Image alternate text')
      t.deepEqual(firstItem.optionInfo, {
        key: 'title',
        synonyms: [
          'synonym of title 1',
          'synonym of title 2',
          'synonym of title 3',
        ],
      })

      mockResponse.restore()
    })
})

test.serial('verifies parsing a list', t => {
  const action = new ActionsOnGoogleAva(testCredentials)
  const mockResponse = sinon.stub(action._client, 'assist'); mockResponse.callsFake(() => {
    const conversation = getMockConversation(Sample.CONVERSATION_LIST)
    return conversation
  })

  return action.start('')
    .then((res: AssistResponse) => {
      const firstItem = res.list!.items[0]
      t.is(res.list!.items.length, 4)
      t.is(firstItem.title, 'Title of First List Item')
      t.is(firstItem.description, 'This is a description of a list item')
      t.is(firstItem.imageUrl,
        'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png')
      t.is(firstItem.imageAltText, 'Image alternate text')
      t.deepEqual(firstItem.optionInfo, {
        key: 'title',
        synonyms: [
          'synonym of title 1',
          'synonym of title 2',
          'synonym of title 3',
        ],
      })

      mockResponse.restore()
    })
})

test.serial('verifies parsing a media response with icon', t => {
  const action = new ActionsOnGoogleAva(testCredentials)
  const mockResponse = sinon.stub(action._client, 'assist')
  mockResponse.callsFake(() => {
    const conversation = getMockConversation(Sample.CONVERSATION_MEDIA_WITH_ICON)
    return conversation
  })

  return action.start('')
    .then((res: AssistResponse) => {
      t.is(res.mediaResponse!.type, 'AUDIO')
      t.is(res.mediaResponse!.name, 'Jazz in Paris')
      t.is(res.mediaResponse!.description, 'A funky Jazz tune')
      t.is(res.mediaResponse!.sourceUrl,
        'http://storage.googleapis.com/automotive-media/Jazz_In_Paris.mp3')
      t.is(res.mediaResponse!.icon,
        'http://storage.googleapis.com/automotive-media/album_art.jpg')
      t.is(res.mediaResponse!.largeImage, undefined)
      mockResponse.restore()
    })
})

test.serial('verifies parsing a media response with largeImage', t => {
    const action = new ActionsOnGoogleAva(testCredentials)
    const mockResponse = sinon.stub(action._client, 'assist')
    mockResponse.callsFake(() => {
        const conversation = getMockConversation(Sample.CONVERSATION_MEDIA_WITH_LARGEIMAGE)
        return conversation
    })

    return action.start('')
        .then((res: AssistResponse) => {
            t.is(res.mediaResponse!.type, 'AUDIO')
            t.is(res.mediaResponse!.name, 'Jazz in Paris')
            t.is(res.mediaResponse!.description, 'A funky Jazz tune')
            t.is(res.mediaResponse!.sourceUrl,
                'http://storage.googleapis.com/automotive-media/Jazz_In_Paris.mp3')
            t.is(res.mediaResponse!.icon, undefined)
            t.is(res.mediaResponse!.largeImage,
                'http://storage.googleapis.com/automotive-media/album_art.jpg')
            mockResponse.restore()
        })
})

test.serial('verifies parsing a linkout suggestion', t => {
  const action = new ActionsOnGoogleAva(testCredentials)
  const mockResponse = sinon.stub(action._client, 'assist')
  mockResponse.callsFake(() => {
    const conversation = getMockConversation(Sample.CONVERSATION_LINKOUT_SUGGESTION)
    return conversation
  })

  return action.start('')
    .then((res: AssistResponse) => {
      t.is(res.linkOutSuggestion!.url, 'https://assistant.google.com/')
      t.is(res.linkOutSuggestion!.name, 'Suggestion Link')
      mockResponse.restore()
    })
})

test.serial('verifies parsing a table', t => {
  const action = new ActionsOnGoogleAva(testCredentials)
  const mockResponse = sinon.stub(action._client, 'assist')
  mockResponse.callsFake(() => {
    const conversation = getMockConversation(Sample.CONVERSATION_TABLE)
    return conversation
  })

  return action!.start('')
    .then((res: AssistResponse) => {
      t.deepEqual(res.table!.headers, ['header 1', 'header 2', 'header 3'])
      t.deepEqual(res.table!.rows[0].cells, ['row 1 item 1', 'row 1 item 2', 'row 1 item 3'])
      t.is(res.table!.rows[0].divider, true)
      t.is(res.table!.rows.length, 2)
      mockResponse.restore()
    })
})

test.serial('verifies parsing a sign in intent', t => {
  const action = new ActionsOnGoogleAva(testCredentials)
  const mockResponse = sinon.stub(action._client, 'assist')
  mockResponse.callsFake(() => {
    const conversation = getMockConversation(Sample.CONVERSATION_SIGN_IN)
    return conversation
  })

  return action!.start('')
    .then((res: AssistResponse) => {
      t.is(res.signInIntent, true)
      mockResponse.restore()
    })
})

test.serial('verifies parsing a new surface intent', t => {
  const action = new ActionsOnGoogleAva(testCredentials)
  const mockResponse = sinon.stub(action._client, 'assist')
  mockResponse.callsFake(() => {
    const conversation = getMockConversation(Sample.CONVERSATION_NEW_SURFACE)
    return conversation
  })

  return action!.start('')
    .then((res: AssistResponse) => {
      t.deepEqual(res.newSurface!.capabilities, ['actions.capability.SCREEN_OUTPUT'])
      t.is(res.newSurface!.context, 'There is more information available.')
      t.is(res.newSurface!.notificationTitle, 'Transferring to your phone')
      mockResponse.restore()
    })
})

test.serial('verifies missing audioOut (default setting)', t => {
  const action = new ActionsOnGoogleAva(testCredentials)
  const mockResponse = sinon.stub(action._client, 'assist')
  mockResponse.callsFake(() => {
    const conversation = getMockConversation(Sample.CONVERSATION_WELCOME, Buffer.alloc(0))
    return conversation
  })

  return action!.start('')
    .then((res: AssistResponse) => {
      t.falsy(res.audioOut)
      mockResponse.restore()
    })
})

test.serial('verifies receipt of audioOut', t => {
  const action = new ActionsOnGoogleAva(testCredentials)
  action.include.audioOut = true
  const mockResponse = sinon.stub(action._client, 'assist')
  mockResponse.callsFake(() => {
    const conversation = getMockConversation(Sample.CONVERSATION_WELCOME, Buffer.alloc(0))
    return conversation
  })

  return action!.start('')
    .then((res: AssistResponse) => {
      t.truthy(res.audioOut)
      mockResponse.restore()
    })
})

test.serial('verifies missing screenOutHtml (default setting)', t => {
  const action = new ActionsOnGoogleAva(testCredentials)
  const mockResponse = sinon.stub(action._client, 'assist')
  mockResponse.callsFake(() => {
    const conversation = getMockConversation(Sample.CONVERSATION_WELCOME, undefined, HTML_SAMPLE)
    return conversation
  })

  return action!.start('')
    .then((res: AssistResponse) => {
      t.falsy(res.screenOutHtml)
      mockResponse.restore()
    })
})

test.serial('verifies receipt of screenOutHtml', t => {
  const action = new ActionsOnGoogleAva(testCredentials)
  action.include.screenOut = true
  const mockResponse = sinon.stub(action._client, 'assist')
  mockResponse.callsFake(() => {
    const conversation = getMockConversation(Sample.CONVERSATION_WELCOME, undefined, HTML_SAMPLE)
    return conversation
  })

  return action!.start('')
    .then((res: AssistResponse) => {
      t.is(res.screenOutHtml, HTML_SAMPLE)
      mockResponse.restore()
    })
})