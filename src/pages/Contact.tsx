import { motion } from 'framer-motion';
import PageTransition from '../components/effects/PageTransition';
import './Contact.css';

const Contact = () => {
    const teamMembers = [
        {
            name: "Gauri Kshirsagar",
            role: "President",
            contact: "+91 94225 17304",
            email: "president.orbitx@zealeducation.com",
            image: "/members/Gauri.jpg"
        },
        {
            name: "Antriksh Shah",
            role: "Chairman",
            contact: "+91 62694 03566",
            email: "chairman.orbix@zealeducation.com",
            image: "/members/Antriksh.jpeg"
        }
    ];

    return (
        <PageTransition>
            <div className="contact-page">
                <header className="contact-header">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        MISSION CONTROL SUPPORT
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="contact-subtitle"
                    >
                        Direct frequency to the core team for registration and payment assistance.
                    </motion.p>
                </header>

                <div className="contact-cards-container">
                    {teamMembers.map((member, index) => (
                        <motion.div
                            key={index}
                            className="team-card cinematic"
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: index * 0.2 + 0.4, duration: 0.6, ease: "easeOut" }}
                        >
                            <div className="card-image-wrapper">
                                <img src={member.image} alt={member.name} className="member-hero-img" />
                                <div className="image-gradient-overlay"></div>
                                <div className="overlay-content">
                                    <h2 className="member-name">{member.name}</h2>
                                    <p className="member-role">{member.role}</p>
                                </div>
                            </div>

                            <div className="card-body">
                                <div className="contact-details">
                                    <div className="detail-item">
                                        <span className="detail-icon">Cell Phone</span>
                                        <span className="detail-text">{member.contact}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-icon">Email</span>
                                        <span className="detail-text">{member.email}</span>
                                    </div>
                                </div>

                                <button
                                    className="contact-action-btn"
                                    onClick={() => window.location.href = `tel:${member.contact}`}
                                >
                                    Call {member.name}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="contact-footer-note">
                    <span className="status-dot"></span>
                    COMMUNICATIONS CHANNEL ACTIVE • 24/7 SUPPORT DURING PEAK PHASES
                </div>
            </div>
        </PageTransition>
    );
};

export default Contact;
