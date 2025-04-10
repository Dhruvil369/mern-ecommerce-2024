const cloudinary = require("cloudinary").v2;
const multer = require("multer");

cloudinary.config({
    cloud_name: "duwpnrt2k",
    api_key: "357591895116677",
    api_secret: "EglxL1FagB4nfBGYZrF4hMaJxNM",
});

const storage = new multer.memoryStorage();

async function imageUploadUtil(file) {
    const result = await cloudinary.uploader.upload(file, {
        resource_type: "auto",
    });

    return result;
}

const upload = multer({ storage });

module.exports = { upload, imageUploadUtil };