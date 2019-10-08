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

/* tslint:disable max-line-length */
export const NUMBER_GENIE_WELCOME_AOG = {
  conversationToken: '[\"_actions_on_google\",\"game\"]',
  expectUserResponse: true,
  expectedInputs: [
    {
      inputPrompt: {
        richInitialPrompt: {
          items: [
            {
              simpleResponse: {
                textToSpeech: '<speak>Hi! I\'m thinking of a number from 0 to 100.</speak>',
                displayText: 'Hi! I\'m thinking of a number from 0 to 100.',
              },
            },
            {
              simpleResponse: {
                textToSpeech: '<speak>What\'s your first guess?</speak>',
                displayText: 'What\'s your first guess?',
              },
            },
            {
              basicCard: {
                formattedText: 'Few have cracked this one on the first try',
                image: {
                  url: 'https://project-id.firebaseapp.com/images/INTRO.gif',
                  accessibilityText: 'mystical crystal ball',
                },
              },
            },
          ],
          suggestions: [
            {
              title: '37',
            },
            {
              title: '10',
            },
            {
              title: '78',
            },
            {
              title: '34',
            },
          ],
        },
      },
      possibleIntents: [
        {
          intent: 'assistant.intent.action.TEXT',
        },
        {
          intent: '1e46ffc2-651f-4ac0-a54e-9698feb88880',
        },
        {
          intent: '19a87eed-4b5f-4aed-b771-bc9f2313cad2',
        },
      ],
    },
  ],
  responseMetadata: {
    status: {
      message: 'Success (200)',
    },
    queryMatchInfo: {
      queryMatched: true,
      intent: '56da4637-0419-46b2-b851-d7bf726b1b1b',
    },
  },
  userStorage: '{\"data\":{}}',
}

export const NUMBER_GENIE_WELCOME_VALUES = {
  micOpen: true,
  textToSpeech: [
    '<speak>Hi! I\'m thinking of a number from 0 to 100.</speak>',
    '<speak>What\'s your first guess?</speak>',
  ],
  displayText: [
    'Hi! I\'m thinking of a number from 0 to 100.',
    'What\'s your first guess?',
  ],
  ssml: [],
  cards: [{
    title: undefined,
    subtitle: undefined,
    text: 'Few have cracked this one on the first try',
    imageUrl: 'https://project-id.firebaseapp.com/images/INTRO.gif',
    imageAltText: 'mystical crystal ball',
    buttons: [],
  }],
  suggestions: ['37', '10', '78', '34'],
}

export const NUMBER_GENIE_EXIT = {
  conversationToken: '[\"_actions_on_google\",\"game\",\"yes_no\"]',
  finalResponse: {
    richResponse: {
      items: [
        {
          simpleResponse: {
            textToSpeech: '<speak>OK, I\'m already thinking of a number for next time.</speak>',
            displayText: 'OK, I\'m already thinking of a number for next time.',
          },
        },
      ],
    },
  },
  responseMetadata: {
    status: {
      message: 'Success (200)',
    },
    queryMatchInfo: {
      queryMatched: true,
      intent: '2ae41bb5-5423-414d-9190-1b6dd460e12f',
    },
  },
  userStorage: '{\"data\":{}}',
}

export const CONVERSATION_WELCOME = {
  conversationToken: '[\"_actions_on_google_\"]',
  expectUserResponse: true,
  expectedInputs: [
    {
      inputPrompt: {
        richInitialPrompt: {
          items: [
            {
              simpleResponse: {
                textToSpeech: 'Hi there!',
                displayText: 'Hello there!',
              },
            },
            {
              simpleResponse: {
                textToSpeech: 'I can show you basic cards, lists and carousels as well as suggestions on your phone',
                displayText: 'I can show you basic cards, lists and carousels as well as suggestions',
              },
            },
          ],
          suggestions: [
            {
              title: 'Basic Card',
            },
            {
              title: 'Browse Carousel',
            },
            {
              title: 'Carousel',
            },
            {
              title: 'List',
            },
            {
              title: 'Media',
            },
            {
              title: 'Suggestions',
            },
          ],
        },
      },
      possibleIntents: [
        {
          intent: 'assistant.intent.action.TEXT',
        },
      ],
    },
  ],
  responseMetadata: {
    status: {
      message: 'Success (200)',
    },
    queryMatchInfo: {
      queryMatched: true,
      intent: 'f15093e2-68b5-4fee-9177-697b72704156',
    },
  },
}

