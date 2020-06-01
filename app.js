//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-nate:test123@cluster0-2opt7.mongodb.net/todolistDB?retryWrites=true&w=2/todolistDB", {
// mongoose.connect('mongodb://localhost:27017/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to Your List!"
});

const item2 = new Item({
  name: "Add things with the + button"
});

const item3 = new Item({
  name: "make a new list with in address bar /newList"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get('/favicon.ico', (req, res) => res.status(204));

app.get("/", function(req, res) {


  Item.find(function(err, items) {
    if (items.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log(defaultItems);
        }
        res.redirect('/');
      });
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: items
      });
    }
  });
});

app.get("/:listName", function(req, res) {
  const listName = _.capitalize(req.params.listName);

  List.findOne({
    name: listName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        //create new list
        const list = new List({
          name: listName,
          items: defaultItems
        });

        list.save();
        res.redirect('/' + listName);
      } else {
        //show existing list
        res.render('list', {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    } else {

    }
  })


});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName == "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }


});

app.post('/delete', function(req, res) {

  const checkboxItemId = req.body.checkbox;
  const listName = req.body.listName;

  console.log(listName);
  if (listName == "Today") {
    Item.findByIdAndRemove(checkboxItemId, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("successfully deleted " + checkboxItemId);
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkboxItemId
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }





  // Item.deleteOne({_id: req.body.checkbox}, function(err){
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     res.redirect("/");
  //   }
  // });

});




app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
