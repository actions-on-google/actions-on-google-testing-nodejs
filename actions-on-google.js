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

'use strict';

const grpc = require('grpc');
const path = require('path');
const protoFiles = require('google-proto-files');
const { UserRefreshClient } = require('google-auth-library');
const i18n = require('i18n');

const SUPPORTED_LOCALES = [
    'en-US', 'fr-FR', 'ja-JP', 'de-DE', 'ko-KR',
    'es-ES', 'pt-BR', 'it-IT', 'ru-RU', 'hi-IN',
    'th-TH', 'id-ID', 'da-DK', 'no-NO', 'nl-NL',
    'sv-SE'
];
const FALLBACK_LOCALES = {
    'en-GB': 'en-US',
    'en-AU': 'en-US',
    'en-SG': 'en-US',
    'en-CA': 'en-US',
    'fr-CA': 'fr-FR',
    'es-419': 'es-ES'
};
const DEFAULT_LOCALE = SUPPORTED_LOCALES[0];

i18n.configure({
    locales: SUPPORTED_LOCALES,
    fallbacks: FALLBACK_LOCALES,
    directory: __dirname + '/locales',
    defaultLocale: DEFAULT_LOCALE
});

const PROTO_ROOT_DIR = protoFiles('..');
const embedded_assistant_pb = grpc.load({
    root: PROTO_ROOT_DIR,
    file: path.relative(PROTO_ROOT_DIR, protoFiles.embeddedAssistant.v1alpha2)
}).google.assistant.embedded.v1alpha2;

const latlng_pb = grpc.load({
    root: PROTO_ROOT_DIR,
    file: path.relative(PROTO_ROOT_DIR, protoFiles.embeddedAssistant.v1alpha2)
}).google.type.LatLng;

class ActionsOnGoogle {
    constructor(credentials) {
        ActionsOnGoogle.prototype.endpoint_ = "embeddedassistant.googleapis.com";

        this.client = this.createClient_(credentials);
        this.setLocale(DEFAULT_LOCALE);
        this.location = undefined;
        this.deviceModelId = 'default';
        this.deviceInstanceId = 'default';
        this.conversationState = null;
        this.isNewConversation = false;
    }

    createClient_(credentials) {
        const sslCreds = grpc.credentials.createSsl();
        // https://github.com/google/google-auth-library-nodejs/blob/master/ts/lib/auth/refreshclient.ts
        const refresh = new UserRefreshClient();
        refresh.fromJSON(credentials);

        const callCreds = grpc.credentials.createFromGoogleCredential(refresh);
        const combinedCreds = grpc.credentials.combineChannelCredentials(sslCreds, callCreds);

        const client = new embedded_assistant_pb.EmbeddedAssistant(this.endpoint_, combinedCreds);
        return client;
    }

    setLocale(locale) {
        if (!SUPPORTED_LOCALES.concat(Object.keys(FALLBACK_LOCALES)).includes(locale)) {
            console.warn(`Warning: Unsupported locale '${locale}' in this tool. Ignore.`);
        }
        this.locale = locale;
        i18n.setLocale(locale);
    }

    i18n_(name, params) {
        if (params) {
            return i18n.__(name, params);
        } else {
            return i18n.__(name);
        }
    }

    setLocation(latLngArray) {
        this.location = latLngArray;
    }

    setDeviceConfig(modelId, instanceId) {
        this.deviceModelId = modelId;
        this.deviceInstanceId = instanceId;
    }

    startConversation(prompt) {
        return this.startConversationWith(this.i18n_('my_test_app'), prompt);
    }

    startConversationWith(appName, prompt) {
        const query = prompt
          ? this.i18n_('start_conversation_with_prompt', {app_name: appName, prompt: prompt})
          : this.i18n_('start_conversation', {app_name: appName});
        return this.send(query);
    }

    endConversation() {
        return this.send(this.i18n_('cancel'));
    }

