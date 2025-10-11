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
  console.log("SQS message sent, ID:", result.MessageId);
  return result;
}
