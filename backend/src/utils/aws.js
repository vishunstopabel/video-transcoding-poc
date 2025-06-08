const { S3Client } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/cloudfront-signer");
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

module.exports.getS3client = () => s3;


module.exports.getSignedUrlForThumbnail = (key) => {
  return getSignedUrl({
    url: `${process.env.AWS_BUCKET_CLOUD_FRONT_DOMAIN}/${key}`,
    dateLessThan: new Date(Date.now() + 3600 * 1000),
    privateKey: process.env.AWS_CLOUD_FRONT_PRIVATE_KEY.replace(/\\n/g, "\n"),
    keyPairId: process.env.AWS_CLOUD_FRONT_KEYPAIR_ID,
  });
  // return `${process.env.AWS_BUCKET_CLOUD_FRONT_DOMAIN}/${key}`; ///// if you dont want to use signed url
};