    send(input) {
        const config = new embedded_assistant_pb.AssistConfig();
        config.setTextQuery(input);
        config.setAudioOutConfig(new embedded_assistant_pb.AudioOutConfig());
        config.getAudioOutConfig().setEncoding(1);
        config.getAudioOutConfig().setSampleRateHertz(16000);
        config.getAudioOutConfig().setVolumePercentage(100);
        config.setDialogStateIn(new embedded_assistant_pb.DialogStateIn());
        config.setDeviceConfig(new embedded_assistant_pb.DeviceConfig());
        config.getDialogStateIn().setLanguageCode(this.locale);
        config.getDialogStateIn().setIsNewConversation(this.isNewConversation);
        if (this.conversationState) {
            config.getDialogStateIn().setConversationState(this.conversationState);
        }
        if (this.location) {
            const location = new embedded_assistant_pb.DeviceLocation();
            const coordinates = new latlng_pb();
            coordinates.setLatitude(this.location[0]);
            coordinates.setLongitude(this.location[1]);
            location.setCoordinates(coordinates);
            config.getDialogStateIn().setDeviceLocation(location);
        }
        config.getDeviceConfig().setDeviceId(this.deviceInstanceId);
        config.getDeviceConfig().setDeviceModelId(this.deviceModelId);
        config.setDebugConfig(new embedded_assistant_pb.DebugConfig());
        config.getDebugConfig().setReturnDebugInfo(true); // Always debug

        const request = new embedded_assistant_pb.AssistRequest();
        request.setConfig(config);

        delete request.audio_in;

        const conversation = this.client.assist();
        return new Promise((resolve, reject) => {
            let assistResponse = {}

            conversation.on('data', (data) => {
                if (data.dialog_state_out) {
                    this.conversationState = data.dialog_state_out.conversation_state;
                    if (data.dialog_state_out.supplemental_display_text && !assistResponse.displayText) {
                        // Provide display text output it
                        assistResponse.textToSpeech = [data.dialog_state_out.supplemental_display_text];
                    }
                }
                if (data.device_action) {
                    assistResponse.deviceAction = data.device_action.device_request_json;
                }
                if (data.debug_info) {
                    const debugInfo = JSON.parse(data.debug_info.aog_agent_to_assistant_json);
                    const actionResponse = debugInfo.expectedInputs[0].inputPrompt.richInitialPrompt ||
                        debugInfo.finalResponse.richResponse;
                    assistResponse.micOpen = debugInfo.expectUserResponse;
                    assistResponse.textToSpeech = [];
                    assistResponse.displayText = [];
                    assistResponse.ssml = [];
                    assistResponse.cards = [];
                    assistResponse.suggestions = [];
                    assistResponse.carousel = [];
                    assistResponse.list = {};
                    assistResponse.mediaResponse = {};

                    actionResponse.items.forEach((i) => {
                        if (i.simpleResponse) {
                            assistResponse.textToSpeech.push(i.simpleResponse.textToSpeech);
                            assistResponse.displayText.push(i.simpleResponse.displayText);
                            assistResponse.ssml.push(i.simpleResponse.ssml);
                        } else if (i.basicCard) {
                            const card = {
                                title: i.basicCard.title,
                                subtitle: i.basicCard.subtitle,
                                text: i.basicCard.formattedText,
                                imageUrl: i.basicCard.image.url,
                                imageAltText: i.basicCard.image.accessibilityText,
                                buttons: []
                            };
                            if (i.basicCard.buttons) {
                                console.log(i.basicCard.buttons);
                                for (const button of i.basicCard.buttons) {
                                    card.buttons.push({
                                        title: button.title,
                                        url: button.openUrlAction.url
                                    });
                                }
                            }
                            assistResponse.cards.push(card);
                        }
                        else if (i.carouselBrowse) {
                            for (const item of i.carouselBrowse) {
                                assistResponse.carousel.push({
                                    title: item.title,
                                    description: item.description,
                                    footer: item.footer,
                                    imageUrl: item.image.url,
                                    imageAltText: item.image.accessibilityText,
                                    url: item.openUrlAction.url
                                });
                            }
                        }
                        else if (i.carouselSelect) {
                            for (const item of i.carouselSelect) {
                                assistResponse.carousel.push({
                                    optionInfo: item.optionInfo,
                                    title: item.title,
                                    description: item.description,
                                    imageUrl: item.image.url,
                                    imageAltText: item.image.accessibilityText
                                });
                            }
                        }
                        else if (i.listSelect) {
                            assistResponse.list.title = i.listSelect.title;
                            assistResponse.list.items = [];
                            for (const item of i.listSelect.items) {
                                assistResponse.list.push({
                                    optionInfo: item.optionInfo,
                                    title: item.title,
                                    description: item.description,
                                    imageUrl: item.image.url,
                                    imageAltText: item.image.accessibilityText
                                })
                            }
                        }
                        else if (i.mediaResponse) {
                            assistResponse.mediaResponse = {
                                type: i.mediaResponse.mediaType,
                                name: i.mediaResponse.mediaObjects[0].name,
                                description: i.mediaResponse.mediaObjects[0].description,
                                sourceUrl: i.mediaResponse.mediaObjects[0].contentUrl,
                                icon: i.mediaResponse.mediaObjects[0].icon.url,
                            }
                        }
                    });
                    if (actionResponse.suggestions) {
                        actionResponse.suggestions.forEach((i) => {
                            if (i.title) {
                                assistResponse.suggestions.push(i.title);
                            }
                        });
                    }
                    if (actionResponse.linkOutSuggestion) {
                        assistResponse.linkOutSuggestion = {
                            url: actionResponse.linkOutSuggestion.url,
                            name: actionResponse.linkOutSuggestion.destinationName,
                        }
                    }
                }
            });
            conversation.on('end', (error) => {
                // Conversation ended -- return response
                resolve(assistResponse);
            });
            conversation.on('error', (error) => {
                console.error(error);
                reject(error);
            });
            conversation.write(request);
            conversation.end();
        });
    }
}

module.exports = ActionsOnGoogle;
