const UserModel = require("../models/UserModel");
const bcryptjs = require('bcryptjs');

async function registerUser(req, res) {
    try {
        const { name, email, password, profile_pic } = req.body;
        console.log("Received request body:", req.body);

        // Check if user already exists
        const checkEmail = await UserModel.findOne({ email });
        if (checkEmail) {
            return res.status(400).json({
                message: "User already exists",
                error: true,
            });
        }

        // Hash the password
        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(password, salt);

        // Create a new user
        const newUser = new UserModel({
            name,
            email,
            profile_pic,
            password: hashPassword,
        });

        // Save the user to the database
        const userSave = await newUser.save();

        // Respond with success message
        return res.status(201).json({
            message: "User created successfully",
            data: userSave,
            success: true,
        });
    } catch (error) {
        console.error("Error in registerUser:", error);
        return res.status(500).json({
            message: error.message || error,
            error: true,
        });
    }
}

module.exports = registerUser;
