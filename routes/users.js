const { response } = require('express');
var express = require('express');
var router = express.Router();
var ProductHelper=require('../helpers/product-helper');
const userHelper = require('../helpers/user-helper');
var UserHelper=require('../helpers/user-helper')
var db=require('../config/connection');

//Using of midelware
const verifyLogin=(req,res,next)=>{
   if(req.session.logedIn)
   {
   next();
   }else{
     res.redirect('/login')
   }
}

router.get('/',async(req,res)=>{
  if(db.get()===null){
    res.render('user/something-went-wrong')
  }else{
    let user_login=req.session.user;
    let cartCount=null
    if(req.session.user){
      cartCount=await userHelper.getCartCount(req.session.user._id)
    }
   ProductHelper.getRandomProducts().then((products)=>{
      res.render('user/home',{user:true,user_login,cartCount,products})
    })
  }
 
  // res.render('user/home',{user:true,user_login,cartCount})
})

/* GET Asus Product Page. */
router.get('/asus-product', async function(req, res, next) {
  //user_login caontain the data of particualr user who loggedin
  let user_login=req.session.user;
  let cartCount=null
  if(req.session.user){
    cartCount=await userHelper.getCartCount(req.session.user._id)
  }
  //console.log(cartCount);
  ProductHelper.getALLAsusProducts().then((products)=>{
    //console.log(products)
    res.render('user/asus-product-page',{user:true,products,user_login,cartCount})
  })
});
router.get('/acer-product', async function(req, res, next) {
  let user_login=req.session.user;
  let cartCount=null
  if(req.session.user){
    cartCount=await userHelper.getCartCount(req.session.user._id)
  }
  ProductHelper.getALLAcerProducts().then((products)=>{  
    res.render('user/acer-product-page',{user:true,products,user_login,cartCount})
  })
});
router.get('/dell-product', async function(req, res, next) {
  let user_login=req.session.user;
  let cartCount=null
  if(req.session.user){
    cartCount=await userHelper.getCartCount(req.session.user._id)
  }
  ProductHelper.getALLDellProducts().then((products)=>{
    res.render('user/dell-product-page',{user:true,products,user_login,cartCount})
  })
});
router.get('/hp-product', async function(req, res, next) {
  let user_login=req.session.user;
  let cartCount=null
  if(req.session.user){
    cartCount=await userHelper.getCartCount(req.session.user._id)
  }
  ProductHelper.getALLHpProducts().then((products)=>{
    res.render('user/hp-product-page',{user:true,products,user_login,cartCount})
  })
});
// router.get('/View-single-products/:id',async(req,res)=>{
//   let user_login=req.session.user;
//  // console.log(req.params.id)
//  let cartCount=null
//   if(req.session.user){
//     cartCount=await userHelper.getCartCount(req.session.user._id)
//   }
//   ProductHelper.getProductDetails(req.params.id).then((product)=>{
//     //console.log(product)
//     res.render('user/single-product-details',{product,user:true,user_login,cartCount});
//   })  
// })

// router.get('/View-single-products/:id',async(req,res)=>{
//   let user_login=req.session.user;
//  let cartCount=null
//   if(req.session.user){
//     cartCount=await userHelper.getCartCount(req.session.user._id)
//   }
//    ProductHelper.getProductDetails(req.params.id).then((product)=>{
//     //Here product means deatail of single product
//     //console.log(product.brand)
//     ProductHelper.getRelatedroducts(product.brand).then((relatedproducts)=>{
//       //console.log(relatedproducts);
//       //Here relatedproduct means detail of all related products base on their barnd
//       res.render('user/single-product-details',{relatedproducts,product,user:true,user_login,cartCount});
//     })
//   })  
 
// })



router.get('/View-single-products/:id',async(req,res)=>{
  let user_login=req.session.user;
 let cartCount=null
 reviewedProducts= await userHelper.getReview(req.params.id)
 //console.log(reviewedProducts)
  if(req.session.user){
    cartCount=await userHelper.getCartCount(req.session.user._id)
  }

   ProductHelper.getProductDetails(req.params.id).then((product)=>{
    //Here product means deatail of single product
    //console.log(product.brand)
    ProductHelper.getRelatedroducts(product.brand).then((relatedproducts)=>{
      //console.log(relatedproducts);
      //Here relatedproduct means detail of all related products base on their barnd
      reviewError=req.session.errorMessage
      res.render('user/single-product-details',{relatedproducts,product,user:true,user_login,cartCount, reviewedProducts,reviewError});
      req.session.errorMessage=false;
    })
  })  
 
})



