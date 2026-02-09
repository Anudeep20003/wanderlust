const express=require("express");
const router=express.Router({mergeParams:true});

const wrapAsync = require("../util/wrapAsync.js");
const ExpressError=require("../util/expressError.js");
const listing=require("../models/listing.js");
const {listingSchema, reviewSchema}=require("../schema.js");
const Review =require("../models/review.js");


const validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }

}



//reviews
//post 
router.post("/",validateReview ,wrapAsync (async(req,res)=>{
    let Listing=  await listing.findById(req.params.id);
    let newReview =new Review(req.body.review);
    Listing.reviews.push(newReview);
    await newReview.save();
    await Listing.save();

    // console.log("new review added to the listing");
    req.flash("success" ,"New review added!");
   res.redirect(`/listings/${Listing._id}`);
   
    
}));

//delete review route and review id from listing
router.delete("/:reviewId" ,wrapAsync(async(req,res)=>{
    let {id ,reviewId}=req.params;
    await listing.findByIdAndUpdate(id,{$pull :{reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success" ,"review deleted!");
    res.redirect(`/listings/${id}`);
    //res.send("hi");

}));

module.exports=router;