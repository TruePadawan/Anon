import { v2 as cloudinary } from "cloudinary";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST" || !req.body) {
        res.status(400).json({
            message: "Should receive a POST request with upload data",
        });
    } else {
        // upload via cloudinary SDK
        const { file, options } = JSON.parse(req.body);
        const uploadResponse = await cloudinary.uploader.upload(file, options);
        res.status(200).json(uploadResponse);
    }
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: "2mb",
        },
    },
};