export const CONVERSATION_BASIC_CARDS = {
  conversationToken: '[\"_actions_on_google_\"]',
  expectUserResponse: true,
  expectedInputs: [
    {
      inputPrompt: {
        richInitialPrompt: {
          items: [
            {
              simpleResponse: {
                textToSpeech: 'This is the first simple response for a basic card',
              },
            },
            {
              basicCard: {
                title: 'Title: this is a title',
                subtitle: 'This is a subtitle',
                formattedText: 'This is a basic card.  Text in a\n      basic card can include \"quotes\" and most other unicode characters\n      including emoji 📱.  Basic cards also support some markdown\n      formatting like *emphasis* or _italics_, **strong** or __bold__,\n      and ***bold itallic*** or ___strong emphasis___ as well as other  things\n      like line  \nbreaks',
                image: {
                  url: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
                  accessibilityText: 'Image alternate text',
                },
                buttons: [
                  {
                    title: 'This is a button',
                    openUrlAction: {
                      url: 'https://assistant.google.com/',
                    },
                  },
                ],
              },
            },
            {
              simpleResponse: {
                textToSpeech: 'This is the 2nd simple response ',
                displayText: 'This is the 2nd simple response',
              },
            },
          ],
          suggestions: [
            {
              title: 'Basic Card',
            },
            {
              title: 'Browse Carousel',
            },
            {
              title: 'Carousel',
            },
            {
              title: 'List',
            },
            {
              title: 'Media',
            },
            {
              title: 'Suggestions',
            },
          ],
        },
      },
      possibleIntents: [
        {
          intent: 'assistant.intent.action.TEXT',
        },
      ],
    },
  ],
  responseMetadata: {
    status: {
      message: 'Success (200)',
    },
    queryMatchInfo: {
      queryMatched: true,
      intent: '8903950b-e908-424d-938f-4c4b2c2e9647',
    },
  },
}

