import { NextApiRequest, NextApiResponse } from "next";
import { v2 as cloudinary } from "cloudinary";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { params } = JSON.parse(req.body);
	const timestamp = Math.round(new Date().getTime() / 1000);
	const signature = cloudinary.utils.api_sign_request(
		{ ...params, timestamp },
		process.env.CLOUDINARY_API_SECRET as string
	);
	res.status(200).json({ signature, timestamp });
}
