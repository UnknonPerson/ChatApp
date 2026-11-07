import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = async (buffer) => {
    const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "chat-app/profiles",
                resource_type: "image"
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        Readable.from([buffer]).pipe(stream);
    });

    return uploadResult;
};