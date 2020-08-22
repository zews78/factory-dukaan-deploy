module.exports = async(req, res, next)=>{
	global.redirectTo = req.originalUrl;
	next();
};