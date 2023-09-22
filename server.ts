const SMTPServer = require("smtp-server").SMTPServer;

const server = new SMTPServer({
    logger: false,
    banner: 'Welcome to My Awesome SMTP Server',
    disabledCommands: ['STARTTLS'],
    size: 100 * 1024 * 1024,
    onAuth(auth, session, callback) {
        return callback(null, {
            user: {
                username: auth.username
            }
        });
    },

    onData(stream, session, callback) {
        console.log('Streaming message from user %s', session.user.username);
        console.log('------------------');
        stream.pipe(process.stdout);
        stream.on('end', () => {
            console.log(''); // ensure linebreak after the message
            callback(null, 'Message queued as ' + Date.now()); // accept the message once the stream is ended
        });
    }
});

server.on('error', err => {
    console.log('Error occurred');
    console.log(err);
});

server.listen(12345, '127.0.0.1', () => {
    console.log('SMTP server is listening on port 12345');
});