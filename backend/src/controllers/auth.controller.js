module.exports.handelGithubInit = async (req, res) => {
  try {
    console.log("reached");
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user`;
    return res.status(200).json({ url: redirectUri });
  } catch (error) {
    console.log("error occured  in gitubinit ", error.message);
    res.status(500).json({msg:"internal server error"})
  }
};
