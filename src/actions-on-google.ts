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

// Implementation of API calls to the Google Assistant

const grpc = require('grpc')
const protoFiles = require('google-proto-files')
import * as path from 'path'
import { UserRefreshClient } from 'google-auth-library'
const i18n = require('i18n')

const SUPPORTED_LOCALES = [
    'en-US', 'fr-FR', 'ja-JP', 'de-DE', 'ko-KR',
    'es-ES', 'pt-BR', 'it-IT', 'ru-RU', 'hi-IN',
    'th-TH', 'id-ID', 'da-DK', 'no-NO', 'nl-NL',
    'sv-SE',
]

const FALLBACK_LOCALES = {
    'en-GB': 'en-US',
    'en-AU': 'en-US',
    'en-SG': 'en-US',
    'en-CA': 'en-US',
    'fr-CA': 'fr-FR',
    'es-419': 'es-ES',
}

const DEFAULT_LOCALE = SUPPORTED_LOCALES[0]

i18n.configure({
    locales: SUPPORTED_LOCALES,
    fallbacks: FALLBACK_LOCALES,
    directory: __dirname + '/locales',
    defaultLocale: DEFAULT_LOCALE,
})

const PROTO_ROOT_DIR = protoFiles('..')
const embeddedAssistantPb = grpc.load({
    root: PROTO_ROOT_DIR,
    file: path.relative(PROTO_ROOT_DIR, protoFiles['embeddedAssistant'].v1alpha2),
}).google.assistant.embedded.v1alpha2

const latlngPb = grpc.load({
    root: PROTO_ROOT_DIR,
    file: path.relative(PROTO_ROOT_DIR, protoFiles['embeddedAssistant'].v1alpha2),
}).google.type.LatLng

/* Unexported AoG types */
interface AogSuggestion {
    title: string
}

export interface UserCredentials {
    client_id: string,
    client_secret: string,
    refresh_token: string,
    type: 'authorized_user'
}

export interface AssistResponseButton {
    title: string,
    url: string,
}

export interface AssistResponseCard {
    title?: string,
    subtitle?: string,
    text?: string,
    imageUrl?: string,
    imageAltText?: string,
    buttons: AssistResponseButton[],
}

export interface AssistResponseList {
    title: string,
    items: {
        title: string,
        description: string,
        imageUrl: string,
        imageAltText: string,
    }[],
}

export interface AssistResponse {
    micOpen: boolean,
    textToSpeech: string[],
    displayText: string[],
    ssml: string[],
    cards?: AssistResponseCard[]
    carousel?: {
        title: string,
        description?: string,
        imageUrl: string,
        imageAltText: string,
        footer?: string
        url?: string,
    }[],
    list?: AssistResponseList,
    mediaResponse?: {
        type: string,
        name: string,
        description: string,
        sourceUrl: string,
        icon: string,
    },
    suggestions: string[],
    linkOutSuggestion?: {
        url: string,
        name: string,
    }
    deviceAction?: string
}

export class ActionsOnGoogle {
    // tslint:disable-next-line
    _client: any
    _conversationState: Uint8Array
    _endpoint = 'embeddedassistant.googleapis.com'
    _isNewConversation = false
    _locale: string

    location: number[]
    deviceModelId = 'default'
    deviceInstanceId = 'default'

    constructor(credentials: UserCredentials) {
        this._client = this._createClient(credentials)
        this._locale = DEFAULT_LOCALE
    }

    _createClient(credentials: UserCredentials) {
        const sslCreds = grpc.credentials.createSsl()
        const refresh = new UserRefreshClient()
        refresh.fromJSON(credentials)

        const callCreds = grpc.credentials.createFromGoogleCredential(refresh)
        const combinedCreds = grpc.credentials.combineChannelCredentials(sslCreds, callCreds)

        const client = new embeddedAssistantPb.EmbeddedAssistant(this._endpoint, combinedCreds)
        return client
    }

    setLocale(l: string) {
        if (SUPPORTED_LOCALES.concat(Object.keys(FALLBACK_LOCALES)).indexOf(l) === -1) {
            console.warn(`Warning: Unsupported locale '${l}' in this tool. Ignore.`)
        }
        this._locale = l
        i18n.setLocale(l)
    }

    i18n_(name: string, params?: {[key: string]: string;}) {
        if (params) {
            return i18n.__(name, params)
        } else {
            return i18n.__(name)
        }
    }

    startConversation(prompt: string) {
        return this.startConversationWith(this.i18n_('my_test_app'), prompt)
    }

    startConversationWith(action: string, prompt: string) {
        const query = prompt
            ? this.i18n_('start_conversation_with_prompt', { app_name: action, prompt })
            : this.i18n_('start_conversation', { app_name: action })
        return this.send(query)
    }

    endConversation() {
        return this.send(this.i18n_('cancel'))
    }

