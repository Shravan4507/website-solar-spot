import { motion } from 'framer-motion';
import PageTransition from '../components/effects/PageTransition';
import './LegalPages.css';

const TermsOfService = () => {
    const mandates = [
        {
            id: "01",
            title: "MISSION ELIGIBILITY",
            content: "Access to the Solar Spot event is granted only to registered observers with a valid digital Mission Pass. Participants must adhere to the age and institutional requirements specified during registration."
        },
        {
            id: "02",
            title: "REGISTRATION & PASSES",
            content: "Mission Passes are unique to the registered individual and are non-transferable. Attempting to enter the perimeter with unauthorized or duplicated credentials will result in immediate extraction."
        },
        {
            id: "03",
            title: "CONDUCT & SAFETY MANDATES",
            content: "All observers must strictly follow the Official Safety Guide. Failure to use proper solar filters or comply with perimeter control measures may lead to permanent expulsion from the observation grounds."
        },
        {
            id: "04",
            title: "LIABILITY DISCLAIMER",
            content: "Mission Control and Zeal Institute are not responsible for equipment damage or personal injury resulting from failure to adhere to safety protocols or natural environment hazards."
        },
        {
            id: "05",
            title: "TERMINAL USAGE",
            content: "Unauthorized attempting to breach the Mission Control admin terminal or destabilize the event infrastructure will be met with legal protocols and blacklisting from future celestial operations."
        }
    ];

    return (
        <PageTransition>
            <div className="legal-page terms-of-service">
                <div className="legal-overlay"></div>
                <main className="legal-content">
                    <motion.div
                        className="legal-header"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="legal-tag">OFFICIAL DOCUMENTATION</span>
                        <h1>TERMS OF <span className="highlight">SERVICE</span></h1>
                        <p>Established mandates governing participation and conduct during the Solar Spot Celestial Event.</p>
                    </motion.div>

                    <div className="legal-grid">
                        {mandates.map((mandate) => (
                            <div key={mandate.id} className="legal-card">
                                <h3>{mandate.title}</h3>
                                <p>{mandate.content}</p>
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

export default TermsOfService;
