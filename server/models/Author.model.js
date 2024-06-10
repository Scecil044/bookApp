const mongoose = require("mongoose");

const AuthorSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: Number, required: true },
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Author", AuthorSchema);
