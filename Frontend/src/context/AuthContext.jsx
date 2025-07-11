import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";
import { loginUser,registerUser } from "../services/api";


const AuthContext = createContext();


function AuthProvider({children}){
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem("token"))

    const login = async (credientials)  => {
        const data = await loginUser(credientials)
        setToken(data.token)
        localStorage.setItem("token", data.token)
        setUser({id: data.userId})
    }

    const signup = async (userData)  => {
        const data = await loginUser(userData)
        setToken(data.token)
        localStorage.setItem("token", data.token)
        setUser({id: data.userId})
    }


    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem("token")
    }


    return (
        <AuthContext.Provider value={{user, token, login, signup, logout, isAuthenticated: !!token}}>
            {children}
        </AuthContext.Provider>
    )

    
}

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
}

export {AuthContext, AuthProvider}

export function useAuth(){
    return useContext(AuthContext)
}