const jwt = require("jsonwebtoken")

function adminMiddleware(req, res, next){
    const token = req.headers.authorization

    if(!token){
       return res.json({
            message: "Token is missing!"
        })
    }
    const words = token.split(" ")
    const jwtToken = words[1]
    try {
        const decodeData = jwt.verify(jwtToken, process.env.JWT_ADMIN_SECRET)
        if(decodeData && decodeData.id){
            req.userId = decodeData.id
            next()
        } else {
            res.status(403).json({
                message: "Invalid Credentials"
            })
        }
    } catch (err) {
        res.status(403).json({
            message: "Invalid or expired token"
        })
    }
}

module.exports = adminMiddleware