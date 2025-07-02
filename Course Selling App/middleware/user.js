const jwt = require("jsonwebtoken")


function userMiddleware(req, res, next){
    const token = req.headers.authorization

    if(!token){
        res.json({
            message: "Token is missing!"
        })
    }
    const words = token.split(" ")
    const jwtToken = words[1]
    const decodeData = jwt.verify(jwtToken, process.env.JWT_USER_SECRET)

    if(decodeData.username){
        next()
    } else {
        res.status(403).json({
            message: "Invalid Credientials"
        })
    }
}

module.exports = userMiddleware