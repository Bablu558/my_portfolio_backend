import PDFDocument from "pdfkit";
import { Blog } from "../models/blogSchema.js";
import { BlogUser } from "../models/blogUserSchema.js";

export const exportUserDataPDF = async (req, res) => {
  try {
    const userId = req.blogUser._id;

    const user = await BlogUser.findById(userId).select("-password");
    const blogs = await Blog.find({ author: userId });

    const totalViews = blogs.reduce((sum, blog) => sum + blog.views, 0);
    const totalLikes = blogs.reduce((sum, blog) => sum + blog.likes, 0);

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${user.name}-blog-data.pdf`
    );

    doc.pipe(res);

    /* ---------------- HEADER ---------------- */

    doc
      .rect(0, 0, 612, 90)
      .fill("#0f172a");

    doc
      .fillColor("white")
      .fontSize(28)
      .text("BlogFire Analytics Report", 50, 30);

    doc.moveDown(4);

    /* ---------------- USER INFO ---------------- */

    doc
      .fillColor("#111827")
      .fontSize(18)
      .text("User Information", { underline: true });

    doc.moveDown();

    doc
      .fontSize(12)
      .text(`Name: ${user.name}`)
      .text(`Email: ${user.email}`)
      .text(`Joined: ${new Date(user.createdAt).toLocaleDateString()}`);

    doc.moveDown(2);

    /* ---------------- ANALYTICS CARDS ---------------- */

    const cardY = doc.y;

    // Card 1
    doc
      .roundedRect(50, cardY, 150, 70, 10)
      .fill("#3b82f6");

    doc
      .fillColor("white")
      .fontSize(12)
      .text("TOTAL BLOGS", 65, cardY + 10);

    doc
      .fontSize(22)
      .text(blogs.length.toString(), 65, cardY + 30);

    // Card 2
    doc
      .roundedRect(230, cardY, 150, 70, 10)
      .fill("#22c55e");

    doc
      .fillColor("white")
      .fontSize(12)
      .text("TOTAL VIEWS", 245, cardY + 10);

    doc
      .fontSize(22)
      .text(totalViews.toString(), 245, cardY + 30);

    // Card 3
    doc
      .roundedRect(410, cardY, 150, 70, 10)
      .fill("#f59e0b");

    doc
      .fillColor("white")
      .fontSize(12)
      .text("TOTAL LIKES", 425, cardY + 10);

    doc
      .fontSize(22)
      .text(totalLikes.toString(), 425, cardY + 30);

    doc.moveDown(5);

    /* ---------------- CHART ---------------- */

    // const chartTitleY = cardY + 110;

    // doc
    //   .fillColor("#111827")
    //   .fontSize(18)
    //   .text("Views Chart", 50, chartTitleY);

    // const chartX = 80;
    // const chartBaseY = chartTitleY + 140;
    // const barWidth = 40;

    // blogs.forEach((blog, index) => {

    //   const barHeight = blog.views * 10;

    //   doc
    //     .fillColor("#3b82f6")
    //     .rect(
    //       chartX + index * 90,
    //       chartBaseY - barHeight,
    //       barWidth,
    //       barHeight
    //     )
    //     .fill();

    //   doc
    //     .fillColor("#111827")
    //     .fontSize(10)
    //     .text(
    //       blog.title,
    //       chartX + index * 90,
    //       chartBaseY + 5,
    //       { width: barWidth + 20, align: "center" }
    //     );
    // });

    // doc.moveDown(10);

    /* ---------------- BLOG TABLE ---------------- */

   /* ---------------- BLOG TABLE ---------------- */

doc.moveDown(3);

doc
  .fillColor("#111827")
  .fontSize(18)
  .text("Blogs Table");

doc.moveDown();

const startX = 50;
let startY = doc.y;

/* Header */
doc
  .rect(startX, startY, 500, 30)
  .fill("#0f172a");

doc
  .fillColor("white")
  .fontSize(12)
  .text("Title", startX + 10, startY + 8)
  .text("Views", startX + 300, startY + 8)
  .text("Likes", startX + 400, startY + 8);

startY += 30;

/* Rows */

blogs.forEach((blog, index) => {

  const bg = index % 2 === 0 ? "#f8fafc" : "#e5e7eb";

  doc
    .rect(startX, startY, 500, 25)
    .fill(bg);

  doc
    .fillColor("#111827")
    .fontSize(11)
    .text(blog.title, startX + 10, startY + 7)
    .text(blog.views.toString(), startX + 300, startY + 7)
    .text(blog.likes.toString(), startX + 400, startY + 7);

  startY += 25;
});

    /* ---------------- FOOTER ---------------- */

    doc
      .fontSize(10)
      .fillColor("gray")
      .text(
        `Generated on ${new Date().toLocaleString()}`,
        50,
        750,
        { align: "center", width: 500 }
      );

    doc.end();

  } catch (error) {
    res.status(500).json({ message: "Error exporting PDF" });
  }
};