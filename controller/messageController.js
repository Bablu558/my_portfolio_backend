import { Message } from "../models/messageSchema.js";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../middleware/error.js";
import { sendMessageEmail } from "../utils/sendMessageEmail.js";
export const sendMessage = catchAsyncErrors(async (req, res, next) => {
  const { senderName, subject, message,email  } = req.body;

  if (!senderName || !subject || !message) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  // save in DB
  const data = await Message.create({ senderName, subject, message,email  });

  // send email
  await sendMessageEmail({
    name: senderName,
    subject,
    message,
    email 
  });

  res.status(201).json({
    success: true,
    message: "Message Sent Successfully!",
    data
  });
});

export const deleteMessage = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const message = await Message.findById(id);
  if (!message) {
    return next(new ErrorHandler("Message Already Deleted!", 400));
  }
  await message.deleteOne();
  res.status(201).json({
    success: true,
    message: "Message Deleted",
  });
});

export const getAllMessages = catchAsyncErrors(async (req, res, next) => {
  const messages = await Message.find();
  res.status(201).json({
    success: true,
    messages,
  });
});
