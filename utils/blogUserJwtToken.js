export const generateBlogUserToken = (user, message, statusCode, res) => {
  const token = user.generateJsonWebToken();

  res
    .status(statusCode)
    .cookie("blogToken", token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: false,  // Postman ke liye off
      sameSite: "Lax",
      secure: false,    // local dev ke liye
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
