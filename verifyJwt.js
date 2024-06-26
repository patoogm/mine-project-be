const jwt = require("jsonwebtoken")

const authJwt = (req, res, next) => {
    const token = req.header('Authorization');
    if(!token) return res.status(401).send("No se pudo validar el token")
    try {
        jwt.verify(token,process.env.SECRETJWT) 
        next()
    } catch (error) {
        res.status(401).send("No se pudo validar el token")
    }
}

module.exports = {
    authJwt
}