export const generateBlogUserToken = (user, message, statusCode, res) => {
  const token = user.generateJsonWebToken();
 const isProd = process.env.NODE_ENV === "production";
  res
    .status(statusCode)
    .cookie("blogToken", token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,  // Postman ke liye off
      secure: isProd,                                     // Render → TRUE
      sameSite: isProd ? "None" : "Lax",   // local dev ke liye
    })
    .json({
      success: true,
      message,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
};
