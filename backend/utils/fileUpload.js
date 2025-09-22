const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

// Ensure upload directory exists
const ensureUploadsDir = (uploadPath) => {
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
};

// Delete file from server
const deleteFile = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      await unlinkAsync(filePath);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`Error deleting file: ${filePath}`, err);
    return false;
  }
};

// File filter for multer
const fileFilter = (allowedTypes, errorMessage) => (req, file, cb) => {
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error(errorMessage));
  }
};

// Configure multer for file uploads
const configureUpload = (uploadPath, allowedTypes, errorMessage, maxFileSize = 10 * 1024 * 1024) => {
  ensureUploadsDir(uploadPath);
  
  const storage = {
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
  };

  return {
    storage: multer.diskStorage(storage),
    fileFilter: fileFilter(allowedTypes, errorMessage),
    limits: { fileSize: maxFileSize }
  };
};

// Handle single file upload
const uploadSingleFile = (fieldName, uploadConfig) => {
  const upload = multer(uploadConfig).single(fieldName);
  
  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err) {
        return next(new ErrorResponse(`File upload error: ${err.message}`, 400));
      }
      next();
    });
  };
};

// Handle multiple file uploads
const uploadMultipleFiles = (fieldName, maxCount, uploadConfig) => {
  const upload = multer(uploadConfig).array(fieldName, maxCount);
  
  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err) {
        return next(new ErrorResponse(`File upload error: ${err.message}`, 400));
      }
      next();
    });
  };
};

module.exports = {
  ensureUploadsDir,
  deleteFile,
  configureUpload,
  uploadSingleFile,
  uploadMultipleFiles,
  fileFilter
};
