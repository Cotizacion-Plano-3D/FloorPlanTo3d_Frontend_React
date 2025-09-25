import axios from "axios";

const api = axios.create({
  baseURL: require('./config').API_URL + '/',
    headers: {
    'Content-Type': 'application/json',
  },
})

export default api;