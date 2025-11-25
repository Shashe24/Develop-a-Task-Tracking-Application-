import api from "../../api";
import { setUser, logout as logoutAction } from "../slices/authSlice";
import { toast } from "react-toastify";

export const postLoginData = (email, password) => async (dispatch) => {
    try {
        const { data } = await api.post('/auth/login', { email, password });
        dispatch(setUser({ user: data.user, token: data.token }));
        localStorage.setItem('token', data.token);
        toast.success(data.msg);
    } catch (error) {
        const msg = error.response?.data?.msg || error.message;
        toast.error(msg);
    }
};

export const postSignupData = (name, email, password) => async (dispatch) => {
    try {
        await api.post('/auth/signup', { name, email, password });
        toast.success("Account created successfully! Please login.");
    } catch (error) {
        const msg = error.response?.data?.msg || error.message;
        toast.error(msg);
    }
};

export const saveProfile = (token) => async (dispatch) => {
    try {
        const { data } = await api.get('/profile', {
            headers: { Authorization: token }
        });
        dispatch(setUser({ user: data.user, token }));
    } catch (error) {
        // Token invalid or expired, clear it
        localStorage.removeItem('token');
    }
};

export const logout = () => (dispatch) => {
    localStorage.removeItem('token');
    dispatch(logoutAction());
    document.location.href = '/';
};
