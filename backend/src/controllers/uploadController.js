/**
 * Handle single image upload
 * @route POST /upload
 */
const uploadImage = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided',
            });
        }

        // Construct public URL
        const imageUrl = `/uploads/${req.file.filename}`;

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                url: imageUrl,
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image',
        });
    }
};

module.exports = {
    uploadImage,
};
