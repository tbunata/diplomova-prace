import http from "k6/http";
import { sleep } from "k6";
import {
  randomIntBetween,
  randomString,
  randomItem,
} from "https://jslib.k6.io/k6-utils/1.1.0/index.js";

export const options = {
  vus: 2,
  duration: "10s",
};

const url = "http://localhost:3333/graphql";

const create_user = () => {
  const email = `user_${randomString(10)}@example.com`;
  const password = `password_${randomString(10)}`;
  const queryData = {
    query: `mutation {
                  addUser(newUserData: {
                    email: "${email}",
                    password: "${password}",
                    firstName: "first_${randomString(10)}",
                    lastName: "last_${randomString(10)}",
                    phone: "phone_${randomString(10)}",
                    address: "address_${randomString(10)}",
                    city: "city_${randomString(10)}",
                    zipCode: "zip_${randomString(10)}"
                  }) {
                      email,
                      status {
                          id,
                          name
                      }
                  } 
              }`,
  };

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  http.post(url, JSON.stringify(queryData), params);
  sleep(1);
  return {
    email: email,
    password: password,
  };
};

const login_user = (credentials) => {
  const loginData = {
    query: `mutation { 
                loginUser(
                    email: "${credentials.email}",
                    password: "${credentials.password}"
                ) {
                    token
                }
            }`,
  };
  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const response = http.post(url, JSON.stringify(loginData), params);
  const body = JSON.parse(response.body);
  sleep(1);
  return body.data.loginUser.token;
};

const list_products = (token) => {
  const params = {
    headers: {
      "Content-Type": "application/json",
      "x-access-token": token,
    },
  };

  const queryData = {
    query: `{ 
              allProducts {
                  id,
                  name,
                  quantity,
              } 
          }`,
  };
  const response = http.post(url, JSON.stringify(queryData), params);
  const body = JSON.parse(response.body);
  sleep(1);
  return body.data.allProducts;
};

const add_to_cart = (token, products) => {
  const params = {
    headers: {
      "Content-Type": "application/json",
      "x-access-token": token,
    },
  };

  const product = randomItem(products);
  if (product.quantity == 0) {
    console.log(`product: ${product.name} not available`);
    return false;
  }

  const queryData = {
    query: `mutation {
              addItemToCart(newCartItemData: {
                  productId: ${product.id},
                  quantity: ${randomIntBetween(1, 10)}
              }) {
                  totalPrice
              }
          }`,
  };
  const response = http.post(url, JSON.stringify(queryData), params);
  const body = JSON.parse(response.body);
  sleep(1);
  return body.data.addItemToCart;
};

const checkout_cart = (token) => {
  const params = {
    headers: {
      "Content-Type": "application/json",
      "x-access-token": token,
    },
  };
  const queryData = {
    query: `mutation {
              checkoutCart {
                  id,
                  userId,
                  created,
                  updated,
                  price
              } 
          }`,
  };
  const response = http.post(url, JSON.stringify(queryData), params);
  const body = JSON.parse(response.body);
  sleep(1);
  return body.data.checkoutCart;
};

const list_orders = (token) => {
  const params = {
    headers: {
      "Content-Type": "application/json",
      "x-access-token": token,
    },
  };
  const queryData = {
    query: `query {
              allOrders {
                  id,
                  userId,
                  created,
                  updated,
                  price,
                  items {
                      id,
                      name,
                      quantity,
                      price
                  }
              }
          }`,
  };
  const response = http.post(url, JSON.stringify(queryData), params);
  const body = JSON.parse(response.body);
  sleep(1);
  return body.data.allOrders;
};

export default function () {
  const credentials = create_user();
  const token = login_user(credentials);
  const products = list_products(token);
  const cart = add_to_cart(token, products);
  const order = checkout_cart(token);
  const orders = list_orders(token);
  sleep(1);
}
