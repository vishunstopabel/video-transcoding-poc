
const { getRabbitMqClient } = require("../config/rabitmqConnect");
module.exports.transcoderConsumer=async()=>{
    try {
            const {channel,client}=getRabbitMqClient()
     await channel.assertQueue("video-transcoder")
     channel.consume("video-transcoder", data => {
            console.log(`${Buffer.from(data.content)}`);
            // channel.ack(data);
        })
        

        
    } catch (error) {
        console.log(error)
    }
}