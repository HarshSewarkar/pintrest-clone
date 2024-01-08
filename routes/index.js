var express = require("express");
var router = express.Router();
var userModel = require("./users");
var postModel = require("./post");
var passport = require("passport");
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));
const upload = require("./multer")


router.get("/", function (req, res, next) {
  res.render("index");
});

router.get("/profile",isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user})
  .populate("posts")
  res.render("profile", {user,nav:true});
});

router.get("/create",isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user})
  res.render("Create", {user,nav:true});
});

router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});
router.post("/register", function (req, res, next) {
  var newUser = new userModel({
    //require user model for these step
    username: req.body.username,
    birthday: req.body.birthday,
  });
  // console.log(newUser);
  userModel.register(newUser, req.body.password).then(function (u) {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/feed");
    });
  });
});

router.post("/login",passport.authenticate("local", {
    successRedirect: "/feed", //jo bhi page dikhana ho vo dalo yaha
    failureRedirect: "/", //Loggin fail hone par kis page par bhejna hai
  }),
  function (req, res, next) {}
);


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/"); //Loggin fail hone par kis page par bhejna hai
  }
}

router.get("/feed", isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user})
  const posts = await postModel.find()
  .populate("user")

  // console.log(user); 

  res.render("feed",{user,posts,nav:true});
});

router.get("/login", function (req, res, next) {
  res.render("login");
});
router.post('/fileupload', isLoggedIn, upload.single('avatar'),async function (req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user})
  user.ProfileImage = req.file.filename;
  await user.save()
  res.redirect("/profile")
  // req.body contains the text fields
})

router.post('/submit-post', isLoggedIn, upload.single('postImage'),async function (req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user})
  const post = await postModel.create({
    user:user._id,
    postTitle:req.body.postTitle,
    postContent:req.body.postContent,
    postImage : req.file.filename
  })
  user.posts.push(post._id)
  await user.save()
    
  res.redirect("/feed")
  // req.body contains the text fields
})

router.get("/all-posts",isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user})
  .populate("posts")
  res.render("UserPosts", {user,nav:true});
});
module.exports = router;
