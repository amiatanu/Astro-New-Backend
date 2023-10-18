const User = require("../models/User");
const AvailabilitySlot = require("../models/AvailabilitySlot");
const Astrologer = require("../models/Astrologer");
const Consultation = require("../models/Consultation");
const jwt = require("jsonwebtoken");
const client = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const { Storage } = require("@google-cloud/storage");
const path = require("path");

const storage = new Storage({
  keyFilename: process.env.GCS_KEYFILE_PATH,
  projectId: process.env.GCLOUD_PROJECT_ID,
});

const bucketName = process.env.GCS_BUCKET_NAME;

// Function to send OTP via Twilio
async function sendOTP(req, res) {
  try {
    const { mobileNumber } = req.body;
    if (!mobileNumber) {
      return res
        .status(400)
        .json({ error: "Phone number is required.", status: false });
    }
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Send OTP via Twilio SMS
    await client.verify.v2
      .services("VA3fd85fb82579223df03ee53ef7adc2bc")
      .verifications.create({
        to: mobileNumber,
        channel: "sms",
        locale: "en",
      });
    return res
      .status(201)
      .json({ sucess: "01", mobileNumber, message: "OTP sent sucessfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to send OTP", status: false });
  }
}

// Function to verify OTP and handle user login/registration
async function verifyOTP(req, res) {
  try {
    const { mobileNumber, otp } = req.body;
    if (!mobileNumber || !otp) {
      return res
        .status(400)
        .json({ error: "Phone number and OTP are required.", status: false });
    }

    // Verify OTP using Twilio
    const verificationCheck = await client.verify.v2
      .services("VA3fd85fb82579223df03ee53ef7adc2bc")
      .verificationChecks.create({
        to: mobileNumber,
        code: otp,
      });

    if (verificationCheck.status === "approved") {
      // Check if user exists
      let user = await User.findOne({ mobileNumber });

      if (!user) {
        // If user doesn't exist, create a new user
        user = new User({ mobileNumber });
        await user.save();
      }

      // Generate a JWT token for authentication
      const token = jwt.sign(
        { mobileNumber, userId: user._id },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );

      return res.status(200).json({
        message: "Login successful",
        uid: user._id,
        name: user.name,
        profilePictureUrl: user.profilePictureUrl,
        mobileNumber,
        token,
        status: true,
      });
    } else {
      return res.status(400).json({ message: "Wrong OTP", status: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Verification failed",
      details: error.message,
      status: false,
    });
  }
}

//Function to send OTP for updating mobile number
async function sendOTPForUpdate(req, res) {
  try {
    const { newMobileNumber } = req.body;
    const userId = req.user.userId; // Assuming you have user authentication middleware in place

    if (!newMobileNumber) {
      return res.status(400).json({ error: "New mobile number is required." });
    }

    //check if mobile number already exists
    const user = await User.findOne({ mobileNumber: newMobileNumber });
    if (user) {
      return res.status(400).json({
        error: "Mobile number already exists. Please try with a new number.",
      });
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Send OTP via Twilio SMS to the new mobile number
    await client.verify.v2
      .services("VA3fd85fb82579223df03ee53ef7adc2bc")
      .verifications.create({
        to: newMobileNumber,
        channel: "sms",
        locale: "en",
      });

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Function to verify OTP for updating mobile number
async function verifyUpdatedMobileNumber(req, res) {
  try {
    const { otp, newMobileNumber } = req.body;
    const userId = req.user.userId; // Assuming you have user authentication middleware in place

    if (!otp || !newMobileNumber) {
      return res
        .status(400)
        .json({ error: "OTP and new mobile number are required." });
    }

    // Verify OTP using Twilio for the new mobile number
    const verificationCheck = await client.verify.v2
      .services("VA3fd85fb82579223df03ee53ef7adc2bc")
      .verificationChecks.create({
        to: newMobileNumber,
        code: otp,
      });

    if (verificationCheck.status === "approved") {
      // Update the user's mobile number with the new mobile number
      const user = await User.findByIdAndUpdate(
        userId,
        { mobileNumber: newMobileNumber },
        { new: true }
      );

      return res
        .status(200)
        .json({ message: "Mobile number updated and verified successfully" });
    } else {
      return res.status(400).json({ message: "Wrong OTP", status: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Verification failed",
      details: error.message,
      status: false,
    });
  }
}

// Function to add, edit, or update profile details of a user
async function updateUserProfile(req, res) {
  try {
    const { mobileNumber } = req.user;
    const {
      name,
      age,
      gender,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      currentAddress,
      city,
      state,
      country,
      pincode,
      email,
    } = req.body;

    const user = await User.findOne({ mobileNumber });

    if (!user) {
      return res.status(404).json({ error: "User not found", status: false });
    }

    if (name) user.name = name;
    if (age) user.age = age;
    if (gender) user.gender = gender;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (timeOfBirth) user.timeOfBirth = timeOfBirth;
    if (placeOfBirth) user.placeOfBirth = placeOfBirth;
    if (currentAddress) user.currentAddress = currentAddress;
    if (city) user.city = city;
    if (state) user.state = state;
    if (country) user.country = country;
    if (pincode) user.pincode = pincode;
    if (email) user.email = email;

    await user.save();

    return res.status(200).json({
      message: "User profile updated successfully",
      status: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to update user profile",
      details: error.message,
      status: false,
    });
  }
}

async function uploadProfilePicture(req, res) {
  try {
    const { mobileNumber } = req.user;
    const file = req.file;

    const user = await User.findOne({ mobileNumber });

    if (!user) {
      return res.status(404).json({ error: "User not found", status: false });
    }

    if (file) {
      // Upload the file to Google Cloud Storage
      const filename = `profile-${Date.now()}${path.extname(
        file.originalname
      )}`;
      const fileBuffer = file.buffer;

      await storage.bucket(bucketName).file(filename).save(fileBuffer);

      // Construct the public URL for the uploaded image
      const imageUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;

      // Update user's profile picture URL in the user document
      user.profilePictureUrl = imageUrl;
      await user.save();
    }

    return res.status(200).json({
      message: "Profile picture uploaded/updated successfully",
      status: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to upload/update profile picture",
      details: error.message,
      status: false,
    });
  }
}

// Function to fetch/get profile details of a user
async function getUserProfile(req, res) {
  try {
    const { mobileNumber } = req.user;

    const user = await User.findOne({ mobileNumber });

    if (!user) {
      return res.status(404).json({ error: "User not found", status: false });
    }

    return res.status(200).json({
      message: "User profile retrieved successfully",
      user,
      status: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to retrieve user profile",
      details: error.message,
      status: false,
    });
  }
}

// Function to get the number of users
async function getNumberOfUsers(req, res) {
  try {
    // Use the `countDocuments` method to count the number of documents in the collection
    const numberOfUsers = await User.countDocuments();

    return res.status(200).json({
      message: "Number of users retrieved successfully.",
      numberOfUsers,
      status: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to retrieve the number of users",
      details: error.message,
      status: false,
    });
  }
}

// Function to create a new user with a wallet
async function UserLogin(req, res) {
  try {
    const { username, password } = req.body;
    const walletId = `wallet_${Math.random().toString(36).substr(2, 9)}`;

    const user = new User({
      username,
      password,
      walletId,
    });

    await user.save();

    // Create a wallet for the user
    const wallet = new Wallet({
      userId: user._id,
      walletId: walletId,
      balance: 0,
    });

    await wallet.save();

    res.redirect("/login");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

// Controller to get available slots for a specific day
async function getAvailableSlots(req, res) {
  try {
    const { astrologerId, day } = req.params;

    const availableSlots = await AvailabilitySlot.find({
      astrologer: astrologerId,
      day,
      booked: false,
    });

    res.status(200).json(availableSlots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Function to get astrologer profile details
async function getAstrologerDetails(req, res) {
  try {
    const { id } = req.params;

    // Find the astrologer by their unique ID
    const astrologer = await Astrologer.findById(id);

    if (!astrologer) {
      return res.status(404).json({ message: "Astrologer not found" });
    }

    // Extract the specific fields you want from the astrologer object
    const {
      fullName,
      astrologerType,
      languages,
      aboutYourself,
      profilePicture,
      rating,
      callCharges,
      chatCharges,
      videoCallCharges,
      charges,
      reviews,
    } = astrologer;

    // Return the selected fields in the response
    return res.status(200).json({
      message: "Astrologer profile details fetched successfully",
      astrologer: {
        fullName,
        astrologerType,
        languages,
        aboutYourself,
        profilePicture,
        rating,
        callCharges,
        chatCharges,
        videoCallCharges,
        reviews,
      },
      status: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to fetch astrologer profile details",
      details: error.message,
      status: false,
    });
  }
}

// Function to give feedback and rating to astrologer
async function giveFeedbackAndRating(req, res) {
  try {
    const { consultationId, astrologerId, userId, feedback, rating } = req.body;

    // Find the consultation record
    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    // Check if the consultation involves the specified user and astrologer
    if (
      consultation.userId.toString() !== userId ||
      consultation.astrologerId.toString() !== astrologerId
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update the consultation record with feedback and rating
    consultation.userFeedback = feedback;
    consultation.userRating = rating;

    // Update the consultation status to mark it as completed (or any appropriate status)
    consultation.status = "Completed";

    // Save the updated consultation record
    await consultation.save();

    return res
      .status(200)
      .json({ message: "Feedback and rating submitted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Failed to submit feedback and rating" });
  }
}
module.exports = {
  sendOTP,
  verifyOTP,
  updateUserProfile,
  uploadProfilePicture,
  getUserProfile,
  getNumberOfUsers,
  UserLogin,
  getAvailableSlots,
  getAstrologerDetails,
  sendOTPForUpdate,
  verifyUpdatedMobileNumber,
  giveFeedbackAndRating,
};
