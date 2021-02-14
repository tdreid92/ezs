import { config, languageCodeMap, voiceMap } from './config';
import { PayloadRequest, PayloadResponse } from '../../../layers/common/nodejs/models/invoker/payload';
import AWS from 'aws-sdk';
import { HttpStatus } from '../../../layers/common/nodejs/utils/http-status';
import { log } from '../../../layers/common/nodejs/log/sam-logger';
import { EventResponse } from '../../../layers/common/nodejs/log/event-logger';
import { PollyRequest } from '../../../layers/common/nodejs/models/translation';
import { HttpError } from 'http-errors';

const polly = new AWS.Polly();
const s3 = new AWS.S3();

const handlePollySynthesis = async (event: PayloadRequest<PollyRequest[]>): Promise<EventResponse> => {
  const pollyUploadRequests: PollyRequest[] = event.payload;

  pollyUploadRequests.forEach((req: PollyRequest) => synthesizeSpeech(req));
  return { statusCode: HttpStatus.Success } as PayloadResponse<undefined>;
};

const synthesizeSpeech = async (pollyUploadRequest: PollyRequest): Promise<void> => {
  const input: AWS.Polly.SynthesizeSpeechInput = buildSynthesizeSpeechParams(pollyUploadRequest);

  let pollyOutput: AWS.Polly.SynthesizeSpeechOutput;
  try {
    log.info(input);
    pollyOutput = await polly.synthesizeSpeech(input).promise();
    await s3write(config.s3bucketName, pollyOutput.AudioStream);
  } catch (AWSError) {
    log.error('Error synthesizing request:' + JSON.stringify(AWSError));
    throw ({
      statusCode: AWSError.statusCode || HttpStatus.NotImplemented,
      body: AWSError.message
    } as unknown) as HttpError;
  }
};

const s3write = async (key: string, audioStream): Promise<void> => {
  try {
    await s3
      .putObject({
        Bucket: config.s3bucketName + '/audio/',
        Key: key + '.mp3',
        Body: Buffer.from(audioStream),
        ContentType: 'audio/mpeg'
      })
      .promise();
  } catch (AWSError) {
    log.error('Error synthesizing request:' + JSON.stringify(AWSError));
    throw ({
      statusCode: AWSError.statusCode || HttpStatus.NotImplemented,
      body: AWSError.message
    } as unknown) as HttpError;
  }
  log.info('S3 write successful: ' + key);
};

const buildSsml = (speed: string, text: string): string =>
  '<speak><prosody rate=' + speed + '>' + text + '</prosody></speak>';

const buildSynthesizeSpeechParams = (pollyUploadRequest: PollyRequest): AWS.Polly.SynthesizeSpeechInput => ({
  OutputFormat: 'mp3',
  LanguageCode: languageCodeMap.get(pollyUploadRequest.language),
  VoiceId: voiceMap.get(pollyUploadRequest.language)!,
  TextType: 'ssml',
  Text: buildSsml(pollyUploadRequest.speed, pollyUploadRequest.word)
});

export const service = {
  handle: handlePollySynthesis
};
