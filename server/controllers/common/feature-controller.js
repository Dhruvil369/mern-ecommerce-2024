const cloudinary = require("cloudinary").v2; // Import Cloudinary
const Feature = require("../../models/Feature");

const addFeatureImage = async(req, res) => {
    try {
        const { image } = req.body;

        console.log(image, "image");

        const featureImages = new Feature({
            image,
        });

        await featureImages.save();

        res.status(201).json({
            success: true,
            data: featureImages,
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: "Some error occured!",
        });
    }
};

const getFeatureImages = async(req, res) => {
    try {
        const images = await Feature.find({});
        console.log(images)
        console.log("Image Lading Sucessfully")

        res.status(200).json({
            success: true,
            data: images,
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: "Some error occured!",
        });
    }
};


const deleteFeatureImage = async(req, res) => {
    try {
        const { id } = req.params;
        console.log(id);
        // Find the image in MongoDB
        const featureImage = await Feature.findById(id);
        if (!featureImage) {
            return res.status(404).json({
                success: false,
                message: "Image not found",
            });
        }

        // Delete from Cloudinary if image URL exists
        if (featureImage.image) {
            const imageUrl = featureImage.image;
            const publicId = imageUrl.split("/").pop().split(".")[0]; // Extract Cloudinary public_id

            await cloudinary.uploader.destroy(publicId); // Delete image from Cloudinary
        }

        // Delete from MongoDB
        await Feature.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Image deleted successfully",
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            success: false,
            message: "Some error occurred!",
        });
    }
};

module.exports = { addFeatureImage, getFeatureImages, deleteFeatureImage };