//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://poojakhatri8336:Psspl12345!@cluster0.gqhza.mongodb.net/todolistDB');

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model('Item', itemSchema);


const item1 = new Item({
  name: "House Clean"
});

const item2 = new Item({
  name: "Shopping"
});

const item3 = new Item({
  name: "Booking "
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List",listSchema);


app.get("/", function(req, res) {
  Item.find(function(err, items) {
    if (items.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log("err");
        } else {
          console.log("saved all items successfully");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: items
      });
    }
  });

});

app.get("/:customListName",function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name : customListName},function(err,foundList){
    if (err) {
      console.log("err");
    } else {
      if(!foundList){
        const list = new List(
          {
            name : customListName,
            items: defaultItems
          });
          list.save(function(err,result){
          res.redirect("/" + customListName);
          });
      }
      else{
        res.render("list",{ listTitle: foundList.name , newListItems : foundList.items});
      }
    }
  });
});


app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }



});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName == "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (err) {
        console.log("err")
      } else {
        console.log("item deleted successfully");
        res.redirect("/");

      }
    });
  }
  else{
    List.findOneAndUpdate({ name : listName},{$pull : {items : {_id: checkedItemId}}},function(err, foundList){
      if(!err)
        {res.redirect("/" + listName);}

    })

  }
});



app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully!!");
});
