import axios from 'axios';

const baseURL = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:7860'}/api`;

const api = axios.create({
    baseURL
});

export default api;
