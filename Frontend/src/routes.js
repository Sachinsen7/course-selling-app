export const PUBLIC_ROUTES = {
    home: "/",
    courseListing: "/course",
    courseDetail: "/course/:id",
    searchResult: "/search",
    about: "/about",
    contact: "/contact"
};

export const AUTH_ROUTES  = {
    login: "/login",
    signup: "/signup",
    ForgotPassword: "/forgot-password"
}

export const PROTECTED_ROUTES = {
    courseLearning: "/course/:id/learning",
    dashboard: "/dashboard",
    profile: "/profile",
    checkout: "/checkout",
    instructor: "/instructor"
};