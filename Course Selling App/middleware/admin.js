const adminMiddleware = (req, res, next) => {
   if (req.userRole === 'admin') {
        next(); 
    } else {
        res.status(403).json({
            message: "Access denied. Only administrators can perform this action."
        });
    }
};

module.exports = adminMiddleware;
