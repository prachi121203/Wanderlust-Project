const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        require: true
    },
    description: String,
    image: {
        type: String,
        default: "https://unsplash.com/photos/silhouette-of-palm-tree-near-body-of-water-during-sunset-CXyz3qljaH8",
        set: (v) => v==="" ? "https://unsplash.com/photos/silhouette-of-palm-tree-near-body-of-water-during-sunset-CXyz3qljaH8": v,
    },
    price: Number,
    location: String,
    country: String,
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;