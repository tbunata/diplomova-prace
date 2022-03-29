import grpc from "k6/net/grpc";
import { check, sleep } from "k6";
import {
  randomIntBetween,
  randomString,
  randomItem,
} from "https://jslib.k6.io/k6-utils/1.1.0/index.js";

export const options = {
  vus: 3,
  duration: "5s",
};

const client = new grpc.Client();
client.load(
  ["./proto"],
  "user.proto",
  "product.proto",
  "cart.proto",
  "order.proto"
);

const create_user = (client) => {
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

  const response = client.invoke("users.v1.UserRegister/CreateUser", userData);
  check(response, {
    "status is OK": (r) => r && r.status === grpc.StatusOK,
  });

  sleep(1);
  return {
    email: userData.email,
    password: userData.password,
  };
};

const login_user = (client, credentials) => {
  const response = client.invoke(
    "users.v1.UserRegister/LoginUser",
    credentials
  );
  check(response, {
    "status is OK": (r) => r && r.status === grpc.StatusOK,
  });

  sleep(1);
  return response.message.token;
};

const list_products = (client, token) => {
  const params = {
    metadata: { authorization: token },
  };
  const response = client.invoke(
    "products.v1.ProductRegister/ListProducts",
    {},
    params
  );
  check(response, {
    "status is OK": (r) => r && r.status === grpc.StatusOK,
  });

  sleep(1);
  return response.message.products;
};

const add_to_cart = (client, token, products) => {
  const product = randomItem(products);

  if (product.quantity == 0) {
    console.log(`product: ${product.name} not available`);
    return false;
  }
  const itemData = {
    productId: product.id,
    quantity: randomIntBetween(1, 10),
  };
  const params = {
    metadata: { authorization: token },
  };
  const response = client.invoke(
    "carts.v1.CartRegister/AddCartItem",
    itemData,
    params
  );
  check(response, {
    "status is OK": (r) => r && r.status === grpc.StatusOK,
  });

  sleep(1);
  return response.message.cart;
};

const checkout_cart = (client, token) => {
  const params = {
    metadata: { authorization: token },
  };
  const response = client.invoke(
    "carts.v1.CartRegister/CheckoutCart",
    {},
    params
  );
  check(response, {
    "status is OK": (r) => r && r.status === grpc.StatusOK,
  });

  sleep(1);
  return response.message.cart;
};

const list_orders = (client, token) => {
  const params = {
    metadata: { authorization: token },
  };
  const response = client.invoke(
    "orders.v1.OrderRegister/ListOrders",
    {},
    params
  );
  check(response, {
    "status is OK": (r) => r && r.status === grpc.StatusOK,
  });

  sleep(1);
  return response.message.orders;
};

export default () => {
  client.connect("localhost:3000", {
    plaintext: true,
  });
  const credentials = create_user(client);
  const token = login_user(client, credentials);
  const products = list_products(client, token);
  const cart = add_to_cart(client, token, products);
  const order = checkout_cart(client, token);
  const orders = list_orders(client, token);

  client.close();
  sleep(1);
};
