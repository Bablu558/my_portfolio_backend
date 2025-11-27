import { catchAsyncErrors } from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../middleware/error.js";
import { Certificate } from "../models/certificateSchema.js";
import { v2 as cloudinary } from "cloudinary";

// ✅ Add New Certificate
export const addNewCertificate = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Certificate Image Required!", 400));
  }

  const { certificateImage } = req.files;
  const { name } = req.body;

  if (!name) {
    return next(new ErrorHandler("Certificate Name Required!", 400));
  }

  const cloudinaryResponse = await cloudinary.uploader.upload(
    certificateImage.tempFilePath,
    { folder: "PORTFOLIO CERTIFICATES" }
  );

  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponse.error || "Unknown Cloudinary error"
    );
    return next(new ErrorHandler("Failed to upload certificate image", 500));
  }

  const certificate = await Certificate.create({
    name,
    certificateImage: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });

  res.status(201).json({
    success: true,
    message: "New Certificate Added!",
    certificate,
  });
});

// ✅ Update Certificate
export const updateCertificate = catchAsyncErrors(async (req, res, next) => {
  console.log("BODY: ", req.body);
  console.log("FILES: ", req.files);

  const newCertificateData = {
    name: req.body.name,
  };

  if (req.files && req.files.certificateImage) {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return next(new ErrorHandler("Certificate Not Found!", 404));
    }

    // Delete old image from Cloudinary
    const certificateImageId = certificate.certificateImage.public_id;
    await cloudinary.uploader.destroy(certificateImageId);

    // Upload new one
    const cloudinaryResponse = await cloudinary.uploader.upload(
      req.files.certificateImage.tempFilePath,
      { folder: "PORTFOLIO CERTIFICATES" }
    );

    newCertificateData.certificateImage = {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    };
  }

  const certificate = await Certificate.findByIdAndUpdate(
    req.params.id,
    newCertificateData,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  if (!certificate) {
    return next(new ErrorHandler("Certificate Not Found!", 404));
  }

  res.status(200).json({
    success: true,
    message: "Certificate Updated!",
    certificate,
  });
});

// ✅ Delete Certificate
export const deleteCertificate = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const certificate = await Certificate.findById(id);

  if (!certificate) {
    return next(new ErrorHandler("Certificate Not Found!", 404));
  }

  const certificateImageId = certificate.certificateImage.public_id;
  await cloudinary.uploader.destroy(certificateImageId);
  await certificate.deleteOne();

  res.status(200).json({
    success: true,
    message: "Certificate Deleted!",
  });
});

// ✅ Get All Certificates
export const getAllCertificates = catchAsyncErrors(async (req, res, next) => {
  const certificates = await Certificate.find();
  res.status(200).json({
    success: true,
    certificates,
  });
});

// ✅ Get Single Certificate
export const getSingleCertificate = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const certificate = await Certificate.findById(id);

  if (!certificate) {
    return next(new ErrorHandler("Certificate Not Found!", 404));
  }

  res.status(200).json({
    success: true,
    certificate,
  });
});
