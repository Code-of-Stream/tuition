const Material = require('../models/Material');
const Batch = require('../models/Batch');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

// @desc    Get all materials
// @route   GET /api/materials
// @route   GET /api/batches/:batchId/materials
// @access  Private
exports.getMaterials = asyncHandler(async (req, res, next) => {
  if (req.params.batchId) {
    // Get materials for a specific batch
    const materials = await Material.find({ 
      batch: req.params.batchId,
      isActive: true 
    })
      .populate('uploadedBy', 'name')
      .sort('-createdAt');
    
    return res.status(200).json({
      success: true,
      count: materials.length,
      data: materials
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single material
// @route   GET /api/materials/:id
// @access  Private
exports.getMaterial = asyncHandler(async (req, res, next) => {
  const material = await Material.findById(req.params.id)
    .populate('uploadedBy', 'name')
    .populate('batch', 'name subject');

  if (!material || !material.isActive) {
    return next(
      new ErrorResponse(`Material not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user has access to this material
  const batch = await Batch.findById(material.batch._id);
  if (
    req.user.role === 'student' && 
    !batch.students.includes(req.user.id) &&
    batch.teacher.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse('Not authorized to view this material', 403)
    );
  }

  res.status(200).json({
    success: true,
    data: material
  });
});

// @desc    Upload material
// @route   POST /api/materials
// @access  Private/Teacher
exports.uploadMaterial = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.uploadedBy = req.user.id;

  // Check if batch exists and user is the teacher
  const batch = await Batch.findById(req.body.batch);
  if (!batch) {
    return next(new ErrorResponse(`Batch not found with id of ${req.body.batch}`, 404));
  }

  if (batch.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Not authorized to upload materials for this batch', 403)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.files.file;

  // Make sure the file is a document
  const fileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ];

  if (!fileTypes.includes(file.mimetype)) {
    return next(
      new ErrorResponse(
        'Please upload a document file (PDF, DOC, DOCX, PPT, PPTX, TXT)',
        400
      )
    );
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return next(
      new ErrorResponse('File size cannot be more than 10MB', 400)
    );
  }

  // Create custom filename
  file.name = `material_${Date.now()}${path.parse(file.name).ext}`;

  // Upload file to server
  file.mv(`${process.env.FILE_UPLOAD_PATH}/materials/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse('Problem with file upload', 500));
    }

    try {
      // Create material record
      const material = await Material.create({
        ...req.body,
        file: {
          url: `/uploads/materials/${file.name}`,
          filename: file.name,
          mimetype: file.mimetype,
          size: file.size
        }
      });

      res.status(201).json({
        success: true,
        data: material
      });
    } catch (err) {
      // Delete the uploaded file if there was an error creating the record
      await unlinkAsync(`${process.env.FILE_UPLOAD_PATH}/materials/${file.name}`);
      next(err);
    }
  });
});

// @desc    Update material
// @route   PUT /api/materials/:id
// @access  Private/Teacher
exports.updateMaterial = asyncHandler(async (req, res, next) => {
  let material = await Material.findById(req.params.id);

  if (!material || !material.isActive) {
    return next(
      new ErrorResponse(`Material not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is the uploader or admin
  if (
    material.uploadedBy.toString() !== req.user.id && 
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse('Not authorized to update this material', 403)
    );
  }

  // If updating file
  if (req.files) {
    const file = req.files.file;
    
    // Delete old file
    await unlinkAsync(`${process.env.FILE_UPLOAD_PATH}${material.file.url}`);
    
    // Upload new file
    file.name = `material_${Date.now()}${path.parse(file.name).ext}`;
    
    await file.mv(`${process.env.FILE_UPLOAD_PATH}/materials/${file.name}`);
    
    // Update file details
    material.file = {
      url: `/uploads/materials/${file.name}`,
      filename: file.name,
      mimetype: file.mimetype,
      size: file.size
    };
  }
  
  // Update other fields
  material.title = req.body.title || material.title;
  material.description = req.body.description || material.description;
  material.tags = req.body.tags ? req.body.tags.split(',') : material.tags;
  
  await material.save();

  res.status(200).json({
    success: true,
    data: material
  });
});

// @desc    Delete material
// @route   DELETE /api/materials/:id
// @access  Private/Teacher,Admin
exports.deleteMaterial = asyncHandler(async (req, res, next) => {
  const material = await Material.findById(req.params.id);

  if (!material) {
    return next(
      new ErrorResponse(`Material not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is the uploader or admin
  if (
    material.uploadedBy.toString() !== req.user.id && 
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse('Not authorized to delete this material', 403)
    );
  }

  // Delete file from server
  try {
    await unlinkAsync(`${process.env.FILE_UPLOAD_PATH}${material.file.url}`);
  } catch (err) {
    console.error('Error deleting file:', err);
  }

  // Delete record from database
  await material.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Download material file
// @route   GET /api/materials/:id/download
// @access  Private
exports.downloadMaterial = asyncHandler(async (req, res, next) => {
  const material = await Material.findById(req.params.id);

  if (!material || !material.isActive) {
    return next(
      new ErrorResponse(`Material not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user has access to this material
  const batch = await Batch.findById(material.batch);
  if (
    req.user.role === 'student' && 
    !batch.students.includes(req.user.id) &&
    batch.teacher.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse('Not authorized to download this material', 403)
    );
  }

  const filePath = path.join(
    __dirname,
    '..',
    '..',
    'public',
    material.file.url
  );

  res.download(filePath, material.file.filename, err => {
    if (err) {
      console.error('Error downloading file:', err);
      return next(new ErrorResponse('Error downloading file', 500));
    }
  });
});
