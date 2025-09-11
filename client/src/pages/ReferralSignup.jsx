// ReferralSignup.jsx
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Alert from '../components/Alert';

function ReferralSignup() {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const [linkValid, setLinkValid] = useState(null);
    const [invitationData, setInvitationData] = useState(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const navigate = useNavigate();
    const [alert, setAlert] = useState({
        isOpen: false,
        severity: "success",
        message: "",
    });

    // Prevent multiple validations and submissions
    const hasValidated = useRef(false);
    const isSubmitting = useRef(false);
    const heartbeatInterval = useRef(null);
    const hasRegistered = useRef(false);

    // Get referral token with fallback methods
    const getReferralToken = () => {
        let token = searchParams.get('ref');
        
        if (!token) {
            const urlParams = new URLSearchParams(location.search);
            token = urlParams.get('ref');
        }
        
        if (!token) {
            const windowParams = new URLSearchParams(window.location.search);
            token = windowParams.get('ref');
        }
        
        return token;
    };

    const referralToken = getReferralToken();

    // Setup browser close detection and heartbeat
    useEffect(() => {
        if (!referralToken || !linkValid) return;

        // Handle browser close/tab close
        const handleBeforeUnload = () => {
            if (!hasRegistered.current && linkValid && !loading) {
                navigator.sendBeacon(
                    'http://localhost:8000/api/invalidate-invitation',
                    JSON.stringify({ token: referralToken })
                );
            }
        };

        // Setup heartbeat to track activity
        const setupHeartbeat = () => {
            heartbeatInterval.current = setInterval(() => {
                if (!hasRegistered.current && linkValid) {
                    axios.post('http://localhost:8000/api/invitation-heartbeat', {
                        token: referralToken
                    }).catch(error => {
                        console.log('Heartbeat failed:', error);
                    });
                }
            }, 30000);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        setupHeartbeat();

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (heartbeatInterval.current) {
                clearInterval(heartbeatInterval.current);
            }
        };
    }, [referralToken, linkValid, loading]);

    // Initial validation
    useEffect(() => {
        if (referralToken && !hasValidated.current) {
            hasValidated.current = true;
            validateReferralLink();
        } else if (!referralToken) {
            setAlert({
                isOpen: true,
                severity: "error",
                message: `No referral token found in URL`
            });
        }
    }, [referralToken]);

    useEffect(() => {
        setPasswordStrength(checkPasswordStrength(password));
    }, [password]);

    const checkPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    };

    const validateReferralLink = async () => {
        const tokenToValidate = getReferralToken();
        if (!tokenToValidate) {
            setAlert({
                isOpen: true,
                severity: "error",
                message: "No referral token available for validation"
            });
            return;
        }

        try {
            const response = await axios.get(`http://localhost:8000/api/validate-referral/${tokenToValidate}`);
            
            if (response.data.valid) {
                setLinkValid(true);
                setInvitationData(response.data);
            } else {
                setLinkValid(false);
                setAlert({
                    isOpen: true,
                    severity: "error",
                    message: response.data.message
                });
            }
        } catch (error) {
            setLinkValid(false);
            setAlert({
                isOpen: true,
                severity: "error",
                message: error.response?.data?.message || 'Failed to validate invitation link'
            });
        }
    };

    const handleRegistration = async (e) => {
        e.preventDefault();
        
        if (isSubmitting.current || loading || hasRegistered.current) {
            return;
        }
        
        if (password !== confirmPassword) {
            setAlert({
                isOpen: true,
                severity: "error",
                message: "Passwords do not match"
            });
            return;
        }

        if (password.length < 8) {
            setAlert({
                isOpen: true,
                severity: "error",
                message: "Password must be at least 8 characters long"
            });
            return;
        }

        if (passwordStrength < 3) {
            setAlert({
                isOpen: true,
                severity: "error",
                message: "Please choose a stronger password"
            });
            return;
        }

        isSubmitting.current = true;
        setLoading(true);

        try {
            const tokenForRegistration = getReferralToken();
            
            const response = await axios.post('http://localhost:8000/api/complete-registration', {
                token: tokenForRegistration,
                email: invitationData.inviteeEmail,
                password: password
            });

            if (response.data.success) {
                hasRegistered.current = true;
                
                if (heartbeatInterval.current) {
                    clearInterval(heartbeatInterval.current);
                }

                setAlert({
                    isOpen: true,
                    severity: "success",
                    message: "Account created successfully! Redirecting..."
                });
                
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (error) {
            setAlert({
                isOpen: true,
                severity: "error",
                message: error.response?.data?.message || "Registration failed. Please try again."
            });
            
            isSubmitting.current = false;
        } finally {
            setLoading(false);
        }
    };

    // Show loading state
    if (linkValid === null && !alert.isOpen) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h3>Validating Invitation...</h3>
                <p>Please wait while we verify your invitation link.</p>
            </div>
        );
    }

    // Show invalid link
    if (!referralToken || linkValid === false) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Invalid Link</h2>
                <p>This invitation link has expired or has already been used.</p>
                <p>Please request a new invitation from your referrer.</p>
                <button onClick={() => navigate('/')}>Go Home</button>
            </div>
        );
    }

    return (
        <div className="container" style={{ 
            maxWidth: '500px', 
            margin: '50px auto', 
            padding: '20px',
            fontFamily: 'Arial, sans-serif'
        }}>
            <header style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h1>Complete Your Registration</h1>
                {invitationData && (
                    <div style={{ 
                        padding: '15px', 
                        backgroundColor: '#f0f8f0', 
                        border: '1px solid #d0e8d0', 
                        borderRadius: '4px',
                        marginBottom: '20px'
                    }}>
                        <p><strong>{invitationData.referrerEmail}</strong> invited you to join!</p>
                        <p>Account: <strong>{invitationData.inviteeEmail}</strong></p>
                    </div>
                )}
            </header>

            <form onSubmit={handleRegistration}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Create Password</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter a strong password"
                            required
                            disabled={loading}
                            minLength={8}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '16px',
                                boxSizing: 'border-box'
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={loading}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '14px',
                                width: 'auto',
                                padding: '5px'
                            }}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    
                    {/* Simple password strength indicator */}
                    {password && (
                        <div style={{ marginTop: '5px', fontSize: '12px' }}>
                            <span>Password strength: </span>
                            <span style={{ 
                                color: passwordStrength < 3 ? 'red' : passwordStrength < 4 ? 'orange' : 'green'
                            }}>
                                {passwordStrength < 2 ? 'Weak' : passwordStrength < 4 ? 'Fair' : 'Strong'}
                            </span>
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label>Confirm Password</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            required
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '16px',
                                boxSizing: 'border-box'
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={loading}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '14px',
                                width: 'auto',
                                padding: '5px'
                            }}
                        >
                            {showConfirmPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                        <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                            Passwords do not match
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading || password !== confirmPassword || password.length < 8 || passwordStrength < 3 || isSubmitting.current}
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: (loading || password !== confirmPassword || password.length < 8 || passwordStrength < 3 || isSubmitting.current) ? '#999' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: (loading || password !== confirmPassword || password.length < 8 || passwordStrength < 3 || isSubmitting.current) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Creating Account...' : 'Complete Registration'}
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#666' }}>
                By creating an account, you agree to our Terms of Service and Privacy Policy.
            </div>

            <Alert
                isOpen={alert.isOpen}
                severity={alert.severity}
                message={alert.message}
                onClose={() => setAlert({ ...alert, isOpen: false })}
            />
        </div>
    );
}

export default ReferralSignup;
