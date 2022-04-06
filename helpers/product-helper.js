var db=require('../config/connection');
var collections=require('../config/collection')
var objectId=require('mongodb').ObjectID;
var bcrypt=require('bcrypt')
const moment = require('moment')

module.exports={
   /*Using callback function */
   //  addProducts:(products,callback)=>{
   //     // console.log(products);
   //      db.get().collection(collections.PRODUCT_COLLECTION).insertOne(products).then((data)=>{
   //         //console.log(data);
   //         callback(data.ops[0]._id)
        
   //      })
   //  },
   addProducts:(products)=>{
     return new Promise(async(resolve,reject)=>{
          let data=await db.get().collection(collections.PRODUCT_COLLECTION).insertOne(products);
          resolve(data.ops[0]._id);
     })

   }
   /* get all product using promise*/
    ,getALLProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collections.PRODUCT_COLLECTION).find().toArray()
        
           resolve(products)
        })
   }
   /*get all products using callback function */
   // ,getALLProducts:(callback)=>{
   //    db.get().collection(collections.PRODUCT_COLLECTION).find().toArray().then((data)=>{
   //       callback(data);
   //    })

   // }
   ,deleteProducts:(prodId)=>{
      return new Promise((resolve,reject)=>{
         //console.log(prodId);
         //console.log(objectId(prodId));
         db.get().collection(collections.PRODUCT_COLLECTION).removeOne({_id:objectId(prodId)}).then((response)=>{
            resolve(response);
         })

      })
   //get Single Product Detail
   },
   getProductDetails:(prodId)=>{
      return new Promise(async(resolve,reject)=>{
        await db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:objectId(prodId)}).then((product)=>{
            resolve(product)
         })
      })
   },
   updateProduct:(prodId,productDetail)=>{
      return new Promise(async(resolve,reject)=>{
        // console.log(prodId);
        // console.log(product);
          await db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id:objectId(prodId)},{
            $set:{
               name:productDetail.name,
               brand:productDetail.brand,
               description:productDetail.description,
               price:productDetail.price,
               processor:productDetail.processor,
               memory:productDetail.memory,
               storage:productDetail.storage,
               display:productDetail.display,
               graphics:productDetail.graphics,
               battery:productDetail.battery,
               operating_system:productDetail.operating_system  
            }
         }).then((response)=>{
            resolve(response)
         })
      })

   },
getALLAsusProducts:()=>{
      return new Promise(async(resolve,reject)=>{
          let products=await db.get().collection(collections.PRODUCT_COLLECTION).find({brand:"Asus"}).toArray()
      
         resolve(products)
      })
 },
 getALLAcerProducts:()=>{
   return new Promise(async(resolve,reject)=>{
       let products=await db.get().collection(collections.PRODUCT_COLLECTION).find({brand:"Acer"}).toArray()
   
      resolve(products)
   })
}
,getALLHpProducts:()=>{
   return new Promise(async(resolve,reject)=>{
       let products=await db.get().collection(collections.PRODUCT_COLLECTION).find({brand:"Hp"}).toArray()
   
      resolve(products)
   })
}
,getALLDellProducts:()=>{
   return new Promise(async(resolve,reject)=>{
       let products=await db.get().collection(collections.PRODUCT_COLLECTION).find({brand:"Dell"}).toArray()
   
      resolve(products)
   })
}
,getRandomProducts:()=>{
   return new Promise(async(resolve,reject)=>{
       let products= await db.get().collection(collections.PRODUCT_COLLECTION).aggregate([{ $sample :{size :8}}]).toArray()
       //console.log(products)
       resolve(products)
   })
}
,getRelatedroducts:(brand)=>{
   return new Promise(async(resolve,reject)=>{
      let relatedproducts= await db.get().collection(collections.PRODUCT_COLLECTION).aggregate([{$match: {brand:brand}},{ $sample :{size :4}}]).toArray()
      //console.log(relatedproducts)
      resolve(relatedproducts)
  })
}

,getALLusers:()=>{
   return new Promise(async(resolve,reject)=>{
       let usersList=await db.get().collection(collections.USER_COLLECTION).find().toArray()
        resolve(usersList)
   })
}
,deleteUser:(userId)=>{
   return new Promise((resolve,reject)=>{
      db.get().collection(collections.USER_COLLECTION).removeOne({_id:objectId(userId)}).then((response)=>{
         resolve(response);
      })

   })
}
,doLogin:(data)=>{
   return new Promise(async(resolve,reject)=>{
       let response={}
       let admin = {}
       admin.email = "abcd@gmail.com"
       admin.password = "$2a$10$0GacidLXw.NVGMi7EA8zb.A3MCyYIsuPgn6Ar.sXDjX6zpJIrkfeG"
      if(admin.email===data.email){ 
       bcrypt.compare(data.password,admin.password).then((status)=>{
               if(status){
               response.admin=admin
               response.status=true
               resolve(response)
           }else{
               resolve({status:false})
           }
           })}else{
            resolve({status:false})
           }
   })

} 
,getALLOrders:()=>{
   return new Promise(async(resolve,reject)=>{
       let orders=await db.get().collection(collections.ORDER_COLLECTION).find().toArray()
   
      resolve(orders)
   })
},
changeStatus:(orderId)=>{
   return new Promise((resolve,reject)=>{
       db.get().collection(collections.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},
       {
           $set:{
               status:'Shipped',
               shipped:true//For controling the order status option
           }
       }).then(()=>{
           resolve({status:true})
       })
   })
},
changeStatusDelivered:(orderId)=>{
   return new Promise((resolve,reject)=>{
       db.get().collection(collections.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},
       {
           $set:{
               status:'Delivered',
               delivered:true
           }
       }).then(()=>{
           resolve({status:true})
       })
   })
},
insertCoupon:(coupons)=>{
   return new Promise((resolve,reject)=>{
      coupons.offer=parseInt(coupons.offer)
      db.get().collection(collections.COUPON_COLLECTION).insertOne(coupons);
   })
}
,availableCoupons:()=>{
   return new Promise((resolve,reject)=>{
       db.get().collection(collections.COUPON_COLLECTION).find().toArray().then((data)=>{
           resolve(data)
       })
   })
},

