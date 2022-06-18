const express =require("express");
const bodyparser =require("body-parser");
const _=require("lodash");
const mongoose=require("mongoose");
const app = express();
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');
//database connection with mongoose
mongoose.connect("mongodb+srv://vipulwakode:test123@cluster0.c1tjtia.mongodb.net/todolistDB",{useNewUrlParser: true});
//creation of schema
const itemSchema={
    name:String
}
//creation of model
const Item=mongoose.model("Item",itemSchema);
const item1 = new Item({
    name:"Welcome to your todolist"
})
const item2 = new Item({
    name:"Hit the + button to add new item"
})
const item3 = new Item({
    name:"Hit the checkbox to delete item"
})
const defaultitems=[item1,item2,item3];

const listSchema={
    name:String,
    items:[itemSchema]
}
const List =mongoose.model("List",listSchema);
app.get("/",function(req,res){
 Item.find({},function(err,founditem){
    if(founditem.length==0){
     Item.insertMany(defaultitems,function(err){
         if(err){
         console.log(err);
         }else{
            console.log("insertion succesful")
            res.redirect("/");
          }
       });
    }
    else{
        res.render("list",{listTitle:"Today",newListitem:founditem});
    }
    
 })
});

app.post("/",function(req,res){
      let itemName =req.body.newItem;
      let listName=req.body.list;
      const item = new Item({
        name:itemName
      });
     if(listName === "Today"){
         item.save();
        res.redirect("/")
     }
     else{
           List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
           });
     }
 })
 app.get("/:Customlistname",function(req,res){
     const Customlistname = _.capitalize(req.params.Customlistname);
     List.findOne({name:Customlistname},function(err,foundList){
        if(!err){
            if(!foundList){
                 const list = new List({
                 name:Customlistname,
                 items:defaultitems
                 });
                  list.save();
                  res.redirect("/"+Customlistname);
             }
            else{
                 res.render("list",{listTitle:foundList.name,newListitem:foundList.items});
            }
        }
     });
     
 })
 
app.get("/about",function(req,res){
    res.render("about");
})
app.post("/delete",function(req,res){
    const checkItemId =req.body.checkbox;
    const listName=req.body.listName;
    if(listName==="Today")
    {
        Item.deleteOne({_id:checkItemId},function(err){
        if(err){
            console.log(err);
        }else{
            console.log("item deleted succesfully");
             res.redirect("/");
        }
      }) 
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkItemId}}},function(err,foundList){
            if(!err){
                res.redirect("/"+listName);
            }
        });
    }
   
});
app.listen(process.env.PORT || 3000,function(){
    console.log("Server is running on port 3000");
})