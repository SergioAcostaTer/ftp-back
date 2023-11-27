const checkPasswordMiddleware = (req, res, next) => {
  const providedPassword = req.headers.authorization;

  if (!providedPassword || providedPassword !== process.env.FTP_PASSWORD) {
    return res.status(401).json({ success: false });
  }

  next();
};

module.exports = checkPasswordMiddleware;
