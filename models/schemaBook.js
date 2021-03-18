const mongoose = require("mongoose");
//const {link} = require('../Config/config.js');
const link ='mongodb+srv://AgustLuj:URnr69kaGtUrKbxF@cluster0.fkmai.mongodb.net/LibreDoc'
const Schema=mongoose.Schema;
mongoose.set('useFindAndModify', false);
mongoose.connect(link,{ useNewUrlParser: true,useUnifiedTopology: true });
const mybooks = new Schema({
    bookId:{type:String},
    start:{type:Boolean,default:false},
    finish:{type:Boolean,default:false},
    currentPage:{type:Number,default:0},
    maxpages:{type:Number,default:0},
    favorite:{type:Boolean,default:false},
    biblio:{type:Boolean,default:false},
    disable:{type:Boolean,default:false},
    stars:{type:Number,default:0},
    vote:{type:Boolean,default:false},
});
const userSchema = new Schema({
    username:{type:String,maxlength:[50,"Username muy grande"]},
    pass:{type:String,maxlength:[50,"Username muy grande"]},
    booksCount:{type:Number,default:0},
    path:{type:String},
    mybooks:[mybooks],
});
const User = mongoose.model("Users",userSchema);
const Books_schema = new Schema({
	name:{type:String,maxlength:[50,"Username muy grande"]},
    author:{type:String,maxlength:[50,"Username muy grande"]},
    path:{type:String},
    imgName:{type:String},
    cost:{type:Number,default:0},
    copies:{type:Number,default:0},
    finish:{type:Number,default:0},
    pages:{type:Number,default:0},
    description:{type:String}
});
const Books = mongoose.model("Books",Books_schema);
const booksAuthor_schema=new Schema({
    id:{type:String,maxlength:[50,"Username muy grande"]},
    bookName:{type:String,maxlength:[50,"Username muy grande"]}
})
const author_schema = new Schema({
    name:{type:String,maxlength:[50,"Username muy grande"]},
    lastname:{type:String,maxlength:[50,"Username muy grande"]},
    books:{booksAuthor_schema},
})
const Author = mongoose.model("Author",author_schema);

module.exports = {
    User,
    Books,
    Author,
}