var db = require("../config/connection");
var collections = require("../config/collection");
var bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectID;
//const { response } = require('express');
const Razorpay = require("razorpay");
const { resolve } = require("url");
const moment = require('moment')

var instance = new Razorpay({
  key_id: "rzp_test_6igfyhlL3sx93x",
  key_secret: "cG0Cvs8WzPUPtmDUPMBFkNvs",
});
module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      let emailExist = await db.get().collection(collections.USER_COLLECTION).findOne({ email: userData.email })
      if(emailExist){
        resolve({emailExist})
      }else{
      userData.password = await bcrypt.hash(userData.password, 10);
      userData.blockuser=false
      db.get().collection(collections.USER_COLLECTION).insertOne(userData).then((data) => {
          resolve(data.ops[0]);
        });
    }
    });
  },


  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let user = await db.get().collection(collections.USER_COLLECTION).findOne({ email: userData.email });
      if (user) {
        bcrypt.compare(userData.password, user.password).then((status) => {
          if (status) {
            if (user.blockuser){
              response.blockuser=true
              resolve(response)
            }else{
              console.log("login successful");
              response.user = user;
              response.status = true;
              resolve(response);
            }
           
            //console.log(response);
          } else {
            console.log("login Failed");
            resolve({status:false});
          }
        });
      } else {
        console.log("login Failed/user blocked");
        resolve({status:false});
      }
    });
  },

  addToCart: (prodid, userid) => {
    let proObj = {
      item: objectId(prodid),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userid) });
      if (userCart) {
        let prodExit = userCart.products.findIndex((products) => products.item == prodid);
        //console.log(prodExit)
        if (prodExit != -1) {
          db.get().collection(collections.CART_COLLECTION).updateOne({ user: objectId(userid), "products.item": objectId(prodid) },
              {
                $inc: { "products.$.quantity": 1 },
              }
            ).then(() => {
              resolve();
            });
        } else {
          db.get().collection(collections.CART_COLLECTION).updateOne({ user: objectId(userid) },
              {
                $push: { products: proObj },
              }
            ).then((response) => {
              resolve();
            });
        }
      } else {
        let cartObj = {
          user: objectId(userid),
          products: [proObj],
        };
        db.get().collection(collections.CART_COLLECTION).insertOne(cartObj).then((response) => {
            resolve();
          });
      }
    });
  },
  getCartProducts: (userId) => {
    return new Promise(async (resolve) => {
      // console.log(userId)
      let cartItems = await db.get().collection(collections.CART_COLLECTION).aggregate([{ $match: { user: objectId(userId) } },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              productDetails: { $arrayElemAt: ["$productDetails", 0] },
            },
          },
          // {
          //     $lookup:{
          //         from:collections.PRODUCT_COLLECTION,
          //         let:{productList:'$products'},
          //         pipeline:[{
          //             $match:{$expr:{$in:['$_id','$$productList']}}
          //         }],
          //         as:'productDetails'
          //     }
          // }
        ]) .toArray();
      // console.log(cartItems)
      resolve(cartItems);
    });
  },
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      cart = await db.get() .collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) });
      if (cart) {
        count = cart.products.length;
      }
      resolve(count);
    });
  },
  changeProductQuantity: (details) => {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);
    return new Promise((resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        db.get().collection(collections.CART_COLLECTION).updateOne({ _id: objectId(details.cart) },
            {
              $pull: { products: { item: objectId(details.product) } },
            }
          ).then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        db.get().collection(collections.CART_COLLECTION).updateOne(
            {
              _id: objectId(details.cart),
              "products.item": objectId(details.product),
            },
            {
              $inc: { "products.$.quantity": details.count },
            }
          ).then((response) => {
            resolve({ status: true });
          });
      }
    });
  },
  deleteProductFromCart: (cart, product) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collections.CART_COLLECTION).updateOne({ _id: objectId(cart) },
          {
            $pull: {
              products: { item: objectId(product) },
            },
          }
        ).then((response) => {
          resolve();
        });
    });
  },
  getTotalAmount: (userId) => {
    return new Promise(async (resolve) => {
      // console.log(userId)
      let total = await db.get().collection(collections.CART_COLLECTION).aggregate([{ $match: { user: objectId(userId) } },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              productDetails: { $arrayElemAt: ["$productDetails", 0] },
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: {
                  $multiply: ["$quantity", { $toInt: "$productDetails.price" }],
                },
              },
            },
          },
        ]).toArray();
        if(total.length>0){   
          if(total[0].total) {
              resolve(total[0].total) 
          }
          
      }else{
          resolve({total:false})
      }
      //console.log(total)
    });
  },
  placeOrder: (order, products, total) => {
    return new Promise((resolve, reject) => {
      // console.log(order,products,total);
      let status = order["payment-method"] === "cod" ? "placed" : "pending";
      let orderObj = {
        deliveryDetails: {
          name: order.name,
          mobile1: order.mobile1,
          mobile2: order.mobile2,
          email: order.email,
          pincode: order.pincode,
          house_name: order.house_name,
          area: order.area,
          city: order.city,
          state: order.state,
          country: order.country,
          save:order.save
        },
        userId: objectId(order.userId),
        paymentMethod: order["payment-method"],
        products: products,
        totalAmount: total,
        status: status,
        date: moment(new Date()).format('DD/MM/YYYY'),
      };
      db.get().collection(collections.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
         let address={}
         address.useraddress=orderObj.deliveryDetails
         address.userId=orderObj.userId
         if(address.useraddress.save=="on"){
          db.get().collection(collections.ADDRESS_COLLECTION).insertOne(address)
         }
          console.log(orderObj.deliveryDetails.save)
          db.get().collection(collections.CART_COLLECTION).removeOne({ user: objectId(order.userId) });
          resolve(response.ops[0]._id);
        });
    });
  },
  //geting cart db of single user
  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      //console.log(userId)
      let cart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) });
      resolve(cart.products);
    });
  },
  //get  the orders from oder db based on userId
  getUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      // console.log(userId)
      await db.get().collection(collections.ORDER_COLLECTION).find({ userId: objectId(userId) }).toArray().then((response) => {
          //console.log(response)
          resolve(response);
        });
    });
  },
  //get product detail based on singele order id
  getOrderproduct: (orderId) => {
    return new Promise(async (resolve) => {
      // console.log(orderId)
      let OrderProductItems = await db.get().collection(collections.ORDER_COLLECTION).aggregate([{ $match: { _id: objectId(orderId) } },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              productDetails: { $arrayElemAt: ["$productDetails", 0] },
            },
          },
        ]).toArray();
      //console.log(OrderProductItems)
      resolve(OrderProductItems);
    });
  },
  generateRazorpay: (orderId, total) => {
    //console.log(total)
    return new Promise((resolve, reject) => {
      //console.log(orderId)
      //console.log(totalMoney)
      var options = {
        amount: total * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err);
        } else {
         // console.log("New order", order);
          resolve(order);
        }
      });
    });
  },
  veifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", "cG0Cvs8WzPUPtmDUPMBFkNvs");
      hmac.update(details["payment[razorpay_order_id]"] + "|" +details["payment[razorpay_payment_id]"]);
      hmac = hmac.digest("hex");
      if (hmac === details["payment[razorpay_signature]"]) {
        console.log("payment sucessfullll!");
        resolve();
      } else {
        reject();
      }
    });
  },
  changePaymentstatus: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
          {
            $set: {
              status: "placed",
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  cancelOrder: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
          {
            $set: {
              status: "cancelled",
              cancel: true,
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },

  getProfileDetails: (userId) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collections.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((profileDetails) => {
          resolve(profileDetails);
        });
    });
  },
  updateProfileDetails: (userId, profiletDetail) => {
    return new Promise(async (resolve, reject) => {
      // console.log(userId);
      // console.log(profiletDetail);
      await db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) },
          {
            $set: {
              name: profiletDetail.name,
              email: profiletDetail.email,
              mobile1: profiletDetail.mobile1,
              mobile2: profiletDetail.mobile2,
              city: profiletDetail.city,
              state: profiletDetail.state,
              pincode: profiletDetail.pincode,
              country: profiletDetail.country,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
  changePassword: (userId, password) => {
    let oldpassword = password.oldpassword;
    let newPassword = password.newpassword;
    return new Promise(async (resolve, reject) => {
      let user = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: objectId(userId) });
      bcrypt.compare(oldpassword, user.password).then(async (status) => {
        if (status) {
          updatedpassword = await bcrypt.hash(newPassword, 10);
          db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) },
              {
                $set: {
                  password: updatedpassword,
                },
              }
            );
          resolve({ status: true });
        } else {
          resolve({ status: false });
        }
      });
    });
  },

  insertReview: (userId, prodId,Productreview) => {
    return new Promise(async (resolve, reject) => {
      //console.log(userId)
      var review = {
        user: userId,
        username:Productreview.username,
        productId: prodId,
        review:Productreview.review,
        date: moment(new Date()).format('DD/MM/YYYY')
      };
      user = await db.get().collection(collections.ORDER_COLLECTION).find({ userId: objectId(userId) }).toArray();
      //console.log(user)
      if (user) {
        let productIds = [];

        for (var i = 0; i < user.length; i++) {
          //console.log(user[i].status)
          if((user[i].status).toString()=="Delivered"){
          for (var j = 0; j < user[i].products.length; j++) {
            // console.log(user[i].products[j])
            //here we got all the product id of particular user
            //console.log(user[i].products[j].item)
            productIds.push(user[i].products[j].item);
          }
        }
          //console.log(response[i])
        }
        //check whether the product is matching
        var productExist = productIds.toString().includes(prodId.toString());
        if (productExist) {
          db.get().collection(collections.REVIEW_COLLECTION).insertOne(review);
          resolve({status:true})
        }else{
            resolve({status:false})
        }

      }else{
        resolve({status:false})
      }

      //resolve(user);
    });
  },
  getReview: (prodId) => {
    return new Promise(async (resolve, reject) => {
      review=await db.get().collection(collections.REVIEW_COLLECTION).find({ productId: prodId }).toArray();
     resolve(review);
      
    });
  },


//   checkCoupon:(total,coupon)=>{
//     return new Promise(async(resolve,reject)=>{
//      let couponDetail = await db.get().collection(collections.COUPON_COLLECTION).findOne({'couponcode':coupon.couponcode})
//      if( couponDetail ){
//          if(couponDetail.status){
//              let Coupontotal= parseInt((1-(couponDetail.offer/100))*total)
//              resolve({status:true,coupontotal:Coupontotal})
//          }else{
//              resolve({expired:true})
//          }
//      }else{
//          resolve({notexist:true})
//      }
//     })
// },


getUserAddress: (userId) => {
  return new Promise(async (resolve, reject) => {
      let userAddress = await db.get().collection(collections.ADDRESS_COLLECTION).find({ userId: objectId(userId) }).toArray()
      resolve(userAddress)
  })
},



}
