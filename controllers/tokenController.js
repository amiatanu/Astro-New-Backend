const dotenv = require("dotenv");
const Token = require("../models/Token");
const io = require("socket.io");
const {
  RtcTokenBuilder,
  RtcRole,
  RtmTokenBuilder,
} = require("agora-access-token");

dotenv.config();

const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

//function for saving token
const saveToken = (
  rtcToken,
  rtmToken,
  userId,
  astrologerId,
  consultation_type,
  channelName
) => {
  // Create a new instance of the Token model
  const tokenData = new Token({
    userId: userId,
    astrologerId: astrologerId,
    rtcToken: rtcToken,
    rtmToken: rtmToken,
    consultationTtype: consultation_type,
    channel: channelName,
  });

  // Save the token data to the database
  tokenData
    .save()
    .then((savedToken) => {
      console.log("Token saved successfully:", savedToken);
      // return the token
    })
    .catch((error) => {
      console.error("Error saving token:", error);
    });
};

//controller function for generating token
const generateRTEToken = (req, resp) => {
  // set response header
  resp.header("Access-Control-Allow-Origin", "*");
  // get channel name
  const channelName = req.params.channel;
  if (!channelName) {
    return resp.status(400).json({ error: "channel is required" });
  }
  // get uid
  let uid = req.body.astrologerId;
  if (!uid || uid === "") {
    return resp.status(400).json({ error: "uid is required" });
  }
  // get role
  let role;
  if (req.params.role === "publisher") {
    role = RtcRole.PUBLISHER;
  } else if (req.params.role === "audience") {
    role = RtcRole.SUBSCRIBER;
  } else {
    return resp.status(400).json({ error: "role is incorrect" });
  }
  // get the expire time
  let expireTime = req.query.expiry;
  if (!expireTime || expireTime === "") {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }
  // calculate privilege expire time
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;

  // build the token
  const rtcToken = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpireTime
  );

  const rtmToken = RtmTokenBuilder.buildToken(
    APP_ID,
    APP_CERTIFICATE,
    uid,
    role,
    privilegeExpireTime
  );

  //save token
  const astrologerId = req.body.astrologerId;
  const userId = req.body.userId;
  const consultation_type = req.body.consultation_type;
  //const token = { rtmToken: rtmToken, rtctoken: rtcToken };
  saveToken(
    rtcToken,
    rtmToken,
    userId,
    astrologerId,
    consultation_type,
    channelName
  );
  return resp.json({ rtcToken: rtcToken, rtmToken: rtmToken });
};

// Controller function to get tokens by userId and astrologerId
const getTokensByUserIdAndAstrologerId = (req, res) => {
  const userId = req.params.userId;
  const astrologerId = req.params.astrologerId;

  Token.find({ userId, astrologerId })
    .sort({ timestamp: -1 }) // Sort in descending order by timestamp
    .limit(1) // Limit the result to one document
    .then((latestToken) => {
      if (latestToken && latestToken.length > 0) {
        // If a token is found, send it as the response

        // Emit a Socket.io event to notify the user's application about the video call
        const userSocket = io().sockets.connected[userId]; // Assuming you have the user's socket ID

        if (userSocket) {
          userSocket.emit("videoCall", {
            astrologerId: astrologerId,
            channel: latestToken[0].channel,
          });
        }
        res.json({ token: latestToken[0] });
      } else {
        // If no token is found, send an appropriate message
        res.status(404).json({ message: "Token not found" });
      }
    })
    .catch((error) => {
      // Handle any errors that occur during the query
      console.error("Error retrieving the latest token:", error);
      res.status(500).json({ error: "Internal server error" });
    });
};

module.exports = {
  generateRTEToken,
  getTokensByUserIdAndAstrologerId,
};
