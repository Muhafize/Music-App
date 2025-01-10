import { clerkClient } from "@clerk/express";
import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";

export const getAllUsers = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const users = await User.find({ clerkId: { $ne: currentUserId } });
		res.status(200).json(users);
	} catch (error) {
		next(error);
	}
};

export const getMessages = async (req, res, next) => {
	try {
		const myId = req.auth.userId;
		const { userId } = req.params;

		const messages = await Message.find({
			$or: [
				{ senderId: userId, receiverId: myId },
				{ senderId: myId, receiverId: userId },
			],
		}).sort({ createdAt: 1 });

		res.status(200).json(messages);
	} catch (error) {
		next(error);
	}
};

export const syncUsers = async (req, res, next) => {
	try {
		const clerkUsers = await clerkClient.users.getUserList();
		const mongoUsers = await User.find();

		console.log("Clerk Users:", clerkUsers);
		console.log("MongoDB Users:", mongoUsers);

		const mongoUserIds = mongoUsers.map(user => user.clerkId);

		for (const clerkUser of clerkUsers) {
			if (!mongoUserIds.includes(clerkUser.id)) {
				console.log("Adding user:", clerkUser.id);
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