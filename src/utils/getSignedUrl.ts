import aws from "aws-sdk";

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export default async function getSignedUrl(filename: string): Promise<string> {
  const S3 = new aws.S3();
  try {
    return S3.getSignedUrl("getObject", {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: filename,
      Expires: 7 * 24 * 60 * 60, // Expiry time in seconds (7 days * 24 hours * 60 minutes * 60 seconds)
    });
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    return "";
  }
}
