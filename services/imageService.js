const mongoose = require('mongoose');


const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")
//const { uploadFile, deleteFile, getObjectSignedUrl } = require('./s3.js');
const sharp = require('sharp')
const crypto = require('crypto')


const Images = require('../models/images');


const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

require('dotenv').config()

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY


const s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  })

const handleUpload = async (req, res, uid) => {
  
  formData =await req.body;
  var userJSON =await JSON.parse(formData.image);

    const imageName = generateFileName()

    const avatar =await Buffer.from(userJSON.avatar.replace(/^data:image\/\w+;base64,/, ""), 'base64');


    const fileBuffer = await sharp(avatar)
    .resize({ height: 1920, width: 1080, fit: "contain" })
    .toBuffer()

    //const user= new Users(userJSON)
      try{ 
          //await user.save()
          // console.log(userJSON.imageName)
          console.log(avatar)
          const uploadParams = {
                Bucket: bucketName,
                //Key: userJSON.imageName,
                Key: imageName,
                Body: fileBuffer,
                ContentEncoding: 'base64', // important to tell that the incoming buffer is base64
                ContentType: "image/png", // e.g. "image/jpeg" or "image/png"
          }
        
          await s3Client.send(new PutObjectCommand(uploadParams))

          const post ={
              'name': imageName,
          }

          let user = await Images.findOne({"uid": uid})

          if(user)
          {
            console.log('user exists with uid: ', uid)
            
          }
          else
          {         
             console.log('need to create user with uid: ', uid) 
          }

          user.images.push(post);
          user.save();
          
          //res.status(201).send(post)
          console.log("created post record " + post);

          return res.status(201).json({'message':'Registeration Successfull'})
      }
      catch(e){
        console.log(e)
        return res.status(400).json({'response':'registeration failed'})
         
      }
}

const getPosts = async (uid) => {
  let user = await Images.findOne({"uid": uid})
  for (let image of user.images) {
    //post.imageUrl = await getObjectSignedUrl(post.imageName)
      const params = {
        Bucket: bucketName,
        Key: image.name
      }

      const command = new GetObjectCommand(params);
      const seconds = 60
      image.url = await getSignedUrl(s3Client, command, { expiresIn: seconds });
  }
  return user
}

const deletePost = async (req, res, uid,index) => {
  let user = await Images.findOne({"uid": uid})

  console.log('here\'s the user: ', user)

  if(user && index < user.images.length)
  {
        console.log('user exists with uid: ', uid)
        console.log('deleting image with name: ', user.images[index].name)
            
        const deleteParams = {
          Bucket: bucketName,
          Key: user.images[index].name,
        }

            await s3Client.send(new DeleteObjectCommand(deleteParams));

            await Images.update(
              { 'uid': uid },
              { $pull: { 'images': { name: user.images[index].name } } }
            ); 
            return res.status(201).json({'message':'Post deletion Successfull'})

    }
    else
    { 
        console.log('image doesn\'t exist')
        return res.status(404).json({'response':'Post not found'})  
    }
}




const findImageByName = async (image) => {
    return await Images.findOne({image:image}).exec();
} 

module.exports = {handleUpload, findImageByName, getPosts, deletePost}
