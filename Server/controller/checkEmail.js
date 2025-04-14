const UserModel = require("../models/UserModel");

async function checkEmail(request, response) {
  try {
    console.log("Incoming email check request:", request.body); // Debugging log

    const { email } = request.body;

    if (!email) {
      return response.status(400).json({
        message: "Email is required",
        error: true,
      });
    }

    const checkEmail = await UserModel.findOne({ email }).select("-password");

    if (!checkEmail) {
      return response.status(400).json({
        message: "User does not exist",
        error: true,
      });
    }

    return response.status(200).json({
      message: "Email verified",
      success: true,
      data: checkEmail,
    });
  } catch (error) {
    console.error("Error in checkEmail controller:", error); // Log exact backend error
    return response.status(500).json({
      message: error.message || error,
      error: true,
    });
  }
}

module.exports = checkEmail;
