import { S3Client } from '@aws-sdk/client-s3';
// Create an instance of the AWS service
// Configure the AWS SDK v3
const s3Client = new S3Client({
  region: 'us-east-2',
});

export default s3Client;
