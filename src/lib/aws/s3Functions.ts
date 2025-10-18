// src/lib/aws/s3Functions.ts
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "./s3Client";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface UploadFileParams {
  fileBuffer: Buffer;
  fileName: string;
  fileType: string;
}

/**
 * Uploads a file to S3
 * @param {UploadFileParams} params - File data
 * @returns {Promise<string>} - The S3 object key
 */
export const uploadFile = async ({
  fileBuffer,
  fileName,
  fileType,
}: UploadFileParams): Promise<string> => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileName,
    Body: fileBuffer,
    ContentType: fileType,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`; // Return object key
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw new Error("Failed to upload file");
  }
};

/**
 * Retrieves a signed URL for a file from S3
 * @param {string} fileName - The file name
 * @returns {Promise<string>} - The signed URL
 */
export const getFileUrl = async (fileName: string): Promise<string> => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileName,
  };

  try {
    return await getSignedUrl(s3Client, new GetObjectCommand(params), {
      expiresIn: 604800, // 7 days expiry (max for IAM)
    });
  } catch (error) {
    console.error("S3 Get File Error:", error);
    throw new Error("Failed to get file URL");
  }
};