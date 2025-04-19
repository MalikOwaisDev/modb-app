import axios from "axios";

const instance = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNTI3Yjg4NzY5NmM3ZjExZGI1MzM1YjQ5MTgxN2VjNyIsIm5iZiI6MTc0NDUwNTQ1MS4zNjYwMDAyLCJzdWIiOiI2N2ZiMGE2YjFmM2JjZmVhNDhkOTYzMjAiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.z62ccp4m-iBKTstYOpAXkT1iAZjNVKaUINzFZpxIDZQ",
  },
});

export default instance;
