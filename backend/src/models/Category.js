const mongoose = require("mongoose");
const slugify = require("slugify");
const unidecode = require("unidecode");


const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true, // Đảm bảo slug không trùng lặp
    },
    status: {
      type: String,
      enum: ["active", "inactive"], 
      default: "active",
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

categorySchema.pre("save", async function (next) {
  // Tạo slug cho danh mục
  if (this.isModified("name")) {
    const nameWithoutAccents = unidecode(this.name);  // Chuyển đổi không dấu
    this.slug = slugify(nameWithoutAccents, {
      lower: true,
      strict: true,
    });
  }

  next();
});

// Middleware để tự động cập nhật slug khi `name` thay đổi
categorySchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.name) {
    update.slug = slugify(unidecode(update.name), { lower: true, strict: true });
  }
  next();
});



module.exports = mongoose.model("Category", categorySchema);
