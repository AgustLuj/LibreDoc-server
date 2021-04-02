const {OAuth2Client} = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_SIGNIN_TOKEN);

const googleVerify = async (idToken)=>{
      const ticket = await client.verifyIdToken({
          idToken,
          audience: process.env.CLIENTID,
      });
      const {email,name,picture:img} = ticket.getPayload();
      
      return {email,name,img};
}
module.exports ={
    googleVerify
}
