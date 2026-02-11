import PageTransition from '../components/effects/PageTransition';
import './VenueMap.css';

const VenueMap = () => {
    const googleMapsLink = "https://www.google.com/maps/place/Zeal+College+of+Engineering+and+Research/@18.4487769,73.823618,790m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3bc2be933201c149:0x1c055d83993ff72b!8m2!3d18.4487769!4d73.8261929!16s%2Fg%2F11c32kxhxb!5m1!1e2?entry=ttu&g_ep=EgoyMDI2MDIwOC4wIKXMDSoASAFQAw%3D%3D";

    return (
        <PageTransition>
            <div className="venue-map-page">
                <div className="map-overlay"></div>
                <main className="map-content">
                    <div className="map-header">
                        <span className="map-tag">MISSION TOPOGRAPHY</span>
                        <h1>VENUE <span className="highlight">DEPLOYMENT</span></h1>
                        <p>Locate your designated sector at the Zeal Institute Ground for the Solar Spot Mission.</p>

                        <div className="maps-cta">
                            <a href={googleMapsLink} target="_blank" rel="noopener noreferrer" className="external-map-btn">
                                OPEN EARTH NAVIGATION (G-MAPS)
                            </a>
                        </div>
                    </div>

                    <div className="map-visualization">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3577.789813076164!2d73.8261929!3d18.4487769!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2be933201c149%3A0x1c055d83993ff72b!2sZeal%20College%20of%20Engineering%20and%20Research!5e1!3m2!1sen!2sin!4v1770807670655!5m2!1sen!2sin"
                            width="100%"
                            height="450"
                            style={{ border: 0, borderRadius: '2rem' }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Zeal Institute Ground Map"
                        ></iframe>
                        <div className="ground-text">ZEAL INSTITUTE SECTOR-PUNE</div>
                    </div>

                    <div className="map-footer">
                        <div className="seal-container">
                            <img src="/Logo_without_background.png" alt="Mission Seal" className="filter-solar" />
                        </div>
                        <p>PERIMETER CONTROL ENFORCED • ALWAYS CARRY YOUR MISSION PASS</p>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
};

export default VenueMap;
