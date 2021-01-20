import { config, voiceMap } from './config';
import { Invoker } from '../../../layers/common/nodejs/models/invoker/invoker';
import { GetTranslationRequest } from '../../../layers/common/nodejs/models/get-translation-request';
import { PayloadResponse } from '../../../layers/common/nodejs/models/invoker/payload';
import { Query } from '../../../layers/common/nodejs/models/database-request';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Handler } from 'aws-lambda';

const polly = new AWS.Polly();
const s3 = new AWS.S3();
const sqs = new AWS.SQS();

const SEP = '-';

const synthesizeSpeechAndWrite = async (request) => {
  const lang = request.lang,
    text = request.text,
    rate = request.rate,
    bucketName = request.bucketName,
    path = request.path,
    outputFormat = request.outputFormat;
  const bucketPath = bucketName + path + lang;
  const bucketKey = lang + SEP + text + SEP + rate + '.' + outputFormat;

  const audioStream = await pollySynthesize(lang, text, rate, outputFormat);
  return s3putObject(bucketPath, bucketKey, audioStream);
};

const pollySynthesize = async (lang, text, rate, outputFormat) => {
  const params = {
    OutputFormat: outputFormat,
    LanguageCode: voiceMap.get(lang)[0],
    VoiceId: voiceMap.get(lang)[1],
    TextType: 'ssml',
    Text: '<speak><prosody rate="' + rate + '">' + text + '</prosody></speak>'
  };
  console.log(`Commence Polly synthesis of ${text} of ${lang}.`);
  const pollyPromise = await polly.synthesizeSpeech(params).promise();
  console.log(`Polly synthesis success of ${text} of ${lang}.`);
  return pollyPromise.AudioStream;
};

const s3putObject = (bucketPath, bucketKey, audioStream) => {
  const params2 = {
    Bucket: bucketPath,
    Key: bucketKey,
    Body: Buffer.from(audioStream),
    ContentType: 'audio/mpeg'
  };
  console.log(`Commence S3 put of ${bucketKey}.`);
  const s3Promise = s3.putObject(params2).promise();
  console.log(`S3 put success of ${bucketKey}`);
};

exports.handler = (event) => {
  console.log('Received Message from Queue: ' + JSON.stringify(event) + '. Commence Polly synthesis and S3 put.');

  Promise.resolve(event.requests.forEach((r) => synthesizeSpeechAndWrite(r)));
};

export const service = {
  handle: handleGetRequest
};
