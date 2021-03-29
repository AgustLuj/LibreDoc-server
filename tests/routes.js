app.get("/addBook",(req,res)=>{
    let _id = '600d1dedb5c9e41e34991b58';
    Books.findById({_id},async (err,book)=>{
        let newbook={
            bookId:_id,
        }
        await User.findById({_id:'600d1dedb5c9e41e34991b57'},(err,user)=>{
            user.mybooks.push(newbook);
            user.booksCount +=1;
            book.copies += 1;
            user.save((err,result)=>{
                if(result != null){
                    book.save((err,resultBok)=>{
                        if(resultBok != null){
                            res.status(200).send({result,resultBok});
                        }
                    })
                }
            })
        });
    })
});