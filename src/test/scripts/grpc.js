import grpc from 'k6/net/grpc';
import { check, sleep } from 'k6';

export const options = {
    vus: 10,
    duration: '30s',
};

const client = new grpc.Client();
client.load(['./proto/user'], 'user.proto');

export default () => {
    client.connect('localhost:3000', {
        plaintext: true
    });

  const data = {
    email: 'lord.vetinari@discworld.am',
    password: 'vetinariho'
  }
  const response = client.invoke('users.v1.UserRegister/LoginUser', data);
  
  check(response, {
      'status is OK': (r) => r && r.status === grpc.StatusOK,
  });
  console.log(JSON.stringify(response.message));

  const params = {
    metadata: { 'authorization': response.message.token },
  };

  const list_data = {

  }

  const responseList = client.invoke('users.v1.UserRegister/ListUsers', list_data, params);
  check(responseList, {
    'status is OK': (r) => r && r.status === grpc.StatusOK,
  });

  console.log(JSON.stringify(responseList.message));

  client.close();
  sleep(1);
};