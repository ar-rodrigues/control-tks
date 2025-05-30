import { useState } from "react";
import { createClient } from "../../utils/supabase/client";

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const useFileImport = () => {
  const supabase = createClient();
  const [progress, setProgress] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file, options) => {
    // Check file type
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not allowed`;
    }

    // Check file size against MAX_FILE_SIZE constant
    if (options.maxSize && file.size > (options.maxSize || MAX_FILE_SIZE)) {
      return `File size ${(file.size / 1024 / 1024).toFixed(
        2
      )}MB exceeds maximum allowed size of ${(
        (options.maxSize || MAX_FILE_SIZE) /
        1024 /
        1024
      ).toFixed(2)}MB`;
    }

    return null;
  };

  const generateFileName = (file, folder) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split(".").pop();
    const baseName = file.name.split(".").slice(0, -1).join(".");
    const fileName = `${baseName}_${timestamp}_${randomString}.${extension}`;

    return folder ? `${folder}/${fileName}` : fileName;
  };

  const uploadSingleFile = async (file, options, index) => {
    const fileName = file.name;

    // Initialize progress
    setProgress((prev) =>
      prev.map((p, i) => (i === index ? { ...p, status: "uploading" } : p))
    );

    try {
      // Validate file
      const validationError = validateFile(file, options);
      if (validationError) {
        throw new Error(validationError);
      }

      // Generate unique file name
      const storagePath = generateFileName(file, options.folder);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(options.bucket)
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(options.bucket).getPublicUrl(storagePath);

      // Optionally save to database
      if (options.saveToDatabase && options.tableName) {
        const { error: dbError } = await supabase
          .from(options.tableName)
          .insert({
            file_name: fileName,
            file_size: file.size,
            file_type: file.type,
            storage_path: storagePath,
            public_url: publicUrl,
            uploaded_at: new Date().toISOString(),
          });

        if (dbError) {
          console.warn("Failed to save file metadata to database:", dbError);
        }
      }

      // Update progress
      setProgress((prev) =>
        prev.map((p, i) =>
          i === index
            ? {
                ...p,
                status: "completed",
                progress: 100,
                url: publicUrl,
              }
            : p
        )
      );
    } catch (error) {
      console.error(`Failed to upload ${fileName}:`, error);
      setProgress((prev) =>
        prev.map((p, i) =>
          i === index
            ? {
                ...p,
                status: "error",
                error: error instanceof Error ? error.message : "Unknown error",
              }
            : p
        )
      );
    }
  };

  const uploadFiles = async (files, options) => {
    if (files.length === 0) return;

    setIsUploading(true);

    // Initialize progress for all files
    const initialProgress = files.map((file) => ({
      fileName: file.name,
      progress: 0,
      status: "pending",
    }));

    setProgress(initialProgress);

    try {
      // Upload files in parallel (you can modify this to upload sequentially if needed)
      await Promise.all(
        files.map((file, index) => uploadSingleFile(file, options, index))
      );
    } catch (error) {
      console.error("Error during file upload:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const clearProgress = () => {
    setProgress([]);
  };

  return {
    uploadFiles,
    progress,
    isUploading,
    clearProgress,
  };
};
