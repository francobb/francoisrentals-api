import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AWS_BUCKET } from '@config';

// Create an instance of the AWS service
// Configure the AWS SDK v3
const s3Client = new S3Client({
  region: 'us-east-2',
});

export const fetchPdfFromS3 = async (key: string) => {
  const params = {
    Bucket: AWS_BUCKET,
    Key: key,
    Expires: 60 * 60, // URL will be valid for 5 minutes
  };

  try {
    const command = new GetObjectCommand(params);
    return await getSignedUrl(s3Client, command, { expiresIn: params.Expires });
  } catch (error) {
    console.error(error);
  }
};

export default s3Client;
