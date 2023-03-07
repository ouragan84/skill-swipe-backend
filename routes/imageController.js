


const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');

const imageService = require('../services/imageService');

const imageController = express();
imageController.use(bodyParser.json());

// const storage = multer.diskStorage({
//   destination(req, file, callback) {
//     callback(null, './images');
//   },
//   filename(req, file, callback) {
//     callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
//   },
// });

// const upload = multer({ storage });

imageController.get('/api/posts/:id', async (req, res) => {
  const posts = await imageService.getPosts(req.params.id);

  if(posts)
        return res.send(posts);
  return res.status(404).json({'message':'log not found'})

});

imageController.post('/api/upload/:id', upload.single('avatar'), async (req,res)=>{

  imageService.handleUpload(req, res, req.params.id);
    // if(result)
    //   return res.send(result);
    // return res.status(404).json({'message':'log not found'})  
  });

  imageController.delete('/api/posts/:id/:index', async (req,res)=>{

    imageService.deletePost(req, res, req.params.id, req.params.index);
      // if(result)
      //   return res.send(result);
      // return res.status(404).json({'message':'log not found'})  
    });


module.exports = imageController;