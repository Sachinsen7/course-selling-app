import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";
import { registerUser } from "../services/api";


const AuthContext = createContext();


function AuthProvider({children}){
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem("token"))

    const login = async (crediantials)  => {
        const data = await registerUser(crediantials)
        setUser(data.user)
        setToken(data.token)
        localStorage.setItem("token", data.token)
    }


    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem("token")
    }


    return (
        <AuthContext.Provider value={{user, token, login, logout, isAuthenticated: !!token}}>
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