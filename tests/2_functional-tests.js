/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { BookModel } = require('../mongooseModel');
const {ObjectId} = require('mongodb')
chai.use(chaiHttp);

suite('Functional Tests', function() {
  // const IDDelete = [];
  suite('Routing tests', function() {
    suite('POST /api/books with title => create book object/expect book object', function() {
      test('Test POST /api/books with title', function(done) {
        const title = 'Test create book title'
        chai.request(server).keepOpen().post('/api/books').send({
          title,
        }).end((err,res)=>{
          assert.equal(title,res.body.title);
          BookModel.findByIdAndDelete(res.body._id).then(()=>done());
        })
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server).keepOpen().post('/api/books').send({}).end((err,res)=>{
          assert.equal('missing required field title',res.text);
          done();
        })
      });
      
    });

//  /*
//   * ----[EXAMPLE TEST]----
//   * Each test should completely test the response of the API end-point including response status code!
//   */
//  test('#example Test GET /api/books', function(done){
//   chai.request(server)
//    .get('/api/books')
//    .end(function(err, res){
//      assert.equal(res.status, 200);
//      assert.isArray(res.body, 'response should be an array');
//      assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
//      assert.property(res.body[0], 'title', 'Books in array should contain title');
//      assert.property(res.body[0], '_id', 'Books in array should contain _id');
//      done();
//    });
// });
// /*
// * ----[END of EXAMPLE TEST]----
// */
    suite('GET /api/books => array of books', function(){
      test('Test GET /api/books',  function(done){
        chai.request(server).get('/api/books').end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body, 'response should be an array');
          assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
          assert.property(res.body[0], 'title', 'Books in array should contain title');
          assert.property(res.body[0], '_id', 'Books in array should contain _id');
          done();
        });
      });      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      test('Test GET /api/books/[id] with id not in db',  function(done){
        const id = new ObjectId()
        chai.request(server).get('/api/books/'+id).end(function(err, res){
          // console.log(res);
          assert.equal(res.text,'no book exists');
          done()
        });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        const title = 'Test get title';
        BookModel.create({title}).then(book=>{
          chai.request(server).get('/api/books/'+book._id).end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.body.title, title);
            assert.isArray(res.body.comments, 'Comments should be an array');
            assert.property(res.body, '_id', 'Book should contain _id');
            BookModel.findByIdAndDelete(book._id).then(()=>done());
          });
        });
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        const title = 'Test post comment';
        const comment = 'Test comment';
        BookModel.create({title}).then(book=>{
          chai.request(server).post('/api/books/'+book._id).send({comment}).end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.body.title, title);
            assert.isArray(res.body.comments, 'Comments should be an array');
            assert.lengthOf(res.body.comments,1);
            assert.property(res.body, '_id', 'Book should contain _id');
            assert.equal(res.body.comments[0], comment);
            BookModel.findByIdAndDelete(book._id).then(()=>done());
          });
        });
      });

      test('Test POST /api/books/[id] without comment field', function(done){
        const title = 'Test post comment';
        BookModel.create({title}).then(book=>{
          chai.request(server).post('/api/books/'+book._id).send({}).end(function(err, res){
            assert.equal(res.text, 'missing required field comment');
            BookModel.findByIdAndDelete(book._id).then(()=>done());
          });
        });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        const comment = 'Test comment';
        const book = {
          _id:new ObjectId(),
        }
        chai.request(server).post('/api/books/'+book._id).send({comment}).end(function(err, res){
          assert.equal(res.text, 'no book exists');
          done();
        });
      });
      
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        const title = 'Test post comment';
        BookModel.create({title}).then(book=>{
          chai.request(server).delete('/api/books/'+book._id).end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'delete successful');
            done();
          });
        });
      });

      test('Test DELETE /api/books/[id] with  id not in db', function(done){
        const id = new ObjectId();
        chai.request(server).delete('/api/books/'+id).end(function(err, res){
          assert.equal(res.text, 'no book exists');
          done();
        });
      });

    });

  });

});
