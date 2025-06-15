/**
 * Interface representing the metadata of a file stored in cloud storage.
 */
export interface FileMetadata {
  /**
   * The name of the file.
   */
  name: string;
  /**
   * The size of the file in bytes.
   */
  size: number;
  /**
   * The last modified timestamp of the file.
   */
  lastModified: string;
}

/**
 * Asynchronously lists files in a specified Google Cloud Storage bucket.
 *
 * @param bucketName The name of the Google Cloud Storage bucket.
 * @param prefix Optional prefix to filter files within the bucket.
 * @returns A promise that resolves to an array of FileMetadata objects.
 */
export async function listFiles(bucketName: string, prefix?: string): Promise<FileMetadata[]> {
  // TODO: Implement this by calling the Google Cloud Storage API.

  return [
    {
      name: 'example.php',
      size: 1024,
      lastModified: '2024-01-01T00:00:00Z',
    },
    {
      name: 'another_example.php',
      size: 2048,
      lastModified: '2024-01-05T00:00:00Z',
    },
  ];
}

/**
 * Asynchronously uploads a file to a specified Google Cloud Storage bucket.
 *
 * @param bucketName The name of the Google Cloud Storage bucket.
 * @param filePath The path to the file to upload.
 * @param fileContent The content of the file to upload.
 * @returns A promise that resolves when the file is successfully uploaded.
 */
export async function uploadFile(bucketName: string, filePath: string, fileContent: string): Promise<void> {
  // TODO: Implement this by calling the Google Cloud Storage API.
  console.log(`Uploading ${filePath} to ${bucketName}`);
}