    send(input: string) {
        const config = new embeddedAssistantPb.AssistConfig()
        config.setTextQuery(input)
        config.setAudioOutConfig(new embeddedAssistantPb.AudioOutConfig())
        config.getAudioOutConfig().setEncoding(1)
        config.getAudioOutConfig().setSampleRateHertz(16000)
        config.getAudioOutConfig().setVolumePercentage(100)
        config.setDialogStateIn(new embeddedAssistantPb.DialogStateIn())
        config.setDeviceConfig(new embeddedAssistantPb.DeviceConfig())
        config.getDialogStateIn().setLanguageCode(this._locale)
        config.getDialogStateIn().setIsNewConversation(this._isNewConversation)
        if (this._conversationState) {
            config.getDialogStateIn().setConversationState(this._conversationState)
        }
        if (this.location) {
            const location = new embeddedAssistantPb.DeviceLocation()
            const coordinates = new latlngPb()
            coordinates.setLatitude(this.location[0])
            coordinates.setLongitude(this.location[1])
            location.setCoordinates(coordinates)
            config.getDialogStateIn().setDeviceLocation(location)
        }
        config.getDeviceConfig().setDeviceId(this.deviceInstanceId)
        config.getDeviceConfig().setDeviceModelId(this.deviceModelId)
        config.setDebugConfig(new embeddedAssistantPb.DebugConfig())
        config.getDebugConfig().setReturnDebugInfo(true) // Always debug

        const request = new embeddedAssistantPb.AssistRequest()
        request.setConfig(config)

        delete request.audio_in

        const conversation = this._client.assist()
        return new Promise((resolve, reject) => {
            const assistResponse: AssistResponse = {
                micOpen: false,
                textToSpeech: [],
                displayText: [],
                ssml: [],
                suggestions: [],
            }

            // tslint:disable-next-line
            conversation.on('data', (data: any) => {
                if (data.dialog_state_out) {
                    this._conversationState = data.dialog_state_out.conversation_state
                    if (data.dialog_state_out.supplemental_display_text &&
                        !assistResponse.displayText) {
                        assistResponse.textToSpeech =
                            [data.dialog_state_out.supplemental_display_text]
                    }
                }
                if (data.device_action) {
                    assistResponse.deviceAction = data.device_action.device_request_json
                }
                if (data.debug_info) {
                    const debugInfo = JSON.parse(data.debug_info.aog_agent_to_assistant_json)
                    const actionResponse =
                        debugInfo.expectedInputs[0].inputPrompt.richInitialPrompt ||
                        debugInfo.finalResponse.richResponse
                    assistResponse.micOpen = debugInfo.expectUserResponse

                    // tslint:disable-next-line
                    actionResponse.items.forEach((i: any) => {
                        if (i.simpleResponse) {
                            if (i.simpleResponse.textToSpeech) {
                                assistResponse.textToSpeech.push(i.simpleResponse.textToSpeech)
                            }
                            if (i.simpleResponse.displayText) {
                                assistResponse.displayText.push(i.simpleResponse.displayText)
                            }
                            if (i.simpleResponse.ssml) {
                                assistResponse.ssml.push(i.simpleResponse.ssml)
                            }
                        } else if (i.basicCard) {
                            assistResponse.cards = []
                            const card: AssistResponseCard = {
                                title: i.basicCard.title,
                                subtitle: i.basicCard.subtitle,
                                text: i.basicCard.formattedText,
                                imageUrl: i.basicCard.image.url,
                                imageAltText: i.basicCard.image.accessibilityText,
                                buttons: [],
                            }
                            if (i.basicCard.buttons) {
                                for (const button of i.basicCard.buttons) {
                                    card.buttons.push({
                                        title: button.title,
                                        url: button.openUrlAction.url,
                                    } as AssistResponseButton)
                                }
                            }
                            assistResponse.cards.push(card)
                        } else if (i.carouselBrowse) {
                            assistResponse.carousel = []
                            for (const item of i.carouselBrowse) {
                                assistResponse.carousel.push({
                                    title: item.title,
                                    description: item.description,
                                    footer: item.footer,
                                    imageUrl: item.image.url,
                                    imageAltText: item.image.accessibilityText,
                                    url: item.openUrlAction.url,
                                })
                            }
                        } else if (i.carouselSelect) {
                            assistResponse.carousel = []
                            for (const item of i.carouselSelect) {
                                assistResponse.carousel.push({
                                    title: item.title,
                                    description: item.description,
                                    imageUrl: item.image.url,
                                    imageAltText: item.image.accessibilityText,
                                })
                            }
                        } else if (i.listSelect) {
                            assistResponse.list = {
                                title: '',
                                items: [],
                            }
                            assistResponse.list.title = i.listSelect.title
                            for (const item of i.listSelect.items) {
                                assistResponse.list.items.push({
                                    title: item.title,
                                    description: item.description,
                                    imageUrl: item.image.url,
                                    imageAltText: item.image.accessibilityText,
                                })
                            }
                        } else if (i.mediaResponse) {
                            assistResponse.mediaResponse = {
                                type: i.mediaResponse.mediaType,
                                name: i.mediaResponse.mediaObjects[0].name,
                                description: i.mediaResponse.mediaObjects[0].description,
                                sourceUrl: i.mediaResponse.mediaObjects[0].contentUrl,
                                icon: i.mediaResponse.mediaObjects[0].icon.url,
                            }
                        }
                    })
                    if (actionResponse.suggestions) {
                        assistResponse.suggestions = []
                        actionResponse.suggestions.forEach((i: AogSuggestion) => {
                            if (i.title) {
                                assistResponse.suggestions.push(i.title)
                            }
                        })
                    }
                    if (actionResponse.linkOutSuggestion) {
                        assistResponse.linkOutSuggestion = {
                            url: actionResponse.linkOutSuggestion.url,
                            name: actionResponse.linkOutSuggestion.destinationName,
                        }
                    }
                }
            })
            conversation.on('end', () => {
                // Conversation ended -- return response
                resolve(assistResponse)
            })
            conversation.on('error', (error: Error) => {
                console.error(error)
                reject(error)
            })
            conversation.write(request)
            conversation.end()
        })
    }
}