var express = require('express');
const productHelper = require('../helpers/product-helper');
var router = express.Router();
var ProductHelper=require('../helpers/product-helper')
const userHelper = require('../helpers/user-helper');
const fs=require('fs')
const verifyLogin = (req, res, next) => {
  if (req.session.adminloggedIn) {
    next();
  } else {
    res.redirect("/admin");
  }
}

/* GET users listing. */
//using promise
// router.get('/', function(req, res, next) {
//   ProductHelper.getALLProducts().then((products)=>{
//     //console.log(products)
//     res.render('admin/view-products',{products})
//   })
// });
/*using callback function*/
// router.get('/', function(req, res, next){
//   ProductHelper.getALLProducts((products)=>{
//       console.log(products);
//       res.render('admin/view-products',{products})
//   })
// })
/**Admin login section  */
router.get("/", async(req, res) => {
  let admin = req.session.adminloggedIn;
  if (admin) {
      let paymentMethod=await productHelper.paymentMethods();
      let orderStatus=await productHelper.OrderStatus.apply();
      let ProductCount=await productHelper.getProductCount();
      let UserCount=await productHelper.getUserCount();
      let profit=await productHelper.getProfit();
      let delivredCount=await productHelper.getDeliveredCount()
      //console.log(profit)
      res.render('admin/dashboard',{admin:true,paymentMethod,orderStatus,ProductCount,UserCount,profit,delivredCount})
 
  } else {
    res.render("admin/adminlogin", { loginErr: req.session.loginErr });
    req.session.loginErr = false;
  }
});

router.post("/", (req, res) => {
  ProductHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.adminloggedIn = true;
      req.session.admin = response.admin;
      res.redirect("/admin");
    } else {
      req.session.loginErr = "Invalid Username or Password!!";
      res.redirect("/admin");
    }
  });
});


router.get("/all-products", verifyLogin,async(req, res) => {
      ProductHelper.getALLProducts().then((products)=>{
      res.render('admin/view-products',{products,admin:true})
    })
 
});

router.get("/adminlogout", (req, res) => {
  req.session.admin=null;
  req.session.adminloggedIn = false;
  res.redirect("/admin");
});
/**Admin login section end here */
router.get('/add-products',verifyLogin,function(req,res){
  res.render('admin/add-products',{admin:true})
})
/*using callback function*/
// router.post('/add-products',function(req,res){
//   //console.log(req.body);
//   //console.log(req.files.img);
//   ProductHelper.addProducts(req.body,(id)=>{
//     let image=req.files.image
//     image.mv('./public/images/'+id+'.jpg',(err,done)=>{
//       if(!err){
//         res.render('admin/add-products')
//       }else{
//         console.log(err);
//       }
//     })
  
//   })  
//   });



/*using promise */
// router.post('/add-products',function(req,res){
//   ProductHelper.addProducts(req.body).then((id)=>{
//     let image=req.files.image
//     image.mv('./public/images/'+id+'.jpg',(err,done)=>{
//       if(!err){
//         res.render('admin/add-products',{admin:true})
//       }else{
//         console.log(err);
//       }
//     })

//   })
// });

router.post('/add-products',function(req,res){
  ProductHelper.addProducts(req.body).then((id)=>{
    let image=req.files.image
    let image2=req.files.image2
    let image3=req.files.image3
    let image4=req.files.image4
    image.mv('./public/images/'+id+'.jpg')
    image2.mv('./public/images/'+id+'second'+'.jpg')
    image3.mv('./public/images/'+id+'third'+'.jpg')
    image4.mv('./public/images/'+id+'fourth'+'.jpg')
    res.redirect('/admin/add-products')
  })
});

// router.get('/delete-products/:id',(req,res)=>{
//   let proId=req.params.id
//   //console.log(proId)
//   productHelper.deleteProducts(proId).then((response)=>{
//     //console.log(response);
//     const pathToFile = './public/images/'+proId+'.jpg'

//      fs.unlink(pathToFile, function (err) {
//        if (err) {
//          throw err;
//        } else {
//          console.log("Successfully deleted the file.");
//        }
//      });
//     res.redirect('/admin/all-products')
//   })
// })

router.get('/delete-products/:id',(req,res)=>{
  let proId=req.params.id
  productHelper.deleteProducts(proId).then((response)=>{

   fs.unlinkSync('./public/images/'+proId+'.jpg')
   fs.unlinkSync('./public/images/'+proId+'second.jpg')
   fs.unlinkSync('./public/images/'+proId+'third.jpg')
   fs.unlinkSync('./public/images/'+proId+'fourth.jpg')
   
    res.redirect('/admin/all-products')
  })
})
// router.get('/edit-products/:id',async(req,res)=>{
//  let product=await ProductHelper.getProductDetails(req.params.id)
//     //console.log(product);
//     res.render('admin/edit-products',{product});
  
