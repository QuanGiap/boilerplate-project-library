/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
const {BookModel} =require('../mongooseModel')
module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res){
      //response will be array of book objects
      const books = await BookModel.aggregate([
        {
          $project: {
            _id:1,
            title: 1,
            commentcount: { $size: "$comments" }
          }
        }
      ]).exec();
      return res.send(books);
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post(async function (req, res){
      let title = req.body.title;
      if(!title){
        return res.send('missing required field title');
      }
      const checkBookCount = await BookModel.countDocuments({title});
      if(checkBookCount>0){
        return res.send('This book already exist');
      }
      const newBook = await BookModel.create({title,comments:[]})
      //response will contain new book object including atleast _id and title
      return res.json(newBook);
    })
    
    .delete(async function(req, res){
      //if successful response will be 'complete delete successful'
      await BookModel.deleteMany({});
      return res.send('complete delete successful')
    });



  app.route('/api/books/:id')
    .get(async function (req, res){
      let bookid = req.params.id;
      const book = await BookModel.findById(bookid);
      if(!book) return res.send('no book exists');
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      return res.json(book);
    })
    
    .post(async function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      if(!comment){
        return res.send('missing required field comment');
      }
      const book = await BookModel.findByIdAndUpdate(bookid,
        { $push: { comments: comment } }
      )
      if(!book){
        return res.send('no book exists');
      }
      //json res format same as .get
      book.comments.push(comment);
      return res.json(book);
    })
    
    .delete(async function(req, res){
      let bookid = req.params.id;
      const book = await BookModel.findByIdAndDelete(bookid)
      if(!book){
        return res.send('no book exists');
      }
      return res.send('delete successful')
    });
  
};
