const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");   
const ejsMate = require("ejs-mate"); 
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/expressError");

const port = 6006;
app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname , "views"));
app.use(express.urlencoded({extended: true}));
app.engine("ejs" , ejsMate);
app.use(express.static(path.join(__dirname, "public")));
const {listingSchema} = require("./schema.js");

app.use(methodOverride("_method"));

app.locals.layout = 'layouts/boilerplate.ejs';

main().then(() =>{console.log("connection is successful")})
.catch(err => console.log(err));
// mongoose ke saths connetion 
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wonderlust");
}

app.get("/", (req, res) => {
    res.send("home");
});

const validateListing = (req , res , next)=>{
    const {error} = listingSchema.validate(req.body);
    if(error){
        let msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400 , msg);
    }
    else next();
};

app.get("/listings", wrapAsync( async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));

app.get("/listings/new", (req , res)=>{
    res.render("listings/new.ejs");
});


app.get("/listings/:id", wrapAsync( async (req , res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
}));

app.put("/listings/:id", validateListing, wrapAsync(async (req , res)=>{
    if(!req.body.listing) throw new ExpressError(400 , "Invalid Listing Data");
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id , {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

// create new listing or route
app.post("/listings" , validateListing, wrapAsync(async (req , res ,next)=>{
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
})) ;

app.get("/listings/:id/edit", validateListing, wrapAsync(async (req , res)=>{
    let id = req.params.id;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
    }));

    app.put("/listings/:id", validateListing, wrapAsync(async (req , res)=>{
        if(!req.body.listing) throw new ExpressError(400 , "Invalid Listing Data");
        let {id} = req.params;
        await Listing.findByIdAndUpdate(id , {...req.body.listing});
        res.redirect(`/listings/${id}`);
    }));

app.delete("/listings/:id",validateListing, wrapAsync(async (req ,res)=>{
    if(!req.body.listing) throw new ExpressError(400 , "Invalid Listing Data");
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
})) ;

// app.get("/testListings", async (req, res) => {
//     let sampleListing = new Listing({
//         title: "My home",
//         description: "nice home",
//         price: 120000,
//         location: "New York",
//         country: "USA",
//     });
//     await sampleListing.save();
//     console.log(sampleLiscting);
//     res.send("done");
// });

app.all("*", (req , res , next)=>{
    next(new ExpressError(404 , "Page not found"));
});

app.use((err , req , res , next)=>{
    let {status=500, message="Something went wrong"} = err;
    res.status(status).send(message);
    res.render("listings/error.ejs", {message});
    // res.status(status).send(message);
});

app.listen(port , () => {
    console.log(`server is running on port ${port}`);
});

