exports.adminOnly = (req, res, next) => req.user?.role === 'admin' ? next() : res.status(403).json({ success:false, message:'Admin access required.' });
