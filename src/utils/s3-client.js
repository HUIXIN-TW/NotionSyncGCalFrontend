import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ 
    region: process.env.MYAPP_AWS_REGION || "us-east-1", // Default to us-east-1 if not specified
    credentials: {
        accessKeyId: process.env.MYAPP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.MYAPP_AWS_SECRET_ACCESS_KEY,
    },
});
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const S3_KEY = process.env.S3_KEY;

// Add Google OAuth configuration defaults
const GOOGLE_TOKEN_URL = process.env.GOOGLE_TOKEN_URL || 'https://oauth2.googleapis.com/token';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CALENDAR_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;

/**
 * Upload Google OAuth tokens JSON to S3 under the user's folder
 * @param {string} userId  - UUID of the user
 * @param {object} tokens  - Token object returned by googleapis
 */
export async function uploadGoogleTokens(userId, tokens) {
    console.log('Uploading Google tokens to S3:', userId, tokens);
    console.log('S3_BUCKET_NAME:', S3_BUCKET_NAME);
    console.log('S3_KEY:', S3_KEY);
    const payload = {
        "access_token": tokens.access_token,
        "refresh_token": tokens.refresh_token,
        "token_url": GOOGLE_TOKEN_URL,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "expiry": tokens.expiry_date,
        "scopes": [tokens.scope],
    }
    console.log('Payload:', payload);
    const user_key = `${userId}/${S3_KEY}`;
    const command = new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: user_key,
        Body: JSON.stringify(payload),
        ContentType: 'application/json',
    });
    await s3Client.send(command);
    console.log('Upload successful for user:', userId);
}