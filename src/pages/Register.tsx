import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, setDoc, getDoc, serverTimestamp, query, collection, where, getDocs, runTransaction } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/effects/PageTransition';
import Toast, { type ToastType } from '../components/ui/Toast';
import { majors } from '../data/majors';
import collegesData from '../data/colleges.json';
import './Register.css';

interface SearchableDropdownProps {
    label: string;
    name: string;
    options: { value: string; label: string }[];
    value: string;
    onChange: (name: string, value: string) => void;
    placeholder: string;
    required?: boolean;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({ label, name, options, value, onChange, placeholder, required }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const selectedOption = options.find(opt => opt.value === value);
        if (selectedOption) {
            setSearchTerm(selectedOption.label);
        } else {
            setSearchTerm('');
        }
    }, [value, options]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                const selectedOption = options.find(opt => opt.value === value);
                setSearchTerm(selectedOption ? selectedOption.label : '');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [value, options]);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Scroll active item into view
    useEffect(() => {
        if (focusedIndex >= 0 && listRef.current) {
            const item = listRef.current.children[focusedIndex] as HTMLElement;
            if (item) {
                item.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [focusedIndex]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        if (!isOpen) setIsOpen(true);
        setFocusedIndex(0);
        if (e.target.value === '') {
            onChange(name, '');
        }
    };

    const handleSelectOption = (option: { value: string; label: string }) => {
        onChange(name, option.value);
        setSearchTerm(option.label);
        setIsOpen(false);
        setFocusedIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
                setIsOpen(true);
                setFocusedIndex(0);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setFocusedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setFocusedIndex(prev => (prev > 0 ? prev - 1 : prev));
                break;
            case 'Enter':
                e.preventDefault();
                if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
                    handleSelectOption(filteredOptions[focusedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setFocusedIndex(-1);
                const selectedOption = options.find(opt => opt.value === value);
                setSearchTerm(selectedOption ? selectedOption.label : '');
                break;
            case 'Tab':
                if (isOpen && focusedIndex >= 0 && filteredOptions[focusedIndex]) {
                    handleSelectOption(filteredOptions[focusedIndex]);
                }
                setIsOpen(false);
                break;
        }
    };

    const handleBlur = () => {
        // We use a small timeout to let any click events on options fire first
        setTimeout(() => {
            if (isOpen) {
                if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
                    handleSelectOption(filteredOptions[focusedIndex]);
                } else {
                    const selectedOption = options.find(opt => opt.value === value);
                    setSearchTerm(selectedOption ? selectedOption.label : '');
                }
                setIsOpen(false);
            }
        }, 200);
    };

    return (
        <div className="input-group" ref={containerRef} style={{ zIndex: isOpen ? 1000 : 1 }}>
            <label>{label}</label>
            <div className={`searchable-input-wrapper ${isOpen ? 'open' : ''} ${value ? 'has-value' : ''}`}>
                <input
                    type="text"
                    className="search-main-input"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    onFocus={() => {
                        setIsOpen(true);
                        setFocusedIndex(0);
                    }}
                    required={required && !value}
                />
                <div className="custom-select-arrow" onClick={() => setIsOpen(!isOpen)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </div>

                {isOpen && (
                    <div className="custom-options-container">
                        <div className="options-list" ref={listRef}>
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option, index) => (
                                    <div
                                        key={option.value}
                                        className={`custom-option ${value === option.value ? 'selected' : ''} ${focusedIndex === index ? 'focused' : ''}`}
                                        onClick={() => handleSelectOption(option)}
                                        onMouseEnter={() => setFocusedIndex(index)}
                                    >
                                        {option.label}
                                        {value === option.value && <span className="check">✓</span>}
                                    </div>
                                ))
                            ) : (
                                <div className="no-options">No results found</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {required && <input type="hidden" name={name} value={value} required />}
        </div>
    );
};

const REGISTRATION_FEE = 499;
const UPI_IDS = ["shravan45x@pingpay"];

const Register = () => {
    const navigate = useNavigate();
    const { user, isAdmin, isRegistered, registrationData, setIsRegistered, setRegistrationData } = useAuth();
    const [step, setStep] = useState<'details' | 'payment'>('details');

    useEffect(() => {
        if (isAdmin) {
            navigate('/admin-dashboard', { replace: true });
        }
    }, [isAdmin, navigate]);
    const [paymentMethod, setPaymentMethod] = useState<string>('upi_app');
    const [subStep, setSubStep] = useState<'instructions' | 'action' | 'verification'>('instructions');
    const [instructionsRead, setInstructionsRead] = useState(false);
    const [transactionId, setTransactionId] = useState('');

    const handleMethodChange = (method: string) => {
        setPaymentMethod(method);
        setSubStep('instructions');
        setInstructionsRead(false);
        setTransactionId('');
    };

    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: '+91 ',
        college: '',
        major: '',
        studentId: '',
        year: '',
        govtId: ''
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }));
        }
    }, [user]);

    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '',
        type: 'success',
        isVisible: false
    });

    const showToast = (message: string, type: ToastType = 'success') => {
        setToast({ message, type, isVisible: true });
    };

    const formatGovtId = (value: string) => {
        if (!value) return '';
        const isNumeric = /^[0-9]/.test(value);
        if (isNumeric) {
            const digits = value.replace(/\s/g, '').replace(/[^0-9]/g, '').slice(0, 12);
            const matches = digits.match(/.{1,4}/g);
            return matches ? matches.join(' ') : digits;
        } else {
            let normalized = value.replace(/\s/g, '').toUpperCase();
            let result = '';
            for (let i = 0; i < normalized.length; i++) {
                if (i < 5) {
                    if (/[A-Z]/.test(normalized[i])) result += normalized[i];
                } else if (i < 9) {
                    if (/[0-9]/.test(normalized[i])) result += normalized[i];
                } else if (i < 10) {
                    if (/[A-Z]/.test(normalized[i])) result += normalized[i];
                }
            }
            return result.slice(0, 10);
        }
    };

    const handleNextStep = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        const purePhone = formData.phone.replace(/\s/g, '').replace('+91', '');
        if (purePhone.length !== 10) {
            showToast('Please enter a valid 10-digit mobile number', 'error');
            return;
        }

        const pureId = formData.govtId.replace(/\s/g, '');
        if (pureId.length < 4) {
            showToast('Please provide a valid Government ID', 'error');
            return;
        }

        setStep('payment');
    };

    const handleFinalSubmission = async () => {
        if (!user) return;

        showToast('Finalizing your registration...', 'success');

        try {
            // SECURITY: Final check before writing to prevent overwriting existing valid registrations
            const existingDoc = await getDoc(doc(db, "registrations", user.uid));
            if (existingDoc.exists()) {
                const currentData = existingDoc.data();
                if (currentData.status === 'pending' || currentData.status === 'confirmed') {
                    showToast('Registration already exists for this mission.', 'error');
                    setIsRegistered(true);
                    setRegistrationData(currentData as any);
                    return;
                }
            }

            // ANTI-FRAUD: Check if Transaction ID is already used (only for UPI)
            if (paymentMethod !== 'cash' && transactionId) {
                const q = query(collection(db, "registrations"), where("transactionId", "==", transactionId));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    showToast('This Transaction ID has already been utilized.', 'error');
                    return;
                }
            }

            // 1. Generate High-Precision Ticket ID (SUN-XXX-0001)
            const namePrefix = (formData.firstName + formData.lastName)
                .replace(/[^A-Z]/gi, '')
                .toUpperCase()
                .slice(0, 3)
                .padEnd(3, 'X');

            let finalTicketId = "";

            await runTransaction(db, async (transaction) => {
                const counterRef = doc(db, "metadata", "registration_stats");
                const counterSnap = await transaction.get(counterRef);

                let nextCount = 1;
                if (counterSnap.exists()) {
                    nextCount = (counterSnap.data().last_ticket_number || 0) + 1;
                }

                transaction.set(counterRef, { last_ticket_number: nextCount }, { merge: true });

                const paddedNumber = nextCount.toString().padStart(4, '0');
                finalTicketId = `SUN-${namePrefix}-${paddedNumber}`;
            });

            const newRegData = {
                ...formData,
                uid: user.uid,
                status: 'pending',
                transactionId: transactionId,
                paymentMethod: paymentMethod,
                registrationDate: new Date(),
                ticketId: finalTicketId
            };

            await setDoc(doc(db, "registrations", user.uid), {
                ...newRegData,
                registrationDate: serverTimestamp()
            });

            // Update global state immediately
            setIsRegistered(true);
            setRegistrationData(newRegData);

            setTimeout(() => {
                showToast('Registration submitted for verification', 'success');
            }, 1000);
        } catch (error) {
            console.error("Error saving registration:", error);
            showToast('Registration failed. Please try again.', 'error');
        }
    };

    const handlePaymentAction = (e?: React.MouseEvent) => {
        if (e && paymentMethod === 'upi_app' && subStep === 'instructions') {
            // Let the <a> tag trigger the deep link, but we also update state
            setSubStep('action');
            return;
        }

        if (paymentMethod === 'upi_app') {
            if (subStep === 'action') {
                setSubStep('verification');
            } else if (subStep === 'verification') {
                if (transactionId.length !== 12 || !/^\d+$/.test(transactionId)) {
                    showToast('Please enter a valid 12-digit UPI Transaction ID', 'error');
                    return;
                }
                handleFinalSubmission();
            }
        } else if (paymentMethod === 'upi_qr') {
            if (subStep === 'instructions') {
                setSubStep('action');
            } else if (subStep === 'action') {
                setSubStep('verification');
            } else if (subStep === 'verification') {
                if (transactionId.length !== 12 || !/^\d+$/.test(transactionId)) {
                    showToast('Please enter a valid 12-digit UPI Transaction ID', 'error');
                    return;
                }
                handleFinalSubmission();
            }
        } else if (paymentMethod === 'cash') {
            if (subStep === 'instructions') {
                setSubStep('action');
            } else {
                handleFinalSubmission();
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            const prefix = '+91 ';
            if (!value.startsWith(prefix)) return;
            const afterPrefix = value.slice(prefix.length).replace(/[^0-9]/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, phone: prefix + afterPrefix }));
            return;
        }

        if (name === 'firstName' || name === 'lastName') {
            if (value.includes(' ')) return;
            setFormData(prev => ({ ...prev, [name]: value }));
            return;
        }

        if (name === 'govtId') {
            const formatted = formatGovtId(value);
            setFormData(prev => ({ ...prev, govtId: formatted }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleReRegister = () => {
        setIsRegistered(false);
        setRegistrationData(null);
        setTransactionId(''); // Reset for fresh start
        setStep('details');
    };

    if (isRegistered) {
        return (
            <PageTransition>
                <div className="register-container status-view">
                    {/* Cinematic Solar Background */}
                    <div className="solar-corona-background"></div>

                    <div className="status-header">
                        <div className={`status-icon-wrapper ${registrationData?.status}`}>
                            {registrationData?.status === 'confirmed' ? '✓' :
                                registrationData?.status === 'rejected' ? '✕' : '...'}
                        </div>
                        <h2 className="status-title">
                            {registrationData?.status === 'pending' && 'VERIFICATION PENDING'}
                            {registrationData?.status === 'confirmed' && 'MISSION CONFIRMED'}
                            {registrationData?.status === 'rejected' && 'MISSION REJECTED'}
                        </h2>
                    </div>

                    <div className="registration-details-card">
                        <div className="detail-row">
                            <span className="label">MISSION STATUS</span>
                            <span className={`value status-text ${registrationData?.status}`}>
                                {registrationData?.status?.toUpperCase()}
                            </span>
                        </div>
                        <div className="detail-row">
                            <span className="label">TICKET ID</span>
                            <span className="value highlight">{registrationData?.ticketId}</span>
                        </div>
                        {registrationData?.transactionId && (
                            <div className="detail-row">
                                <span className="label">TRANSACTION ID</span>
                                <span className="value mono">{registrationData.transactionId}</span>
                            </div>
                        )}
                        <div className="detail-row stack">
                            <span className="label">OBSERVATION STATION</span>
                            <span className="value">{registrationData?.college}</span>
                        </div>
                    </div>

                    <div className="status-feedback-box">
                        {registrationData?.status === 'pending' && (
                            <p>Our team is currently verifying your payment. This usually takes 2-4 hours. You'll receive your digital pass once approved.</p>
                        )}
                        {registrationData?.status === 'confirmed' && (
                            <p>Your observer status is active! You can now download your digital entry key from the dashboard.</p>
                        )}
                        {registrationData?.status === 'rejected' && (
                            <div className="rejection-note">
                                <p>Your payment verification failed. This could be due to an incorrect Transaction ID or payment mismatch.</p>
                                <p className="help-text">If your money was debited, please contact us with your payment proof.</p>
                            </div>
                        )}
                    </div>

                    <div className="status-actions">
                        {registrationData?.status === 'rejected' ? (
                            <>
                                <button className="primary-button" onClick={handleReRegister}>
                                    RE-REGISTER
                                </button>
                                <button className="secondary-button" onClick={() => navigate('/dashboard')}>
                                    GO TO DASHBOARD
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="primary-button" onClick={() => navigate('/dashboard')}>
                                    GO TO DASHBOARD
                                </button>
                                <button className="secondary-button" onClick={() => window.location.href = '/'}>
                                    RETURN TO HOME
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </PageTransition>
        );
    }


    const yearOptions = [
        { value: "FE", label: "First Year (FE)" },
        { value: "SE", label: "Second Year (SE)" },
        { value: "TE", label: "Third Year (TE)" },
        { value: "BE", label: "Final Year (BE)" }
    ];

    const majorOptions = majors.map(m => ({ value: m, label: m }));
    const collegeOptions = (collegesData as string[]).map(c => ({ value: c, label: c }));

    return (
        <PageTransition>
            <div className="register-container" onKeyDown={(e) => {
                if (e.key === 'Enter' && step === 'details' && !e.shiftKey) {
                    // Only trigger if no custom dropdown is open (they handle their own Enter)
                    const activeDropdown = document.querySelector('.searchable-input-wrapper.open');
                    if (!activeDropdown) {
                        handleNextStep();
                    }
                }
            }}>
                <Toast
                    {...toast}
                    onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
                />

                <div className="register-content">
                    <div className="form-header">
                        <h1 className="form-title">
                            {step === 'details' ? 'RESERVE YOUR ' : 'SECURE YOUR '}
                            <span className="highlight">SPOT</span>
                        </h1>
                        <p className="form-subtitle">
                            {step === 'details'
                                ? 'Join us for the astronomical event of the decade. Limited spots available for the main grounds.'
                                : 'Complete your transaction to finalize your reservation under the corona.'}
                        </p>
                    </div>

                    <div className="step-container">
                        <AnimatePresence mode="wait">
                            {step === 'details' ? (
                                <motion.form
                                    key="details-form"
                                    className="registration-form"
                                    onSubmit={handleNextStep}
                                    initial={{ x: 0, opacity: 1 }}
                                    exit={{ x: -100, opacity: 0 }}
                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                >
                                    <div className="form-grid">
                                        <div className="input-group">
                                            <label>FIRST NAME*</label>
                                            <input type="text" name="firstName" placeholder="Enter first name" required value={formData.firstName} onChange={handleChange} />
                                        </div>

                                        <div className="input-group">
                                            <label>LAST NAME*</label>
                                            <input type="text" name="lastName" placeholder="Enter last name" required value={formData.lastName} onChange={handleChange} />
                                        </div>

                                        <div className="input-group">
                                            <label>EMAIL ADDRESS*</label>
                                            <input type="email" name="email" placeholder="yourname@domain.com" required value={formData.email} onChange={handleChange} readOnly />
                                        </div>

                                        <div className="input-group">
                                            <label>CELL PHONE*</label>
                                            <input type="tel" name="phone" placeholder="+91 XXXXX XXXXX" required value={formData.phone} onChange={handleChange} />
                                        </div>

                                        <SearchableDropdown label="COLLEGE*" name="college" options={collegeOptions} value={formData.college} onChange={handleDropdownChange} placeholder="Start typing college name..." required />
                                        <SearchableDropdown label="MAJOR*" name="major" options={majorOptions} value={formData.major} onChange={handleDropdownChange} placeholder="Start typing major..." required />

                                        <div className="input-group">
                                            <label>STUDENT ID NUMBER</label>
                                            <input type="text" name="studentId" placeholder="Enter your student ID number" value={formData.studentId} onChange={handleChange} />
                                        </div>

                                        <SearchableDropdown label="YEAR OF STUDY*" name="year" options={yearOptions} value={formData.year} onChange={handleDropdownChange} placeholder="Select Year" required />

                                        <div className="input-group full-width">
                                            <label>GOVERNMENT ID*</label>
                                            <div className="govt-id-input-wrapper">
                                                <input type="text" name="govtId" placeholder="Aadhar Card / PAN Card" required value={formData.govtId} onChange={handleChange} />
                                                <p className="id-hint">Format will auto-adjust as you type. We only store the last 4 characters for security.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-footer">
                                        <p className="disclaimer">By registering, you agree to follow all safety protocols, including wearing certified solar glasses during the event.</p>
                                        <button type="submit" className="submit-button primary">
                                            <span>PROCEED TO PAY</span>
                                            <div className="button-glow"></div>
                                        </button>
                                    </div>
                                </motion.form>
                            ) : (
                                <motion.div
                                    key="payment-form"
                                    className="registration-form payment-form"
                                    initial={{ x: 100, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                >
                                    <div className="payment-summary">
                                        <h3>RESERVATION SUMMARY</h3>
                                        <div className="summary-item">
                                            <span>Registration Type</span>
                                            <span>General Admission</span>
                                        </div>
                                        <div className="summary-item">
                                            <span>Price per Spot</span>
                                            <span>₹{REGISTRATION_FEE.toFixed(2)}</span>
                                        </div>
                                        <div className="summary-total">
                                            <span>Total Amount Due</span>
                                            <span>₹{REGISTRATION_FEE.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="payment-methods">
                                        <label>SELECT PAYMENT METHOD</label>
                                        <div className="payment-grid">
                                            <button
                                                className={`payment-card ${paymentMethod === 'upi_app' ? 'selected' : ''}`}
                                                onClick={() => handleMethodChange('upi_app')}
                                                type="button"
                                            >
                                                <div className="method-icon">
                                                    <img src="UPI-01.png" alt="UPI" />
                                                </div>
                                                <div className="method-name">UPI App</div>
                                            </button>
                                            <button
                                                className={`payment-card ${paymentMethod === 'upi_qr' ? 'selected' : ''}`}
                                                onClick={() => handleMethodChange('upi_qr')}
                                                type="button"
                                            >
                                                <div className="method-icon">
                                                    <img src="QR-01.png" alt="QR" />
                                                </div>
                                                <div className="method-name">UPI QR</div>
                                            </button>
                                            <button
                                                className={`payment-card ${paymentMethod === 'cash' ? 'selected' : ''}`}
                                                onClick={() => handleMethodChange('cash')}
                                                type="button"
                                            >
                                                <div className="method-icon">
                                                    <img src="cash.png" alt="Cash" />
                                                </div>
                                                <div className="method-name">Cash</div>
                                            </button>
                                        </div>
                                    </div>

                                    {!(paymentMethod === 'cash' && subStep === 'instructions') && (
                                        <div className="instructions-area" key={`${paymentMethod}-${subStep}`}>
                                            {paymentMethod === 'upi_app' && (
                                                <>
                                                    <div className="instruction-box">
                                                        {subStep === 'instructions' && (
                                                            <ul>
                                                                <li>Click the <strong>'PAY NOW'</strong> button below to open your preferred UPI application.</li>
                                                                <li>The registered amount of <strong>₹{REGISTRATION_FEE}</strong> will be auto-filled.</li>
                                                                <li>Complete the payment and <strong>do not close this browser tab</strong>.</li>
                                                                <li>Once payment is successful, return here and click the <strong>'PROCEED'</strong> button.</li>
                                                            </ul>
                                                        )}
                                                        {subStep === 'action' && (
                                                            <ul>
                                                                <li>Your payment app should be open now.</li>
                                                                <li>Complete the transaction in your app.</li>
                                                                <li>After completion, return here and click <strong>PROCEED</strong> to verify.</li>
                                                            </ul>
                                                        )}
                                                        {subStep === 'verification' && (
                                                            <ul>
                                                                <li>Please enter the <strong>12-digit UPI Transaction ID</strong> from your payment confirmation screen.</li>
                                                                <li>This is required to verify your payment and finalize your spot.</li>
                                                            </ul>
                                                        )}
                                                    </div>
                                                    {subStep === 'instructions' && (
                                                        <label className="checkbox-container">
                                                            <input type="checkbox" checked={instructionsRead} onChange={(e) => setInstructionsRead(e.target.checked)} />
                                                            <span className="checkmark"></span>
                                                            I have read all the instructions
                                                        </label>
                                                    )}
                                                </>
                                            )}

                                            {paymentMethod === 'upi_qr' && (
                                                <>
                                                    <div className="instruction-box">
                                                        {subStep === 'instructions' && (
                                                            <ul>
                                                                <li>Acknowledge these instructions to enable the <strong>'SHOW QR'</strong> button.</li>
                                                                <li>Click <strong>'SHOW QR'</strong> to reveal your unique payment code.</li>
                                                                <li>Scan and pay the exact amount of <strong>₹{REGISTRATION_FEE}</strong>.</li>
                                                                <li>Once successful, return here and click <strong>'PROCEED'</strong> to verify.</li>
                                                            </ul>
                                                        )}
                                                        {subStep === 'action' && (
                                                            <ul>
                                                                <li>Scan the generated QR code below.</li>
                                                                <li>Complete the payment of <strong>₹{REGISTRATION_FEE}</strong>.</li>
                                                                <li>After successful payment, click <strong>PROCEED</strong> to enter details.</li>
                                                            </ul>
                                                        )}
                                                        {subStep === 'verification' && (
                                                            <ul>
                                                                <li>Enter the <strong>12-digit UPI Transaction ID</strong> visible in your app's payment history.</li>
                                                                <li>We will use this ID to verify your transaction at the backend.</li>
                                                            </ul>
                                                        )}
                                                    </div>
                                                    {subStep === 'instructions' && (
                                                        <label className="checkbox-container">
                                                            <input type="checkbox" checked={instructionsRead} onChange={(e) => setInstructionsRead(e.target.checked)} />
                                                            <span className="checkmark"></span>
                                                            I have read all the instructions
                                                        </label>
                                                    )}
                                                    {subStep !== 'instructions' && instructionsRead && (
                                                        <div className="qr-display-area">
                                                            <div className="qr-frame">
                                                                <img
                                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=${UPI_IDS[0]}&pn=SolarSpotEvent&am=${REGISTRATION_FEE}&cu=INR`)}`}
                                                                    alt="Payment QR"
                                                                />
                                                            </div>
                                                            <p className="qr-hint">Scan to pay ₹{REGISTRATION_FEE.toFixed(2)}</p>
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            {paymentMethod === 'cash' && subStep === 'action' && (
                                                <div className="instruction-box">
                                                    <ul>
                                                        <li>Clicking <strong>'COMPLETE REGISTRATION'</strong> will reserve your spot temporarily.</li>
                                                        <li>You must carry exactly <strong>₹{REGISTRATION_FEE}</strong> in cash to the event venue.</li>
                                                        <li>Visit the <strong>Registration Desk</strong> at the main entrance for verification.</li>
                                                        <li>Your admission will be officially confirmed only after the physical cash handover.</li>
                                                    </ul>
                                                </div>
                                            )}

                                            {subStep === 'verification' && (
                                                <div className="input-group transaction-id-group">
                                                    <label>UPI TRANSACTION ID*</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter 12 digit ID"
                                                        maxLength={12}
                                                        value={transactionId}
                                                        onChange={(e) => setTransactionId(e.target.value.replace(/[^0-9]/g, ''))}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="form-footer">
                                        <button className="secondary-button" onClick={() => setStep('details')}>
                                            GO BACK
                                        </button>

                                        {paymentMethod === 'upi_app' && subStep === 'instructions' && (
                                            <a
                                                href={`upi://pay?pa=${UPI_IDS[0]}&pn=SolarSpotEvent&am=${REGISTRATION_FEE}&cu=INR`}
                                                className={`submit-button primary ${!instructionsRead ? 'disabled' : ''}`}
                                                onClick={(e) => !instructionsRead ? e.preventDefault() : handlePaymentAction(e)}
                                            >
                                                <span>PAY NOW</span>
                                                <div className="button-glow"></div>
                                            </a>
                                        )}

                                        {((paymentMethod === 'upi_app' && subStep !== 'instructions') ||
                                            (paymentMethod === 'upi_qr') ||
                                            (paymentMethod === 'cash')) && (
                                                <button
                                                    className={`submit-button primary ${(paymentMethod === 'upi_qr' && subStep === 'instructions' && !instructionsRead) ? 'disabled' : ''}`}
                                                    onClick={() => handlePaymentAction()}
                                                    disabled={(paymentMethod === 'upi_qr' && subStep === 'instructions' && !instructionsRead)}
                                                >
                                                    <span>
                                                        {subStep === 'verification' || (paymentMethod === 'cash' && subStep === 'action')
                                                            ? 'COMPLETE REGISTRATION'
                                                            : (paymentMethod === 'upi_qr' && subStep === 'instructions' ? 'SHOW QR' : 'PROCEED')}
                                                    </span>
                                                    <div className="button-glow"></div>
                                                </button>
                                            )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Register;