// })
router.get('/edit-products/:id',(req,res)=>{
  productHelper.getProductDetails(req.params.id).then((product)=>{
    res.render('admin/edit-products',{product,admin:true});
  })  
})
router.post('/edit-products/:id',(req,res)=>{
  //console.log(req.params.id)
  //console.log(req.body);
  productHelper.updateProduct(req.params.id,req.body).then((response)=>{
    //console.log(response);
    res.redirect('/admin/all-products')
    if(req.files.image){
      let image=req.files.image
     image.mv('./public/images/'+req.params.id+'.jpg');
    }
    if(req.files.image2){
      let image2=req.files.image2
     image2.mv('./public/images/'+req.params.id+'second.jpg');
    }
    if(req.files.image3){
      let image3=req.files.image3
     image3.mv('./public/images/'+req.params.id+'third.jpg');
    }
    if(req.files.image4){
      let image4=req.files.image4
     image4.mv('./public/images/'+req.params.id+'fourth.jpg');
    }
    
    
  })
})


router.get('/users-list',verifyLogin,async(req,res)=>{
  userlist=await productHelper.getALLusers()
  //console.log(userlist)
  res.render('admin/users-list',{userlist,admin:true})
})
router.get('/delete-user/:id',(req,res)=>{
  let userId=req.params.id
  console.log(userId)
  productHelper.deleteUser(userId).then((response)=>{
    const pathToFile = './public/profile/'+userId+'.jpg'
    if (fs.existsSync(pathToFile)) {
    fs.unlink(pathToFile, function (err) {
      if (err) {
        throw err;
      } else {
        console.log("Successfully deleted the file.");
      }
    });
    res.redirect('/admin/users-list')
  }else{
    res.redirect('/admin/users-list')
  }
  })
})

router.get('/block-user/:id',(req,res)=>{
  userId=req.params.id
  productHelper.blockUser(userId).then(()=>{
    res.redirect('/admin/users-list')
  })
})
router.get('/unblock-user/:id',(req,res)=>{
  userId=req.params.id
  productHelper.unblockUser(userId).then(()=>{
    res.redirect('/admin/users-list')
  })
})

router.get('/view-orders',verifyLogin,async(req,res)=>{
  orders=await productHelper.getALLOrders()
  //console.log(orders)
  res.render('admin/view-orders',{orders,admin:true})
})
router.get('/view-order-products/:id',verifyLogin,async(req,res)=>{
  orderProductDetails=await userHelper.getOrderproduct(req.params.id);
  res.render('admin/view-order-products',{admin:true,orderProductDetails})
})

router.post("/changeToShiped", (req, res) => {
  productHelper.changeStatus(req.body.order).then((response) => {
    res.json({ status: true });
  });
});

router.post("/changeToDeliver", (req, res) => {
  productHelper.changeStatusDelivered(req.body.order).then((response) => {
    res.json({ status: true });
  });
});
router.get("/add-coupon",verifyLogin, (req, res) => {
 productHelper.availableCoupons().then((coupons)=>{
  res.render('admin/add-coupon',{admin:true,coupons})
 })
});


router.post("/add-coupon",(req, res) => {
  //console.log(req.body)
  productHelper.insertCoupon(req.body);
  res.redirect("/admin/add-coupon")
});

router.get('/delete-coupon/:id',verifyLogin,(req,res)=>{
  let couponId=req.params.id
  //console.log( couponId)
  productHelper.deleteCoupon(couponId).then((response)=>{
    //console.log(response);
    res.redirect("/admin/add-coupon")
  })
})
router.get('/activate-coupon/:id',verifyLogin,(req,res)=>{
  let couponId=req.params.id
  //console.log( couponId)
  productHelper.activateCoupon(couponId).then((response)=>{
    //console.log(response);
    res.redirect("/admin/add-coupon")
  })
})
router.get('/deactivate-coupon/:id',verifyLogin,(req,res)=>{
  let couponId=req.params.id
  productHelper.deactivateCoupon(couponId).then((response)=>{
    res.redirect("/admin/add-coupon")
  })
})

router.get('/sales-report', verifyLogin,(req, res) => {
  res.render('admin/sales-report', { admin: true })
})
router.post('/sales-report', verifyLogin,async (req, res) => {
  //console.log(req.body);
  sales = await productHelper.getSalesReport(req.body)
  res.render('admin/sales-report', { admin: true, sales })
})

module.exports = router;
