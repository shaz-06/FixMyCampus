exports.notFound = (req,res) => res.status(404).json({ success:false, message:'Route not found.' });
exports.errorHandler = (err,req,res,next) => { console.error(err.message); res.status(err.statusCode || 500).json({ success:false, message: process.env.NODE_ENV === 'production' ? 'Server error.' : err.message || 'Server error.' }); };
