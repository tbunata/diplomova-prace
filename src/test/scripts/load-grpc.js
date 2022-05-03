import grpc from "k6/net/grpc";

export const options = {
  vus: 1000,
  duration: "30s",
};

const client = new grpc.Client();
client.load(
  ["./proto"],
  "product.proto",
);


export default () => {
  if (__ITER == 0) {// only on the first iteration
    client.connect("localhost:3000", {
      plaintext: true,
    });
  }
  const itemData = {
    id: 1,
  };
  const response = client.invoke(
    "products.v1.ProductRegister/GetProduct",
    itemData,
  );
};

export function teardown(data) {
  console.log("setup")
  client.close();
  
}