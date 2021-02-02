import { config, languageCodeMap, voiceMap } from './config';
import { PayloadRequest, PayloadResponse } from '../../../layers/common/nodejs/models/invoker/payload';
import AWS from 'aws-sdk';
import { PollyUploadRequest } from '../../../layers/common/nodejs/models/polly-upload-request';
import { HttpStatus } from '../../../layers/common/nodejs/utils/http-status';
import { EventResponse } from '../../../layers/common/nodejs/log/event';

const polly = new AWS.Polly();

const handlePollySynthesis = async (event: PayloadRequest<PollyUploadRequest[]>): Promise<EventResponse> => {
  const pollyUploadRequests: PollyUploadRequest[] = event.payload;
  pollyUploadRequests.forEach((req: PollyUploadRequest) => synthesizeSpeech(req));
  return { statusCode: HttpStatus.Success } as PayloadResponse<undefined>;
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
