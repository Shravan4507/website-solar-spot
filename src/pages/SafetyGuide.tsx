import { motion } from 'framer-motion';
import PageTransition from '../components/effects/PageTransition';
import './SafetyGuide.css';

const SafetyGuide = () => {
    const protocols = [
        {
            title: "SOLAR OBSERVATION SAFETY",
            icon: "🔭",
            content: "NEVER look directly at the Sun without a certified solar filter. Standard sunglasses are insufficient for protection during the event phase.",
            warning: "PERMANENT EYE DAMAGE RISK"
        },
        {
            title: "EQUIPMENT PROTECTION",
            icon: "🛡️",
            content: "Ensure all optical equipment (cameras, binoculars, telescopes) is fitted with proper ISO-certified solar filters BEFORE exposure to sunlight.",
            warning: "SENSOR DAMAGE PREVENTION"
        },
        {
            title: "CROWD MANAGEMENT",
            icon: "👥",
            content: "Stay within the designated observation sectors at Zeal Institute Ground. Do not cross the perimeter tapes or enter restricted technical zones.",
            warning: "STRICT PERIMETER CONTROL"
        },
        {
            title: "EMERGENCY PROTOCOLS",
            icon: "🚨",
            content: "In case of any medical or safety emergency, immediately contact the nearest Mission Control officer or head to the First Aid station near the entryway.",
            warning: "24/7 MEDICAL SUPPORT"
        },
        {
            title: "HYDRATION & CLIMATE",
            icon: "💧",
            content: "The event takes place in an open environment. Maintain high hydration levels and use UV protection (sunscreen/hats) throughout the mission.",
            warning: "HEAT EXPOSURE CAUTION"
        }
    ];

    return (
        <PageTransition>
            <div className="safety-guide-page">
                <div className="safety-overlay"></div>



                <main className="safety-content">
                    <motion.div
                        className="safety-intro"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="protocol-tag">SECURITY PROTOCOL 01</span>
                        <h1>OBSERVER SAFETY MISSION</h1>
                        <p>Protecting your sight and ensuring a secure observation environment is our primary directive. Please follow these mandates strictly.</p>
                    </motion.div>

                    <div className="protocols-grid">
                        {protocols.map((p, index) => (
                            <div
                                key={index}
                                className="protocol-card"
                            >
                                <div className="card-top">
                                    <span className="protocol-icon">{p.icon}</span>
                                    <h3>{p.title}</h3>
                                </div>
                                <p className="card-content">{p.content}</p>
                                <div className="card-footer">
                                    <span className="warning-label">WARNING:</span>
                                    <span className="warning-text">{p.warning}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="safety-footer-note">
                        <div className="seal-container">
                            <div className="seal-orbit"></div>
                            <img src="/Logo_without_background.png" alt="Mission Seal" className="filter-solar" />
                        </div>
                        <p>FAILURE TO ADHERE TO SAFETY DIRECTIVES MAY RESULT IN IMMEDIATE EXTRACTION FROM THE EVENT PERIMETER.</p>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
};

export default SafetyGuide;
