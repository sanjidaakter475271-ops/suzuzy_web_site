import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';

export class MediaService {
    /**
     * Compresses and uploads an image to Supabase Storage
     * @param uri Local URI of the image (from picker or camera)
     * @param bucket Bucket name (default: 'service-docs')
     * @param path Custom path within the bucket
     * @returns The public URL of the uploaded image
     */
    static async uploadImage(uri: string, bucket: string = 'service-docs', path: string = 'general'): Promise<string> {
        try {
            // 1. Compress to WebP (60-80% smaller than JPEG)
            const manipulatedImage = await ImageManipulator.manipulateAsync(
                uri,
                [{ resize: { width: 1024 } }],
                { compress: 0.7, format: ImageManipulator.SaveFormat.WEBP, base64: true }
            );

            if (!manipulatedImage.base64) {
                throw new Error('Image manipulation failed: No base64 data');
            }

            // 2. Generate unique filename
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.webp`;
            const filePath = `${path}/${fileName}`;

            // 3. Upload to Supabase
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(filePath, decode(manipulatedImage.base64), {
                    contentType: 'image/webp',
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
