const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const path = require('path');

// Initialize Supabase Client using Service Role Key to bypass RLS for uploads
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);
const BUCKET_NAME = 'campaign-images';

/**
 * Handle single image upload to Supabase Storage
 * @route POST /upload
 */
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided',
            });
        }

        // Ensure bucket exists (creates public bucket if not found)
        const { data: buckets } = await supabase.storage.listBuckets();
        if (!buckets?.find(b => b.name === BUCKET_NAME)) {
            await supabase.storage.createBucket(BUCKET_NAME, { public: true });
        }

        // Generate a unique filename
        const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
        const ext = path.extname(req.file.originalname).toLowerCase();
        const filename = `image-${uniqueSuffix}${ext}`;

        // Upload buffer to Supabase Storage
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filename, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false // Don't overwrite existing
            });

        if (error) {
            console.error('Supabase upload error:', error);
            throw error;
        }

        // Get public URL for the uploaded file
        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filename);
            
        const imageUrl = urlData.publicUrl;

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully to Supabase',
            data: {
                filename: filename,
                originalName: req.file.originalname,
                size: req.file.size,
                url: imageUrl,
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image to cloud storage',
        });
    }
};

module.exports = {
    uploadImage,
};
