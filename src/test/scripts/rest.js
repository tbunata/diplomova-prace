import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    vus: 10,
    duration: '30s',
};

export default function () {
    const url = 'http://localhost:3000/users/login';
    const payload = JSON.stringify({
      email: 'lord.vetinari@discworld.am',
      password: 'vetinariho',
    });
  
    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
  
    http.post(url, payload, params);
    sleep(1);
}