export const CONVERSATION_BROWSE_CAROUSEL = {
  conversationToken: '[\"_actions_on_google_\"]',
  expectUserResponse: true,
  expectedInputs: [
    {
      inputPrompt: {
        richInitialPrompt: {
          items: [
            {
              simpleResponse: {
                textToSpeech: 'This is an example of a \"Browse Carousel\"',
              },
            },
            {
              carouselBrowse: {
                items: [
                  {
                    title: 'Title of item 1',
                    description: 'Description of item 1',
                    footer: 'Item 1 footer',
                    image: {
                      url: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
                      accessibilityText: 'Google Assistant Bubbles',
                    },
                    openUrlAction: {
                      url: 'https://google.com',
                    },
                  },
                  {
                    title: 'Title of item 2',
                    description: 'Description of item 2',
                    footer: 'Item 2 footer',
                    image: {
                      url: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
                      accessibilityText: 'Google Assistant Bubbles',
                    },
                    openUrlAction: {
                      url: 'https://google.com',
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      possibleIntents: [
        {
          intent: 'assistant.intent.action.TEXT',
        },
      ],
    },
  ],
  responseMetadata: {
    status: {
      message: 'Success (200)',
    },
    queryMatchInfo: {
      queryMatched: true,
      intent: 'b3955ceb-cbfb-41a2-85b8-94f1598318e4',
    },
  },
}

export const CONVERSATION_CAROUSEL = {
  conversationToken: '[\"_actions_on_google_\"]',
  expectUserResponse: true,
  expectedInputs: [
    {
      inputPrompt: {
        richInitialPrompt: {
          items: [
            {
              simpleResponse: {
                textToSpeech: 'This is a simple response for a carousel',
              },
            },
          ],
          suggestions: [
            {
              title: 'Basic Card',
            },
            {
              title: 'Browse Carousel',
            },
            {
              title: 'Carousel',
            },
            {
              title: 'List',
            },
            {
              title: 'Media',
            },
            {
              title: 'Suggestions',
            },
          ],
        },
      },
      possibleIntents: [
        {
          intent: 'actions.intent.OPTION',
          inputValueData: {
            '@type': 'type.googleapis.com/google.actions.v2.OptionValueSpec',
            carouselSelect: {
              items: [
                {
                  optionInfo: {
                    key: 'title',
                    synonyms: [
                      'synonym of title 1',
                      'synonym of title 2',
                      'synonym of title 3',
                    ],
                  },
                  title: 'Title of First List Item',
                  description: 'This is a description of a carousel item',
                  image: {
                    url: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
                    accessibilityText: 'Image alternate text',
                  },
                },
                {
                  optionInfo: {
                    key: 'googleHome',
                    synonyms: [
                      'Google Home Assistant',
                      'Assistant on the Google Home',
                    ],
                  },
                  title: 'Google Home',
                  description: 'Google Home is a voice-activated speaker powered by the Google Assistant.',
                  image: {
                    url: 'https://lh3.googleusercontent.com/Nu3a6F80WfixUqf_ec_vgXy_c0-0r4VLJRXjVFF_X_CIilEu8B9fT35qyTEj_PEsKw',
                    accessibilityText: 'Google Home',
                  },
                },
                {
                  optionInfo: {
                    key: 'googlePixel',
                    synonyms: [
                      'Google Pixel XL',
                      'Pixel',
                      'Pixel XL',
                    ],
                  },
                  title: 'Google Pixel',
                  description: 'Pixel. Phone by Google.',
                  image: {
                    url: 'https://storage.googleapis.com/madebygoog/v1/Pixel/Pixel_ColorPicker/Pixel_Device_Angled_Black-720w.png',
                    accessibilityText: 'Google Pixel',
                  },
                },
                {
                  optionInfo: {
                    key: 'googleAllo',
                    synonyms: [
                      'Allo',
                    ],
                  },
                  title: 'Google Allo',
                  description: 'Introducing Google Allo, a smart messaging app that helps you say more and do more.',
                  image: {
                    url: 'https://allo.google.com/images/allo-logo.png',
                    accessibilityText: 'Google Allo Logo',
                  },
                },
              ],
            },
          },
        },
      ],
    },
  ],
  responseMetadata: {
    status: {
      message: 'Success (200)',
    },
    queryMatchInfo: {
      queryMatched: true,
      intent: '62546fe3-a3f9-408c-b83f-89eefd5ebcfd',
    },
  },
}

export const CONVERSATION_LIST = {
  conversationToken: '[\"_actions_on_google_\",\"list_selection\"]',
  expectUserResponse: true,
  expectedInputs: [
    {
      inputPrompt: {
        richInitialPrompt: {
          items: [
            {
              simpleResponse: {
                textToSpeech: 'This is a simple response for a list',
              },
            },
          ],
          suggestions: [
            {
              title: 'Basic Card',
            },
            {
              title: 'Browse Carousel',
            },
            {
              title: 'Carousel',
            },
            {
              title: 'List',
            },
            {
              title: 'Media',
            },
            {
              title: 'Suggestions',
            },
          ],
        },
      },
      possibleIntents: [
        {
          intent: 'actions.intent.OPTION',
          inputValueData: {
            '@type': 'type.googleapis.com/google.actions.v2.OptionValueSpec',
            listSelect: {
              title: 'List Title',
              items: [
                {
                  optionInfo: {
                    key: 'title',
                    synonyms: [
                      'synonym of title 1',
                      'synonym of title 2',
                      'synonym of title 3',
                    ],
                  },
                  title: 'Title of First List Item',
                  description: 'This is a description of a list item',
                  image: {
                    url: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
                    accessibilityText: 'Image alternate text',
                  },
                },
                {
                  optionInfo: {
                    key: 'googleHome',
                    synonyms: [
                      'Google Home Assistant',
                      'Assistant on the Google Home',
                    ],
                  },
                  title: 'Google Home',
                  description: 'Google Home is a voice-activated speaker powered by the Google Assistant.',
                  image: {
                    url: 'https://lh3.googleusercontent.com/Nu3a6F80WfixUqf_ec_vgXy_c0-0r4VLJRXjVFF_X_CIilEu8B9fT35qyTEj_PEsKw',
                    accessibilityText: 'Google Home',
                  },
                },
                {
                  optionInfo: {
                    key: 'googlePixel',
                    synonyms: [
                      'Google Pixel XL',
                      'Pixel',
                      'Pixel XL',
                    ],
                  },
                  title: 'Google Pixel',
                  description: 'Pixel. Phone by Google.',
                  image: {
                    url: 'https://storage.googleapis.com/madebygoog/v1/Pixel/Pixel_ColorPicker/Pixel_Device_Angled_Black-720w.png',
                    accessibilityText: 'Google Pixel',
                  },
                },
                {
                  optionInfo: {
                    key: 'googleAllo',
                    synonyms: [
                      'Allo',
                    ],
                  },
                  title: 'Google Allo',
                  description: 'Introducing Google Allo, a smart messaging app that helps you say more and do more.',
                  image: {
                    url: 'https://allo.google.com/images/allo-logo.png',
                    accessibilityText: 'Google Allo Logo',
                  },
                },
              ],
            },
          },
        },
      ],
    },
  ],
  responseMetadata: {
    status: {
      message: 'Success (200)',
    },
    queryMatchInfo: {
      queryMatched: true,
      intent: '16fdf55a-d1d6-48a8-8909-8b9e1f023fac',
    },
  },
}

export const CONVERSATION_MEDIA_WITH_ICON = {
  conversationToken: '[\"_actions_on_google_\"]',
  expectUserResponse: true,
  expectedInputs: [
    {
      inputPrompt: {
        richInitialPrompt: {
          items: [
            {
              simpleResponse: {
                textToSpeech: 'This is the first simple response for a media response',
              },
            },
            {
              mediaResponse: {
                mediaType: 'AUDIO',
                mediaObjects: [
                  {
                    name: 'Jazz in Paris',
                    description: 'A funky Jazz tune',
                    contentUrl: 'http://storage.googleapis.com/automotive-media/Jazz_In_Paris.mp3',
                    icon: {
                      url: 'http://storage.googleapis.com/automotive-media/album_art.jpg',
                    },
                  },
                ],
              },
            },
          ],
          suggestions: [
            {
              title: 'Basic Card',
            },
            {
              title: 'Browse Carousel',
            },
            {
              title: 'Carousel',
            },
            {
              title: 'List',
            },
            {
              title: 'Media',
            },
            {
              title: 'Suggestions',
            },
          ],
        },
      },
      possibleIntents: [
        {
          intent: 'assistant.intent.action.TEXT',
        },
      ],
    },
  ],
  responseMetadata: {
    status: {
      message: 'Success (200)',
    },
    queryMatchInfo: {
      queryMatched: true,
      intent: '88cb82e1-9d72-4d70-bef1-be5b39dff99f',
    },
  },
}

export const CONVERSATION_MEDIA_WITH_LARGEIMAGE = {
    conversationToken: '[\"_actions_on_google_\"]',
    expectUserResponse: true,
    expectedInputs: [
        {
            inputPrompt: {
                richInitialPrompt: {
                    items: [
                        {
                            simpleResponse: {
                                textToSpeech: 'This is the first simple response for a media response',
                            },
                        },
                        {
                            mediaResponse: {
                                mediaType: 'AUDIO',
                                mediaObjects: [
                                    {
                                        name: 'Jazz in Paris',
                                        description: 'A funky Jazz tune',
                                        contentUrl: 'http://storage.googleapis.com/automotive-media/Jazz_In_Paris.mp3',
                                        largeImage: {
                                            url: 'http://storage.googleapis.com/automotive-media/album_art.jpg',
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                    suggestions: [
                        {
                            title: 'Basic Card',
                        },
                        {
                            title: 'Browse Carousel',
                        },
                        {
                            title: 'Carousel',
                        },
                        {
                            title: 'List',
                        },
                        {
                            title: 'Media',
                        },
                        {
                            title: 'Suggestions',
                        },
                    ],
                },
            },
            possibleIntents: [
                {
                    intent: 'assistant.intent.action.TEXT',
                },
            ],
        },
    ],
    responseMetadata: {
        status: {
            message: 'Success (200)',
        },
        queryMatchInfo: {
            queryMatched: true,
            intent: '88cb82e1-9d72-4d70-bef1-be5b39dff99f',
        },
    },
}

export const CONVERSATION_LINKOUT_SUGGESTION = {
  conversationToken: '[\"_actions_on_google_\"]',
  expectUserResponse: true,
  expectedInputs: [
    {
      inputPrompt: {
        richInitialPrompt: {
          items: [
            {
              simpleResponse: {
                textToSpeech: 'This is a simple response for suggestions',
              },
            },
          ],
          suggestions: [
            {
              title: 'Suggestion Chips',
            },
            {
              title: 'Basic Card',
            },
            {
              title: 'Browse Carousel',
            },
            {
              title: 'Carousel',
            },
            {
              title: 'List',
            },
            {
              title: 'Media',
            },
            {
              title: 'Suggestions',
            },
          ],
          linkOutSuggestion: {
            url: 'https://assistant.google.com/',
            destinationName: 'Suggestion Link',
          },
        },
      },
      possibleIntents: [
        {
          intent: 'assistant.intent.action.TEXT',
        },
      ],
    },
  ],
  responseMetadata: {
    status: {
      message: 'Success (200)',
    },
    queryMatchInfo: {
      queryMatched: true,
      intent: 'f5ddc90b-d5da-4bec-9e5c-a19089308bad',
    },
  },
}

export const CONVERSATION_TABLE = {
  conversationToken: '[\"_actions_on_google\"]',
  expectUserResponse: true,
  expectedInputs: [
    {
      inputPrompt: {
        richInitialPrompt: {
          items: [
            {
              simpleResponse: {
                textToSpeech: 'You can include table data like this',
              },
            },
            {
              tableCard: {
                columnProperties: [
                  {
                    header: 'header 1',
                  },
                  {
                    header: 'header 2',
                  },
                  {
                    header: 'header 3',
                  },
                ],
                rows: [
                  {
                    cells: [
                      {
                        text: 'row 1 item 1',
                      },
                      {
                        text: 'row 1 item 2',
                      },
                      {
                        text: 'row 1 item 3',
                      },
                    ],
                    dividerAfter: true,
                  },
                  {
                    cells: [
                      {
                        text: 'row 2 item 1',
                      },
                      {
                        text: 'row 2 item 2',
                      },
                      {
                        text: 'row 2 item 3',
                      },
                    ],
                    dividerAfter: true,
                  },
                ],
              },
            },
          ],
        },
      },
      possibleIntents: [
        {
          intent: 'assistant.intent.action.TEXT',
        },
      ],
    },
  ],
  responseMetadata: {
    status: {
      message: 'Success (200)',
    },
    queryMatchInfo: {
      queryMatched: true,
      intent: '177900ff-d35b-4275-a69a-d01f21db92ac',
    },
  },
  userStorage: '{\"data\":{}}',
}

export const CONVERSATION_SIGN_IN = {
  conversationToken: '[\"_actions_on_google\"]',
  expectUserResponse: true,
  expectedInputs: [
    {
      inputPrompt: {
        richInitialPrompt: {
          items: [
            {
              simpleResponse: {
                textToSpeech: 'You\'ll need to sign in',
              },
            },
          ],
        },
      },
      possibleIntents: [
        {
          intent: 'actions.intent.SIGN_IN',
          inputValueData: {
            '@type': 'type.googleapis.com/google.actions.v2.SignInValueSpec',
          },
        },
      ],
    },
  ],
  responseMetadata: {
    status: {
      message: 'Success (200)',
    },
    queryMatchInfo: {
      queryMatched: true,
      intent: '4aca4776-5110-4f19-a76c-d96d7f4d5b18',
    },
  },
  userStorage: '{\data\:{}}',
}

export const CONVERSATION_NEW_SURFACE = {
  conversationToken: '[\"_actions_on_google\"]',
  expectUserResponse: true,
  expectedInputs: [
    {
      inputPrompt: {
        richInitialPrompt: {
          items: [
            {
              simpleResponse: {
                textToSpeech: 'I\u0027m sorry. I\u0027m having trouble connecting to your account. Please try again later.',
              },
            },
          ],
        },
      },
      possibleIntents: [
        {
          intent: 'actions.intent.NEW_SURFACE',
          inputValueData: {
            '@type': 'type.googleapis.com/google.actions.v2.NewSurfaceValueSpec',
            capabilities: ['actions.capability.SCREEN_OUTPUT'],
            context: 'There is more information available.',
            notificationTitle: 'Transferring to your phone',
          },
        },
      ],
    },
  ],
  responseMetadata: {
    status: {
      message: 'Success (200)',
    },
    queryMatchInfo: {
      queryMatched: true,
      intent: 'a457499e-b810-4aa7-b523-2ac5fa6b7e48',
    },
  },
}