deleteCoupon:(couponId)=>{
   return new Promise((resolve,reject)=>{
      //console.log(couponId);
      //console.log(objectId(couponId));
      db.get().collection(collections.COUPON_COLLECTION).removeOne({_id:objectId(couponId)}).then((response)=>{
         resolve(response);
      })

   })
},
activateCoupon:(couponId)=>{
   return new Promise((resolve,reject)=>{
       db.get().collection(collections.COUPON_COLLECTION).updateOne({_id:objectId(couponId)},
       {$set:{
           status:true
       }}).then(()=>{
           resolve()
       })
   })
},
deactivateCoupon:(couponId)=>{
   return new Promise((resolve,reject)=>{
       db.get().collection(collections.COUPON_COLLECTION).updateOne({_id:objectId(couponId)},
       {$set:{
           status:false
       }}).then(()=>{
           resolve()
       })
   })
},

blockUser:(userId)=>{
   return new Promise((resolve,reject)=>{
       db.get().collection(collections.USER_COLLECTION).updateOne({_id:objectId(userId)},
       {$set:{
         blockuser:true
       }}).then((response)=>{
           resolve()
       })
   })
},
unblockUser:(userId)=>{
   return new Promise((resolve,reject)=>{
       db.get().collection(collections.USER_COLLECTION).updateOne({_id:objectId(userId)},
       {$set:{
        blockuser:false
       }}).then((response)=>{  
           resolve()
       })
   })
},
paymentMethods: () => {
   let Methods = []
   return new Promise(async (resolve, reject) => {
       let CodProduct = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
           {
               $match: {
                  paymentMethod: 'cod'
               }
           }
       ]).toArray()
       let codlen = CodProduct.length
       Methods.push(codlen)

       let onlineProduct = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
           {
               $match: {
                  paymentMethod: 'online'
               }
           }
       ]).toArray()
       let onlinelen = onlineProduct.length
       Methods.push(onlinelen)

       resolve(Methods)
   })
},
OrderStatus: () => {
   let status = []
   return new Promise(async (resolve, reject) => {
       let pending = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
           {
               $match: {
                  status: 'pending'
               }
           }
       ]).toArray()
       let pendinglen = pending.length
       status.push(pendinglen)
       let placed = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
           {
               $match: {
                  status: 'placed'
               }
           }
       ]).toArray()
       let placedlen = placed.length
       status.push(placedlen)

       let shipped = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
           {
               $match: {
                  status: 'Shipped'
               }
           }
       ]).toArray()
       let shippedlen = shipped.length
       status.push(shippedlen)


       let delivered = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
           {
               $match: {
                  status: 'Delivered'
               }
           }
       ]).toArray()
       let deliveredlen = delivered.length
       status.push(deliveredlen)

       let cancelled = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
           {
               $match: {
                  status: 'cancelled'
               }
           }
       ]).toArray()
       let cancelledlen = cancelled.length
       status.push(cancelledlen)
       resolve(status)
   })
},
getProductCount: () => {
   return new Promise(async (resolve, reject) => {
       let productcount = await db.get().collection(collections.PRODUCT_COLLECTION).count()
       resolve(productcount)
   })
},
getUserCount: () => {
   return new Promise(async (resolve, reject) => {
       let usercount = await db.get().collection(collections.USER_COLLECTION).count()
       resolve(usercount)
   })
},
getProfit: () => {
   return new Promise(async (resolve, reject) => {
       let newtotal=0
       let total = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
           {
               $match: {
                   status: 'Delivered'
               }
           },
           {
               $group: {
                   _id: null,
                   total: { $sum: '$totalAmount' }
               }
           }
       ]).toArray()
       if(total[0]){
          // console.log(total)
           resolve(total[0].total)             
       }else{
           resolve(newtotal)
       }            
   })
},
getDeliveredCount: () => {
   return new Promise(async (resolve, reject) => {
      let delivered = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
         {
             $match: {
                status: 'Delivered'
             }
         }
     ]).toArray()
     let deliveredCount = delivered.length
       resolve( deliveredCount)
   })
},
getSalesReport:(data)=>{
    let StartDate=moment(data.StartDate).format('DD/MM/YYYY')
    let EndDate=moment(data.EndDate).format('DD/MM/YYYY')
    return new Promise(async(resolve,reject)=>{
       SaleData=await db.get().collection(collections.ORDER_COLLECTION).find({date:{$gte:StartDate,$lte:EndDate}}).toArray()
       resolve(SaleData)
    })
},
}

