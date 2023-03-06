const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")
const sharp = require('sharp')
const crypto = require('crypto');

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

const uploadImage = async (body, headers, width, height) => {
  // const userJSON =await JSON.parse(formData.image);
  const contentType = headers['content-type'];

  if (!['image/png', 'image/jpeg', 'image/gif'].includes(contentType))
    throw new Error('Image format not accepted, must be png, gif, or jpeg');

  const imageName = generateFileName()

  const image = await Buffer.from( body, 'base64');

  const fileBuffer = await sharp(image)
    .resize({ height, width, fit: "contain" })
    .toBuffer()

  const uploadParams = {
    Bucket: bucketName,
    //Key: userJSON.imageName,
    Key: imageName,
    Body: fileBuffer,
    ContentEncoding: 'base64', // important to tell that the incoming buffer is base64
    ContentType: contentType, // e.g. "image/jpeg" or "image/png"
  }
  
  await s3Client.send(new PutObjectCommand(uploadParams))
  
  //res.status(201).send(post)
  console.log("created post record");

  // return res.status(201).json({'message':'Registeration Successfull'})
  return imageName;
}

const getImage = async (imageName) => {
  const params = {
    Bucket: bucketName,
    Key: imageName
  }

  const command = new GetObjectCommand(params);
  const seconds = 60
  url = await getSignedUrl(s3Client, command, { expiresIn: seconds });

  if(url)
    return url;
  throw new Error("Image not Found");

}

const deleteImage = async (imageName) => {
  const deleteParams = {
    Bucket: bucketName,
    Key: user.images[index].name,
  }

  await s3Client.send(new DeleteObjectCommand(deleteParams));
}

const updateImage = async (imageName, body, headers, width, height) => {
  try{
    await deleteImage(imageName);
  } catch (ignore) {

  }

  console.log("hey")

  const newName = await uploadImage(body, headers, width, height);
  return newName;
}

module.exports = {uploadImage, getImage, deleteImage, updateImage}
