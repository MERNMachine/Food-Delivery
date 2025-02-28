import React, { useState } from "react";
import "../style/Auth/login.css";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../../api/auth";
import { GoogleLogin } from "react-google-login";

const Login = () => {
    const CLIENT_ID = "539861845016-cnji6h896uc7mhngvnvjp50epu4vq6lv.apps.googleusercontent.com";
    const navigate = useNavigate();

    const handleSuccess = (response) => {
        console.log("Google Login Success:", response);
        const token = response.tokenId;

        // Send token to backend for verification
        fetch("http://localhost:5000/api/auth/google/callback", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
        })
            .then((res) => res.json())
            .then((data) => {
                localStorage.setItem("token", data.token);
                console.log("User authenticated successfully:", data);
            })
            .catch((error) => {
                console.error("Error during authentication:", error);
            });
    };
    const handleFailure = (error) => {
        console.error("Google Login Failure:", error);
    };
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            if (isLogin) {
                const data = await loginUser(formData);
                setSuccess("Login successful!");
                localStorage.setItem("token", data.token);
                navigate("/menu");
            }
            else {
                const data = await registerUser(formData);
                setSuccess("Registration successful!");
                localStorage.setItem("token", data.token);
                console.log(data.token);
            }
        } catch (err) {
            if (err.response) {
                setError(err.response.data.msg || "something went wrong!");
            } else {
                setError("Network error. Please try again.");
            }
        }
    }
    return (
        <div className="login-container">
            {/* Left Side */}
            <div className="login-left">
                <div className="auth-toggle">
                    <button
                        className={`auth-btn ${isLogin ? "active" : ""}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Login
                    </button>
                    <button
                        className={`auth-btn ${!isLogin ? "active" : ""}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Sign Up
                    </button>
                </div>
            </div>

            {/* Right Side */}
            <div className="login-right">
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <form className="login-form" onSubmit={handleSubmit}>
                    {!isLogin && (<>
                        <div className="form-group">
                            <i className="fas fa-user-alt"></i>
                            <input class="login-input" type="text" value={formData.firstName} onChange={handleInputChange} name="firstName" placeholder="First Name" />
                        </div>
                        <div className="form-group">
                            <i className="fas fa-user-alt"></i>
                            <input class="login-input" type="text" value={formData.lastName} onChange={handleInputChange} name="lastName" placeholder="Last Name" />
                        </div></>)}
                    <div className="form-group">
                        <i className="fas fa-envelope"></i>
                        <input class="login-input" type="email" value={formData.email} onChange={handleInputChange} name="email" placeholder="Email" />
                    </div>
                    <div className="form-group">
                        <i className="fas fa-lock"></i>
                        <input class="login-input" type="password" value={formData.password} onChange={handleInputChange} name="password" placeholder="Password" />
                    </div>
                    <a href="#" className="forgot-password">
                        Forget Password?
                    </a>
                    <button type="submit" className="login-button">
                        {isLogin ? "Login" : "Sign Up"}
                    </button>
                </form>
                <div className="social-login">
                    <p>Or Login With</p>
                    <div className="social-icons">
                        <button className="social-btn google">Google</button>
                        {/* <GoogleLogin
                            clientId={CLIENT_ID}
                            buttonText="Log in with Google"
                            onSuccess={handleSuccess}
                            onFailure={handleFailure}
                            cookiePolicy={"single_host_origin"}
                        /> */}
                        <button className="social-btn facebook">Facebook</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
