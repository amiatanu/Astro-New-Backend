const Chat = require("../models/ChatModel");
const io = require("socket.io");

// Create a new chat room session and add the first message
async function initiateChat(astrologerId, userId, consultationId, message) {
	try {
		const chat = new Chat({
			astrologerId,
			userId,
			consultationId,
			messages: [{ senderId: astrologerId, message }],
		});
		await chat.save();
		return chat;
	} catch (error) {
		throw error;
	}
}

// Send a message within an existing chat room (both user and astrologer can send)
async function sendMessage(chatId, senderId, message) {
	try {
		const chat = await Chat.findById(chatId);
		if (!chat) {
			throw new Error("Chat room not found");
		}

		// Check if the sender is authorized to send messages in this chat
		if (
			senderId.toString() !== chat.astrologerId.toString() &&
			senderId.toString() !== chat.userId.toString()
		) {
			throw new Error("Sender is not authorized to send messages in this chat");
		}

		chat.messages.push({ senderId, message });
		await chat.save();

		// Emit a Socket.io event to notify clients about the new message
		io().to(chatId).emit("newMessage", { senderId, message });

		return chat;
	} catch (error) {
		throw error;
	}
}

// Close a chat room
async function closeChat(chatId) {
	try {
		const chat = await Chat.findById(chatId);
		if (!chat) {
			throw new Error("Chat room not found");
		}

		chat.isClosed = true;
		await chat.save();
		return chat;
	} catch (error) {
		throw error;
	}
}

// Retrieve chat messages for a specific chat room
async function getChatMessages(chatId) {
	try {
		const chat = await Chat.findById(chatId);
		if (!chat) {
			throw new Error("Chat room not found");
		}

		return chat.messages;
	} catch (error) {
		throw error;
	}
}

module.exports = { initiateChat, sendMessage, closeChat, getChatMessages };
