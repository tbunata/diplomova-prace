import http from "k6/http";
import { sleep } from "k6";
import {
  randomIntBetween,
  randomString,
  randomItem,
} from "https://jslib.k6.io/k6-utils/1.1.0/index.js";

export const options = {
  vus: 10,
  duration: "30s",
};

const create_user = () => {
  const userData = {
    email: `user_${randomString(10)}@example.com`,
    password: `password_${randomString(10)}`,
    firstName: `first_${randomString(10)}`,
    lastName: `last_${randomString(10)}`,
    phone: `phone_${randomString(10)}`,
    address: `address_${randomString(10)}`,
    city: `city_${randomString(10)}`,
    zipCode: `zip_${randomString(10)}`,
  };
  const url = "http://localhost:3000/users";
  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = http.post(url, JSON.stringify(userData), params);
  sleep(1);
  return {
    email: userData.email,
    password: userData.password,
  };
};

const login_user = (credentials) => {
  const url = "http://localhost:3000/users/login";
  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = http.post(url, JSON.stringify(credentials), params);
  const data = JSON.parse(response.body);
  sleep(1);
  return data.token;
};

const list_products = (token) => {
  const url = "http://localhost:3000/products";
  const params = {
    headers: {
      "Content-Type": "application/json",
      "x-access-token": token,
    },
  };

  const response = http.get(url, params);
  const data = JSON.parse(response.body);
  sleep(1);
  return data;
};

const add_to_cart = (token, products) => {
  const url = "http://localhost:3000/carts/addItem";
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
  const itemData = {
    productId: product.id,
    quantity: randomIntBetween(1, 10),
  };
  const response = http.post(url, JSON.stringify(itemData), params);
  const data = JSON.parse(response.body);
  sleep(1);
  return data;
};

const checkout_cart = (token) => {
  const url = "http://localhost:3000/carts/checkout";
  const params = {
    headers: {
      "Content-Type": "application/json",
      "x-access-token": token,
    },
  };
  const response = http.post(url, JSON.stringify({}), params);
  console.log(JSON.stringify(response.body))
  const data = JSON.parse(response.body);
  sleep(1);
  return data;
};

const list_orders = (token) => {
  const url = "http://localhost:3000/orders";
  const params = {
    headers: {
      "Content-Type": "application/json",
      "x-access-token": token,
    },
  };
  const response = http.get(url, params);
  const data = JSON.parse(response.body);
  sleep(1);
  return data;
};

export default function () {
  const credentials = create_user();
  const token = login_user(credentials);
  const products = list_products(token);
  add_to_cart(token, products); // can add multiple and check for empty cart
  checkout_cart(token);
  list_orders(token);
}
