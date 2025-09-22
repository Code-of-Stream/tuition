const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getMaterials,
  getMaterial,
  uploadMaterial,
  updateMaterial,
  deleteMaterial,
  downloadMaterial
} = require('../controllers/materialController');

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Material = require('../models/Material');

// Multer for file uploads
const multer = require('multer');
const path = require('path');

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${process.env.FILE_UPLOAD_PATH}/materials/`);
  },
  filename: (req, file, cb) => {
    cb(null, `material_${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  const filetypes = /pdf|doc|docx|ppt|pptx|txt/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only document files are allowed (PDF, DOC, DOCX, PPT, PPTX, TXT)'));
  }
};

// Initialize upload
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max file size
}).single('file');

// Middleware to handle file upload
const handleFileUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return next(new ErrorResponse(err.message, 400));
    }
    next();
  });
};

router
  .route('/')
  .get(
    advancedResults(Material, [
      { path: 'uploadedBy', select: 'name' },
      { path: 'batch', select: 'name subject' }
    ]), 
    getMaterials
  )
  .post(protect, authorize('admin', 'teacher'), handleFileUpload, uploadMaterial);

router
  .route('/:id')
  .get(getMaterial)
  .put(protect, authorize('admin', 'teacher'), handleFileUpload, updateMaterial)
  .delete(protect, authorize('admin', 'teacher'), deleteMaterial);

router
  .route('/:id/download')
  .get(protect, downloadMaterial);

module.exports = router;
