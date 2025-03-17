const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js"); 
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} =require("./schema.js");


main()
    .then(() => {
    console.log("Connected to DB");
 })
   .catch(err => {
    console.log(err);
 });

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res)=> {
    res.send("Hi, I am root");
});

const validateListing=(req, res, next)=>{
  let {error}= listingSchema.validation(req.body);
  
  if(error){
   throw new ExpressError(400, error);
  }else{
    next();
  }
};

//Index Route
app.get("/listings", wrapAsync(async(req, res) => {
   const allListings= await Listing.find({});
   res.render("listings/index.ejs", {allListings});
    }));

//New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
   });

//Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
    }));
  
//Create Route
app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {
    let result= listingSchema.validation(req.body);
    console.log(result);
    if(result.error){
     throw new ExpressError(400, result.error);
    }
    const newListing = new Listing(req.body.listing);
   

    await newListing.save();
    res.redirect("/listings");
  }));



//
// Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    return res.status(404).send("Listing not found");
}
  res.render("listings/edit.ejs", { listing });
}));




//Update Route
//app.put("/listings/:id", wrapAsync(async (req, res) => {
//  if(!req.body.listings) {
//    throw new ExpressError(400, "Send valid data for listing");
//  }
//    let { id } = req.params;
//    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
//    res.redirect(`/listings/${id}`);
//  }));

app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
  let { id } = req.params;

  // Log request body to check if data is being sent correctly
  console.log("Request Body:", req.body);

  if (!req.body.listing) {
      return res.status(400).send("Send valid data for listing");
  }

  await Listing.findByIdAndUpdate(id, req.body.listing, { runValidators: true, new: true });

  res.redirect(`/listings/${id}`);
}));

  
//Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
  }));

//app.get("/testListing", async(req, res) => {
    //let samplelisting = new Listing({
    //    title: "My New Villa",
    //    description: "By the beach",
    //    price: 1200,
    //    location: "Calangute, Goa",
    //    country: "India",
    //});
//
    //await samplelisting.save();
    //console.log("sample was save");
    //res.send("successful testing");
//});

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let {statusCode =500, message="Somthing went wrong!"} = err;
  res.render("error.ejs", { message: 'An error occurred!' });
  //res.status(statusCode).send(message);
});

app.listen(5000, ()=> {
    console.log("server is listening to port 5000");
});