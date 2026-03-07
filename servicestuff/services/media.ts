import { supabase } from '../lib/supabase';

export class MediaService {
    /**
     * Compresses and uploads an image to Supabase Storage
     * @param file The file to upload
     * @param bucket Bucket name (default: 'service-docs')
     * @param path Custom path within the bucket
     * @returns The public URL of the uploaded image
     */
    static async uploadImage(file: File, bucket: string = 'service-docs', path: string = 'general'): Promise<string> {
        try {
            // 1. Compress
            const compressedBlob = await this.compressImage(file);

            // 2. Generate unique filename
            const fileExt = 'jpg'; // We compress to jpeg
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
            const filePath = `${path}/${fileName}`;

            // 3. Upload to Supabase
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(filePath, compressedBlob, {
                    contentType: 'image/jpeg',
                    upsert: true
                });

            if (error) throw error;

            // 4. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error('[MEDIA_SERVICE] Upload failed:', error);
            throw error;
        }
    }

    /**
     * Compresses an image file using Canvas
     * @param file The original image file
     * @param maxWidth Maximum width of the compressed image
     * @param quality Quality (0 to 1)
     */
    static async compressImage(file: File, maxWidth: number = 1024, quality: number = 0.7): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = (maxWidth / width) * height;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            if (blob) resolve(blob);
                            else reject(new Error('Canvas to Blob failed'));
                        },
                        'image/jpeg',
                        quality
                    );
                };
            };
            reader.onerror = (error) => reject(error);
        });
    }

    /**
     * Formats file size to human readable string
     */
    static formatBytes(bytes: number, decimals: number = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
}
