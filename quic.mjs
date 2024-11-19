import quic from 'node-quic';

const port = 1234;
const address = '127.0.0.1';

quic.listen(port, address)
  .then(() => {
    console.log('QUIC server is listening on port', port);
  })
  .onError((error) => {
    console.error('Error occurred while listening:', error);
  })
  .onData((data, stream, buffer) => {
    console.log('Received data:', data);

    stream.write('Data received by the server');
  });

const dataToSend = 'Hello, QUIC server!';


quic.send(port, address, dataToSend)
  .then(() => {
    console.log('Data sent successfully');
  })
  .onError((error) => {
    console.error('Error occurred while sending data:', error);
  })
  .onData((data, buffer) => {
    console.log('Response from server:', data);
  });