const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken');

async function userDetails(request, response) {
    try {
        let token = request.cookies.token || "";
        
        // Check for Authorization header
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7); // Remove 'Bearer ' prefix
        }
        
        if (!token) {
            return response.status(400).json({
                message: "Token is missing",
                error: true
            });
        }

        const user = await getUserDetailsFromToken(token);

        if (!user) {
            return response.status(404).json({
                message: "User not found",
                error: true
            });
        }

        return response.status(200).json({
            message: "User Details",
            data: user
        });
    } catch (error) {
        console.error("Error fetching user details:", error);
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true
        });
    }
}

module.exports = userDetails;
