const mongoose = require("mongoose");
const slugify = require("slugify");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    unique: true, // Đảm bảo slug không trùng lặp
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category", // Liên kết với chính collection Category (nếu là danh mục con)
    default: null,
  },
  status: {
    type: String,
    enum: ["active", "inactive"], // Chỉ nhận giá trị active/inactive
    default: "active",
  },
  description: {
    type: String,
    trim: true,
  },
}, { timestamps: true }); // Tự động thêm createdAt và updatedAt

categorySchema.pre("save", function (next) {
  if (!this.isModified("name")) return next();
  this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});


module.exports = mongoose.model("Category", categorySchema);
