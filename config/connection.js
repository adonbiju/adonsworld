const MongoClient=require('mongodb').MongoClient;
const state={
    db:null,
}
module.exports.connect=function(done){
    
    // const url = "mongodb://localhost:27017";
    // const dbname='shopingcart6'
    const url=process.env.mongoDBurl;
    const dbname='shopingcart'

    MongoClient.connect(url, {useUnifiedTopology: true } ,function(err, data) {
        if (err) return done(err);
        state.db=data.db(dbname)
        done()
      },);
     
}
module.exports.get=function(){
    return state.db
}
