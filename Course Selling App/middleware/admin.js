const jwt = require("jsonwebtoken")
const { JWT_ADMIN_SECRET } = require("../config")


function adminMiddleware(req, res, next){
    const token = req.headers.authorization

    if(!token){
        res.json({
            message: "Token is missing!"
        })
    }
    const words = token.split(" ")
    const jwtToken = words[1]
    const decodeData = jwt.sign(jwtToken, JWT_ADMIN_SECRET)

    if(decodeData.username){
        req.userId = decodeData.id
        next()
    } else {
        res.status(403).json({
            message: "Invalid Credientials"
        })
    }
}

module.exports = adminMiddleware