function verificarLogin(req, res, next) {
    if (!req.session.usuario) {
        return res.status(401).json({
            mensaje: "Debe iniciar sesión"
        });
    }

    next();
}

module.exports = verificarLogin;