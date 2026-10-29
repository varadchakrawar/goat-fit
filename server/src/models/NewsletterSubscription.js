const mongoose = require('mongoose');

const newsletterSubscriptionSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    status: {
      type: String,
      enum: ['subscribed', 'unsubscribed'],
      default: 'subscribed',
    },
    source: {
      type: String,
      default: 'footer_goat_dispatch',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('NewsletterSubscription', newsletterSubscriptionSchema);
