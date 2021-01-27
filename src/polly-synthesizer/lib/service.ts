import { config, languageCodeMap, voiceMap } from './config';
import { Invoker } from '../../../layers/common/nodejs/models/invoker/invoker';
import { GetTranslationRequest } from '../../../layers/common/nodejs/models/get-translation-request';
import { PayloadRequest, PayloadResponse } from '../../../layers/common/nodejs/models/invoker/payload';
import { Query } from '../../../layers/common/nodejs/models/database-request';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Handler } from 'aws-lambda';
import AWS from 'aws-sdk';
import { PollyUploadRequest } from '../../../layers/common/nodejs/models/polly-upload-request';
import { BulkUploadTranslationRequest } from '../../../layers/common/nodejs/models/bulk-upload-translation-request';

const polly = new AWS.Polly();

const handlePollySynthesis = async (event: PayloadRequest[]) => {
  const pollyUploadRequests: PollyUploadRequest[] = <PollyUploadRequest[]>(<unknown>event);
  pollyUploadRequests.forEach((req: PollyUploadRequest) => synthesizeSpeech(req));
};

const buildSpeakText = (speed: string, text: string): string =>
  '<speak><prosody rate="' + speed + '">' + text + '</prosody></speak>';

const synthesizeSpeech = async (pollyUploadRequest: PollyUploadRequest) => {
  const input: AWS.Polly.StartSpeechSynthesisTaskInput = buildSynthesizeSpeechParams(pollyUploadRequest);
  const pollyOutput: AWS.Polly.StartSpeechSynthesisTaskOutput = await polly.startSpeechSynthesisTask(input).promise();
  // pollyOutput.SynthesisTask.
};

const buildSynthesizeSpeechParams = (
  pollyUploadRequest: PollyUploadRequest
): AWS.Polly.StartSpeechSynthesisTaskInput => ({
  OutputFormat: 'mp3',
  OutputS3BucketName: config.s3bucketName,
  OutputS3KeyPrefix: pollyUploadRequest.language + '.mp3',
  LanguageCode: languageCodeMap.get(pollyUploadRequest.language),
  VoiceId: voiceMap.get(pollyUploadRequest.language)!,
  TextType: 'ssml',
  Text: buildSpeakText(pollyUploadRequest.speed, pollyUploadRequest.word)
});

export const service = {
  handle: handlePollySynthesis
};
