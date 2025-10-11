import logger from "@utils/logger";
import "server-only";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqsQueueUrl = process.env.SQS_QUEUE_URL;
const sqsRegion = process.env.SQS_REGION;

const sqsClient = new SQSClient({ region: sqsRegion });

export async function sendSyncJobMessage(payload) {
  if (!sqsQueueUrl || !sqsRegion) {
    throw new Error("Missing SQS_QUEUE_URL or SQS_REGION in env");
  }

  const command = new SendMessageCommand({
    QueueUrl: sqsQueueUrl,
    MessageBody: JSON.stringify(payload),
  });

  const result = await sqsClient.send(command);
  logger.info("SQS message sent", { id: result.MessageId });
  return result;
}
