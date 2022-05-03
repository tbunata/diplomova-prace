import grpc from "k6/net/grpc";

export const options = {
  vus: 10,
  duration: "30s",
};

const client = new grpc.Client();
client.load(
  ["./proto"],
  "product.proto",
);

const inputData = {
  name: "White shirt",
  description: "A really white shirt",
  price: 999,
  quantity: 6,
  categoryIds: [1],
  brandId: 2,
  statusId: 1,
};

export default () => {
  if (__ITER == 0) {// only on the first iteration
    client.connect("localhost:3000", {
      plaintext: true,
    });
  }

  const response = client.invoke(
    "products.v1.ProductRegister/CreateProduct",
    inputData,
  );
};

export function teardown(data) {
  console.log("setup")
  client.close(); 
}