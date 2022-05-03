import http from "k6/http";

export const options = {
  vus: 10,
  duration: "30s",
};

const url = "http://localhost:3333/graphql";

const params = {
  headers: {
    "Content-Type": "application/json",
  },
};

const queryData = {
  query: `{ 
    getProduct(id: 1) {
        id,
        name,
        description,
        price,
        quantity,
        categories {
            id,
            name,
            description
        }
        brand {
            id,
            name,
            description
        },
        status {
            id,
            name
        }
    } 
}`,
};

export default function () {
  const response = http.post(url, JSON.stringify(queryData), params);
  // console.log(JSON.stringify(response));
}
