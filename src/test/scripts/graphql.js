import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    vus: 10,
    duration: '30s',
};

export default function () {
    const url = 'http://localhost:3333/graphql';

    const queryData = JSON.stringify({
        query: `mutation loginUser(
            email: "lord.vetinari@discworld.am",
            password: "vetinariho"
        ) {
            token
            refreshToken
        }` 
    })
  
    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
  
    http.post(url, queryData, params);
    sleep(1);
}