const express =require("express");
const app =express();
const mongoose = require("mongoose");
// const listing=require("./models/listing.js");
const path =require("path");
const methodOverride = require("method-override");
const ejsMate=require("ejs-mate");
// const wrapAsync = require("./util/wrapAsync.js");
const ExpressError=require("./util/expressError.js");
//const {listingSchema, reviewSchema}=require("./schema.js");
// const Review =require("./models/review.js");
const session =require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");


const listingsRouter= require("./routes/listing.js");
const reviewsRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");



app.set("viewengine" ,"ejs" );
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")))


main().then(()=>{
    console.log("connected to db");
}).catch((err)=>{
    console.log(err);
});
async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}


const sessionOptions={
    secret:"mysupersecretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    },
}


app.get("/",(req,res)=>{
    res.send("you are on root");
});


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

    
// const validateListing=(req,res,next)=>{
//     let {error}=listingSchema.validate(req.body);
    
//     if(error){
//         let errMsg  =error.details.map((el)=>el.message).join(",");
//         throw new ExpressError(400,errMsg);
//     }else{
//         next();
//     }

// }
//-----------------------------------------------------------

// //validating the review schema
// const validateReview=(req,res,next)=>{
//     let {error}=reviewSchema.validate(req.body);
    
//     if(error){
//         let errMsg  =error.details.map((el)=>el.message).join(",");
//         throw new ExpressError(400,errMsg);
//     }else{
//         next();
//     }

// }



//flash messages middleware
app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();

});
// -------------------------------------------------
//Anudeep its not workingggggggggggg
 //authentication demo
// app.get("/demouser", async(req,res)=>{
//     let fakeUser=new User({
//         email:"anudeep@gmail.com",
//         username:"anudeep123"
//     });
//      const registeredUser =await User.register(fakeUser,"hellotinku");
//      res.send(registeredUser);
// });
// ----------------------------------------------------


app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);


app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});
//error handling 
app.use((err,req,res,next)=>{
    // res.send("someting is went wrong");
     let {statusCode=500 ,message="oops! something went wrong"}=err;
     res.status(statusCode).render("./listings/error.ejs",{message});
     //res.status(statusCode).send(message);
 });

 app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404,"Page Not Found"));
});

//  app.all(" * ",(req,res,next)=>{
//      next(new ExpressError(404,"page not found"));
//      });
