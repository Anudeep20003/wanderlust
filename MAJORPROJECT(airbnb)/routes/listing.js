const express=require("express");
const router=express.Router();
const wrapAsync = require("../util/wrapAsync.js");
const ExpressError=require("../util/expressError.js");
const {listingSchema, reviewSchema}=require("../schema.js");
const listing=require("../models/listing.js");
const {isLoggedIn}=require("../middleware.js");

const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    
    if(error){
        let errMsg  =error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }

}


//INDEX ROUTE
router.get("/",async(req,res)=>{
    const allListings = await listing.find({});
    res.render("./listings/index.ejs",{allListings} );
});

//NEW ROUTE
router.get("/new",isLoggedIn, (req,res)=>{
    console.log(isLoggedIn);
    res.render("./listings/new.ejs");
        

});

//CREATE ROUTE
router.post("/",isLoggedIn, validateListing , wrapAsync(async(req,res,next)=>{
    
    // try{
    const newListing = new listing(req.body.listing);
    await newListing.save();
    req.flash("success" ,"New listing created!");
    res.redirect("/listings");
    // }catch(err){
    //     next(err);
    // }
})
);


//EDIT ROUTE
router.get("/:id/edit",isLoggedIn,wrapAsync(async(req,res)=>{
     let {id}= req.params;
    const Listing = await listing.findById(id);
    
    res.render("./listings/edit.ejs",{Listing});
}));

//SHOW ROUTE
router.get("/:id",wrapAsync(async(req,res)=>{
    let {id}= req.params;
    const Listing = await listing.findById(id).populate("reviews");
    // if(!Listing){
    //     req.flash("error","Listing your trying to see is deleted or do not exist!");
    //     res.redirect("/listings");
    // }
    res.render("./listings/show.ejs",{Listing});
}));

//UPDTATE ROUTE
router.put("/:id",isLoggedIn,validateListing,wrapAsync(async(req,res)=>{
    let {id}= req.params;
    
   await listing.findByIdAndUpdate(id,{...req.body.listing});
   req.flash("success" ," review edited!");
   res.redirect(`/listings/${id}`);
}));

//DELETE ROUTE
router.delete("/:id",isLoggedIn,wrapAsync(async(req,res)=>{
    let {id}= req.params;
    let deletedData=await listing.findByIdAndDelete(id);
    req.flash("success" ,"listing deleted");
    res.redirect("/listings");
    console.log(deletedData);
}));


module.exports=router;