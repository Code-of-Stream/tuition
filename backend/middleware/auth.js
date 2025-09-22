const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// Protect routes - user must be logged in
exports.protect = async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Get token from cookie
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from the token
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return next(new ErrorResponse('User not found', 404));
    }
    
    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Check if user is the owner of the resource
exports.checkOwnership = (model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params[paramName]);
      
      // If resource doesn't exist
      if (!resource) {
        return next(
          new ErrorResponse(
            `Resource not found with id of ${req.params[paramName]}`,
            404
          )
        );
      }
      
      // Make sure user is the owner or admin
      if (
        resource.user && 
        resource.user.toString() !== req.user.id && 
        req.user.role !== 'admin'
      ) {
        return next(
          new ErrorResponse(
            `User ${req.user.id} is not authorized to update this resource`,
            403
          )
        );
      }
      
      // If the resource has a different owner field (like 'student' or 'teacher')
      const ownerField = ['student', 'teacher', 'uploadedBy', 'assignedBy', 'recordedBy'].find(
        field => resource[field] && resource[field].toString() !== req.user.id
      );
      
      if (ownerField && resource[ownerField].toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
          new ErrorResponse(
            `User ${req.user.id} is not authorized to access this resource`,
            403
          )
        );
      }
      
      req.resource = resource;
      next();
    } catch (err) {
      next(err);
    }
  };
};

// Check if user is enrolled in a batch
exports.checkEnrollment = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.batchId);
    
    if (!batch) {
      return next(
        new ErrorResponse(`Batch not found with id of ${req.params.batchId}`, 404)
      );
    }
    
    // If user is admin or teacher of the batch, allow access
    if (
      req.user.role === 'admin' || 
      (batch.teacher && batch.teacher.toString() === req.user.id)
    ) {
      req.batch = batch;
      return next();
    }
    
    // For students, check if they are enrolled in the batch
    if (
      req.user.role === 'student' && 
      !batch.students.some(student => student.toString() === req.user.id)
    ) {
      return next(
        new ErrorResponse('You are not enrolled in this batch', 403)
      );
    }
    
    req.batch = batch;
    next();
  } catch (err) {
    next(err);
  }
};
