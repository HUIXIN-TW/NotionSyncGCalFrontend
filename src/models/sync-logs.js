import "server-only";
import { ddb } from "@/utils/server/db-client";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.DYNAMODB_SYNC_LOGS_TABLE;

export async function getSyncCountLast48h() {
  let total = 0;
  let ExclusiveStartKey;

  do {
    const res = await ddb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        Select: "COUNT",
        ExclusiveStartKey,
      }),
    );

    total += res.Count || 0;
    ExclusiveStartKey = res.LastEvaluatedKey;
  } while (ExclusiveStartKey);

  return { totalLast48h: total };
}