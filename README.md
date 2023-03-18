# Skill Swipe Backend - COM SCI 35L Project

Skill Swipe is a mobile app built with **React Native, Node.js, Express.js, and MongoDB** as the database/backend. 

This repository contains the Node/Express backend.

Recruiters can use Skill Swipe to streamline the hiring process and find the best talent for their organization. They can post job openings and receive applications from qualified candidates who match their requirements.

As a user of Skill Swipe, the experience is straightforward and user-friendly. Users create a profile with their work experience, education, and other relevant information, and the platform matches them with job openings that match their skills and experience.

Our implementation is an mobile web app running on both IOS/Android

## Before you Start

A deployed version of this backend server is available at https://skill-swipe-backend.onrender.com/ 

A MongoDB collection, a AWS S3 bucket, and an email account are needed to run this backend server properly.

You will need to add a `.env` at the root of the directory with the necessary informations. You can copy the content of the file `env-template`, and fill out all the field.

It is also important to set the right policy for AWS S3 bucket, since we are adding public read objects:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Principal": {
                "AWS": "USER"
            },
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl"
            ],
            "Resource": [
                "arn:aws:s3:::BUCKET_NAME",
                "arn:aws:s3:::BUCKET_NAME/*"
            ]
        },
        {
            "Sid": "AllowPublicRead",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::BUCKET_NAME/*"
        }
    ]
}
```

Please make sure to have `npm` and `node` installed with version `19.5.0` or greater (`node -v` to check version).

To install node, please visit [nodejs.org](https://www.nodejs.org/)

```
npm install
```

## To Start:

```
npm start
```

## Trouble Shooting

Make sure you have node installed:

```
brew install nodeq
```