const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { getS3client } = require("../utils/aws");
const { PutObjectAclCommand } = require("@aws-sdk/client-s3");
const s3 = getS3client();
module.exports.handleGetSignUrl = async (req, res) => {
  try {
    const { _id } = req.user;
    const uuid = crypto.randomUUID();
    const key = `/videos/${_id}/uuid`;
    const command= new PutObjectAclCommand({
        Bucket:process.env.,
        Key:process.env.,
        ContentType:"mp4"///its hardcodeed now may change later via accepting it from the frontend
    })
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  } catch (error) {}
};