router.get('/login', (req, res) => {
  //console.log(req.session.user)
  if(req.session.user){
    res.redirect('/')
  }else{
    res.render('user/login',{user:true,"logedinErr":req.session.logedinErr, blockuser: req.session.blockuser})
    req.session.logedinErr=false
    req.session.blockuser=false
  } 
})

router.get('/signup', (req, res) => {
  emailExist=req.session.emailExist
  res.render('user/signup',{user:true,emailExist})
  req.session.emailExist=false
})

router.post('/signup',(req,res)=>{
 UserHelper.doSignup(req.body).then((response)=>{
  //console.log(response.emailExist);
   if(response.emailExist){
    req.session.emailExist = "Email is already Exist!!!";
    res.redirect('/signup')
   }else{
   req.session.user=response;
   req.session.logedIn=true;
   res.redirect('/')
   }
 })
})

router.post('/login',(req,res)=>{
  UserHelper.doLogin(req.body).then((response)=>{
    if(response.status){
      /* Here we create an session for single user with its all details */
      req.session.user=response.user;
      req.session.logedIn=true;
      res.redirect('/')
    }else{
      if(response.blockuser){
        req.session.blockuser=response.blockuser
        res.redirect('/login')
      }else{
        req.session.logedinErr=true;
        res.redirect('/login')
      }
      
    }
    
  })
})

router.get('/logout',(req,res)=>{
  req.session.user = null;
  req.session.logedIn = false;
  res.redirect('/');
})

router.get('/cart',verifyLogin,async(req,res)=>{
  let user_login=req.session.user;
  let cartCount=null
  if(req.session.user){
    cartCount=await userHelper.getCartCount(req.session.user._id)
  }
  let product_list=await userHelper.getCartProducts(req.session.user._id)
  let totalAmount=0
 if(product_list.length>0){
     totalAmount=await userHelper.getTotalAmount(req.session.user._id)
 }
 //Add an empty cart page
 if(totalAmount<=0){
  res.redirect('/empty-cart')

 }
    //console.log(product_list)
    res.render('user/cart',{user:true,product_list,user_login,totalAmount,cartCount})
})

// router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{
//   userHelper.addToCart(req.params.id,req.session.user._id).then(()=>{
//     res.redirect('/');
//   });
// })
router.get('/add-to-cart/:id',(req,res)=>{
  //console.log("api call")
   if(req.session.logedIn){
    //console.log(" login sucessfullll")
    userHelper.addToCart(req.params.id,req.session.user._id).then(()=>{
      res.json({status:true})
      });
   }
    // userHelper.addToCart(req.params.id,req.session.user._id).then(()=>{
    // res.json({status:true})
    // });
    else{
      res.json({status:false})
      console.log("please login")
      
    }
  })

router.post('/change-product-quantity',(req,res,next)=>{
  //console.log(req.body);
  userHelper.changeProductQuantity(req.body).then(async(response)=>{
   // console.log(response)
    response.total=await userHelper.getTotalAmount(req.session.user._id)
   /*response.adon="adon" here appending an file with json and res.json makes the data to json format*/
   //console.log(response)
   res.json(response)
  })
})


router.get("/remove-product-from-cart/:id/:productId", (req, res, next) => {
  userHelper.deleteProductFromCart(req.params.id,req.params.productId).then(() => {
    res.redirect('/cart')
  });
});

router.get('/empty-cart',verifyLogin,async(req,res)=>{
  let cartCount=0;
  let user_login=req.session.user;
  res.render('user/empty-cart',{user:true,user_login,cartCount})
})
router.get('/empty-order',verifyLogin,async(req,res)=>{
  let user_login=req.session.user;
  let cartCount=null
  if(req.session.user){
    cartCount=await userHelper.getCartCount(req.session.user._id, cartCount)
  }
  res.render('user/empty-order',{user:true,user_login,cartCount})
})

router.get('/place-order',verifyLogin,async (req,res)=>{
  let user_login=req.session.user;
  address=await userHelper.getUserAddress(req.session.user._id)
  //console.log(address)
  let total=await userHelper.getTotalAmount(req.session.user._id)
  res.render('user/place-order',{user:true,user_login,total,address})
})


router.post('/place-order',async(req,res)=>{
  let products=await userHelper.getCartProductList(req.body.userId);
  let totalPrice=await userHelper.getTotalAmount(req.body.userId);

  //console.log(req.body)
  userHelper.placeOrder(req.body,products,totalPrice).then((orderId)=>{
    if(req.body['payment-method']==='cod'){
      res.json({codstatus:true})
    }else{
      userHelper.generateRazorpay(orderId,totalPrice).then((response)=>{
       //  console.log(response);
        res.json(response)
        
      })
    }
  })
})

