import http from "k6/http";

export const options = {
  vus: 100,
  duration: "30s",
};


const url = "http://localhost:3000/products/1";
const params = {
  headers: {
    "Content-Type": "application/json",
  },
};



export default function () {
  const response = http.get(url, params);
}
