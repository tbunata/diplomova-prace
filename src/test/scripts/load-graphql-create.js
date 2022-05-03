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
  query: `mutation { 
    addProduct(newProductData: {
        name: "White shirt",
        description: "A really white shirt",
        price: 999,
        quantity: 6,
        categoryIds: [1],
        brandId: 2,
        statusId: 1
    }) {
        id,
    } 
}`,
};

export default function () {
  const response = http.post(url, JSON.stringify(queryData), params);
  console.log(JSON.stringify(response));
}
