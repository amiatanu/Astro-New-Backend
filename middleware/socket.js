const socketIO = require("socket.io");
let io; // Define io outside the function to make it accessible

function initSocket(server) {
	io = socketIO(server); // Assign io here

	io.on("connection", (socket) => {
		console.log("A user connected");

		socket.on("joinChatRoom", (chatRoomId) => {
			socket.join(chatRoomId);
			console.log(`User joined chat room: ${chatRoomId}`);
		});

		// Handle other chat-related events as needed

		socket.on("disconnect", () => {
			console.log("A user disconnected");
		});
	});
}

// Export io for use in other parts of the application
module.exports = {
	initSocket,
	io, // Export io
};
