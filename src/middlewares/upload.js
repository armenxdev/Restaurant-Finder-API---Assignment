import multer from "multer";
import path from "path";
import fs from "fs/promises";

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/png",
        "image/jpg",
        "image/jpeg",
        "image/gif",
        "image/webp",
    ];

    if(allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }else {
        cb(
            new Error(
                "Only image file are allowed (jpeg, jpg, png, gif, webp, webp)"
            ),
            false
        );
    }
};


const createStorage = (folder) =>
    multer.diskStorage({
        destination: (req, file, cb) => {
            const dest = path.join("uploads", folder);
            fs.mkdirSync(dest, { recursive: true });
            cb(null, dest);
        },

        filename: (req, file, cb) => {
            const uniqueSuffix =
                Date.now() + "-" + Math.round(Math.random() * 1e9);
            const ext = path.extname(file.originalname).toLowerCase();

            cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        }
    });

const userStorage = createStorage("users");
const restaurantStorage = createStorage("restaurants");
const productStorage = createStorage("uploads");

const uploadUserPicture = multer({
    storage: userStorage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
}).single("profilePicture");

const uploadRestaurantImage = multer({
    storage: restaurantStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
}).single("coverImage");

const uploadProductImages = multer({
    storage: productStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
}).array("images", 5);

export  {
    uploadUserPicture,
    uploadRestaurantImage,
    uploadProductImages
}