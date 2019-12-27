const nodemailer = require('nodemailer')

class SendMail{
    async sendMail(content){
        console.log("sending")
        try{
            let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth:{
                user: 'know.webdev@gmail.com',
                pass: 'Knowledgebase2!'
            }
        })  

        let info = await transporter.sendMail({
            from: content.from,
            to: content.to,
            subject: content.subject,
            text: content.text,
        })
    
        console.log("Message sent: %s", info.messageId);
    
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        return info
    }
        catch(err){
            console.log(err)
        }
    }
}

module.exports = new SendMail()
