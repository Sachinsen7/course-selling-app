export const PUBLIC_ROUTES = {
    home: "/",
    courseListing: "/course",
    courseDetail: (id) =>  `/course/${id}`,
    searchBar: "/search",
    about: "/about",
    contact: "/contact"
};

export const AUTH_ROUTES  = {
    login: "/login",
    signup: "/signup",
    ForgotPassword: "/forgot-password"
}

export const PROTECTED_ROUTES = {
    courseLearning: (id) =>  `/course/${id}/learning`,
    dashboard: "/dashboard",
    profile: "/profile",
    checkout: "/checkout",
    instructor: "/instructor"
};