router.get('/order-placed-sucessfully',verifyLogin,(req,res)=>{
  let user_login=req.session.user;
  let cartCount=0;
  res.render('user/order-placed-sucessfully',{user:true,user_login,cartCount})
})

router.get('/view-order',verifyLogin,async(req,res)=>{
  let user_login=req.session.user;
  console.log(user_login)
  if(req.session.user){
    cartCount=await userHelper.getCartCount(req.session.user._id)
  }
  let orderDetails=await userHelper.getUserOrders(user_login._id)
  //console.log(orderDetails)
  //Add an empty order page
  if(orderDetails.length<=0){
    res.redirect('/empty-order')
  }
  res.render('user/view-order',{user:true,user_login,orderDetails,cartCount})
})

router.get('/view-order-products/:id',async(req,res)=>{
  //console.log(req.params.id)
  let user_login=req.session.user;
  if(req.session.user){
    cartCount=await userHelper.getCartCount(req.session.user._id)
  }
  orderProductDetails=await userHelper.getOrderproduct(req.params.id);
  //console.log(orderProductDetails);
  res.render('user/view-order-products',{user:true,user_login,orderProductDetails,cartCount})
})

router.post('/verify-payment',(req,res)=>{
  console.log(req.body)
  userHelper.veifyPayment(req.body).then(()=>{
    userHelper.changePaymentstatus(req.body['order[receipt]']).then(()=>{
      res.json({status:true})
    })

  }).catch((err)=>{
    console.log(err);
    res.json({status:false})
  })
})

router.get("/cancel-order/:id", (req, res) => {
  UserHelper.cancelOrder(req.params.id).then(() => {
    res.redirect("/view-order");
  });
});




router.get("/edit-profile",verifyLogin,async(req, res) => {
  user_login=req.session.user
  let cartCount=null
  if(req.session.user){
    cartCount=await userHelper.getCartCount(req.session.user._id)
  }
  userHelper.getProfileDetails(user_login._id).then((profileDetails)=>{
   // console.log(profileDetails)
    res.render("user/edit-profile",{user:true, user_login,profileDetails,cartCount})
  })  
});

router.post('/edit-profile/:id',(req,res)=>{
  // console.log(req.params.id)
  //console.log(req.body);
  userHelper.updateProfileDetails(req.params.id,req.body).then((response)=>{
    //console.log(response);
    
   if(req.files){
    if(req.files.image){
      let image=req.files.image
     image.mv('./public/profile/'+req.params.id+'.jpg');
    } 
   }
    res.redirect('/')
  })
})


router.get("/change-password",verifyLogin, async(req, res) => {
  let cartCount=null
  if(req.session.user){
    cartCount=await userHelper.getCartCount(req.session.user._id)
  }
  user_login=req.session.user
  message= req.session.message
  res.render("user/change-password",{user:true,user_login,cartCount,message})
  req.session.message = false;
})

router.post("/change-password/:id",verifyLogin, (req, res) => {
  //console.log(req.params.id,req.body)
 userHelper.changePassword(req.params.id,req.body).then((response)=>{
   console.log(response);
   if (response.status){
    res.redirect("/edit-profile");
   }else{
    req.session.message= "You have entered a wrong password";
    res.redirect("/change-password");
   }
 })
})


router.post("/review",(req, res) => {
  //console.log(req.params.id,req.body)
  if(req.session.user){
    userHelper.insertReview(req.body.userId,req.body.prodId,req.body).then((response)=>{
      if(response.status){
        //console.log(response);
        var url_prodid = encodeURIComponent(req.body.prodId);
        res.redirect('/View-single-products/'+url_prodid)
      }else{
        //console.log("you nedd to buy this product/Product not deleiverd Yet");
        req.session.errorMessage="you nedd to buy this product/Product not deleiverd Yet"
        var url_prodid = encodeURIComponent(req.body.prodId);
        res.redirect('/View-single-products/'+url_prodid)
      }})
  }else{
    //if user not login
    res.redirect('/login')
  }
})

// router.post("/coupon",verifyLogin,async (req, res) => {
//   let total=await userHelper.getTotalAmount(req.session.user._id)
//   userHelper.checkCoupon(total,req.body).then((response)=>{
    
//     res.json(response)
//     if(response.status){
//       console.log("coupon applied",response.coupontotal)
//     }else{
//       console.log("coupon not applied")
//     }
//   })
// })

module.exports = router;
