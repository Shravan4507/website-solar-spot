import { motion } from 'framer-motion';
import PageTransition from '../components/effects/PageTransition';
import './LegalPages.css';

const PrivacyPolicy = () => {
    const sections = [
        {
            id: "01",
            title: "DATA ACQUISITION PROTOCOLS",
            content: "We collect essential observer metrics including your Full Name, Email Address, Contact Number, and Institutional Affiliation during the mission registration sequence."
        },
        {
            id: "02",
            title: "PURPOSE OF DATA UTILIZATION",
            content: "Your data is strictly utilized for generated encrypted Mission Passes, communicating essential celestial event updates, and ensuring secure perimeter access at the Zeal Institute observation grounds."
        },
        {
            id: "03",
            title: "SECURITY INFRASTRUCTURE",
            content: "All observer records are stored using high-level encryption via Firebase infrastructure. We do not transmit or sell mission data to any third-party sectors or commercial entities."
        },
        {
            id: "04",
            title: "OBSERVER RIGHTS",
            content: "You maintain full command over your personal data. You may request record deletion or correction at any time by contacting Mission Control directly."
        },
        {
            id: "05",
            title: "COOKIES & TELEMETRY",
            content: "Our terminal uses minimal essential cookies to maintain your authentication state and ensure stable mission operations during your session."
        }
    ];

    return (
        <PageTransition>
            <div className="legal-page privacy-policy">
                <div className="legal-overlay"></div>
                <main className="legal-content">
                    <motion.div
                        className="legal-header"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="legal-tag">OFFICIAL DOCUMENTATION</span>
                        <h1>PRIVACY <span className="highlight">POLICY</span></h1>
                        <p>Established protocols for the protection and management of observer data for the Solar Spot Mission.</p>
                    </motion.div>

                    <div className="legal-grid">
                        {sections.map((section) => (
                            <div key={section.id} className="legal-card">
                                <h3>{section.title}</h3>
                                <p>{section.content}</p>
                            </div>
                        ))}
                    </div>

                    <div className="legal-footer">
                        <div className="seal-container">
                            <img src="/Logo_without_background.png" alt="Mission Seal" className="filter-solar" />
                        </div>
                        <p>LAST UPDATED: FEBRUARY 2026 • MISSION CONTROL ENFORCED</p>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
};

export default PrivacyPolicy;
