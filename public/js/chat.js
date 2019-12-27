let socket = io.connect({transports: ['websocket'], upgrade: false});

socket.emit('startChat', {chatId:document.getElementById('chatId').value});

function sendMessage() {
    fetch("/message/send", {
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({chatId: document.getElementById('chatId').value,
            text: document.getElementById('messagetext').value})
      })
      .then(function () {
        socket.emit('newMessage',{chatId:document.getElementById('chatId').value});
      })
      .catch(function (error) {
        console.log('Request failed', error);
      });
}

function scrollMessagesToBottom() {
    let messages = document.getElementById("convoMessages");
    messages.scrollTop = messages.scrollHeight;
}

socket.on('newMessage', function(data){
    window.location.href="/message/chat?chatId=" + data.chatId
});

scrollMessagesToBottom();