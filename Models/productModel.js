const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter the name of product"],
    validate: [
      validator.isAlphanumeric,
      "Product name should only contain alphabets",
    ],
    maxlength: [30, "A tour name must more or less then 40 characters"],
  },
  price: { type: Number, required: [true, "A tour must have a price"] },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, "Rating must be above 1.0"],
    max: [5, "Rating must be below 5.0"],
    set: (val) => Math.round(val * 10) / 10, // if we dont multi by 10 for 4.6666 it will give 5 but multi by 10 it will give 47 / 10 =4.7
  },
  ratingQuantity: { type: Number, default: 0 },
  priceDiscount: {
    type: Number,
    validate: {
      message: "Discount {{VALUE}} should be less than price",
      validator: function(val) {
        //This will not work in update only use it while creating a new doc
        return val < this.price;
      },
    },
  },
  summary: {
    type: String,
    trim: true,
    required: [true, "Tour must have a summery"],
  },
  description: { type: String, trim: true },
  imageCover: {
    type: String,
    required: [true, "Tour must have a cover image"],
  },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now(), select: false },
  location: {
    // GeoJSON
    type: {
      type: String,
      default: "Point",
      enum: ["Point"],
      required: [true, "Tour must have a type"],
    },
    coordinates: [Number],
    address: String,
    description: String,
  },
  popular: {
    type: Boolean,
    default: false,
  },
  foodType: {
    type: String,
    required: [true, "Product type like chines etc should be mentioned"],
  },
  category: {
    type: String,
    enum: ["Snacks, Deserts, FastFood, Main"],
  },
});
