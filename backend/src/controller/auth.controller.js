import { clerkClient } from "@clerk/express";
import { User } from "../models/user.model.js";

export const authCallback = async (req, res, next) => {
	try {
		const { id, firstName, lastName, imageUrl } = req.body;

		// check if user already exists
		const user = await User.findOne({ clerkId: id });

		if (!user) {
			// signup
			await User.create({
				clerkId: id,
				fullName: `${firstName || ""} ${lastName || ""}`.trim(),
				imageUrl,
			});
		}

		res.status(200).json({ success: true });
	} catch (error) {
		console.log("Error in auth callback", error);
		next(error);
	}
};

export const syncUsers = async (req, res, next) => {
	try {
		const clerkUsers = await clerkClient.users.getUserList();
		const mongoUsers = await User.find();

		const mongoUserIds = mongoUsers.map(user => user.clerkId);

		for (const clerkUser of clerkUsers) {
			if (!mongoUserIds.includes(clerkUser.id)) {
				await User.create({
					clerkId: clerkUser.id,
					fullName: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
					imageUrl: clerkUser.profileImageUrl,
					email: clerkUser.primaryEmailAddress.emailAddress,
				});
			}
		}

		res.status(200).json({ success: true, message: "Users synchronized successfully" });
	} catch (error) {
		console.log("Error in syncUsers", error);
		next(error);
	}
};