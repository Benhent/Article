export const uploadAvatarToCloudinary = async (file: File): Promise<string> => {
  try {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_AVATAR_PRESET;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    if (!data.secure_url) {
      throw new Error('Failed to get secure URL from Cloudinary');
    }
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

export const uploadArticleThumbnailToCloudinary = async (file: File): Promise<string> => {
  try {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_ARTICLE_THUMBNAIL_PRESET;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    if (!data.secure_url) {
      throw new Error('Failed to get secure URL from Cloudinary');
    }
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

export const uploadArticleFileToCloudinary = async (file: File): Promise<{ fileUrl: string; fileName: string }> => {
  try {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_ARTICLE_FILE_PRESET;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    // Determine if file is an image or document
    const isImage = file.type.startsWith('image/');
    const endpoint = isImage ? 'image/upload' : 'raw/upload';

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${endpoint}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    if (!data.secure_url) {
      throw new Error('Failed to get secure URL from Cloudinary');
    }

    return {
      fileUrl: data.secure_url,
      fileName: file.name
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}