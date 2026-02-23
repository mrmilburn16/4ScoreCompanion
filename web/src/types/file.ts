export type SupportedExtension = "pdf" | "4sc" | "4ss";

export type StoredFileRecord = {
  id: string;
  originalName: string;
  storedName: string;
  extension: SupportedExtension;
  contentType: string;
  size: number;
  uploadedAt: string;
};

export type UploadRejection = {
  name: string;
  error: string;
};

export type UploadResponse = {
  uploaded: StoredFileRecord[];
  rejected: UploadRejection[];
};
