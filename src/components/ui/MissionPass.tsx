import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { generateSecurePassToken } from '../../utils/security';
import './MissionPass.css';

interface MissionPassProps {
    userData: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        ticketId: string;
    };
    onClose: () => void;
    directDownload?: boolean;
}

const MissionPass: React.FC<MissionPassProps> = ({ userData, onClose, directDownload = false }) => {
    const passRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const [qrValue, setQrValue] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [downloadTriggered, setDownloadTriggered] = useState(false);

    useEffect(() => {
        const prepareToken = async () => {
            const token = await generateSecurePassToken({
                uid: userData.ticketId,
                name: `${userData.firstName} ${userData.lastName}`,
                email: userData.email,
                phone: userData.phone
            });
            setQrValue(token);
        };
        prepareToken();
    }, [userData]);

    const handleDownload = async () => {
        if (!passRef.current) return;
        setIsGenerating(true);
        try {
            const canvas = await html2canvas(passRef.current, {
                scale: 2, // Optimized for 2x quality while keeping size low
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            // Convert to JPEG with compression for significantly smaller size
            const imgData = canvas.toDataURL('image/jpeg', 0.8);

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true // Enable internal PDF compression
            });

            const imgWidth = 140; // mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const x = (210 - imgWidth) / 2; // Centers horizontally on A4
            const y = 30; // Margin from top

            pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight, undefined, 'FAST');
            pdf.save(`SolarSpot_Pass_${userData.ticketId}.pdf`);

            if (directDownload) {
                onClose();
            }
        } catch (error) {
            console.error("Error generating mission PDF:", error);
            if (directDownload) onClose();
        } finally {
            setIsGenerating(false);
        }
    };

    // Auto-scroll to loader for direct download visibility
    useEffect(() => {
        if (directDownload && cardRef.current) {
            cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [directDownload]);

    // Auto-trigger for direct download
    useEffect(() => {
        if (directDownload && qrValue && !downloadTriggered && !isGenerating) {
            setDownloadTriggered(true);
            // Small timeout to ensure image rendering
            setTimeout(() => {
                handleDownload();
            }, 500);
        }
    }, [qrValue, directDownload, downloadTriggered, isGenerating]);

    if (directDownload) {
        return (
            <div className="pass-modal-overlay">
                <div className="download-status-card" ref={cardRef}>
                    <div className="scanning-loader"></div>
                    <h3>INITIALIZING MISSION EXTRACTION</h3>
                    <p>Generating your encrypted digital pass...</p>
                </div>

                {/* Render off-screen for capture */}
                <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
                    <div className="mission-pass" ref={passRef}>
                        <div className="pass-border-container">
                            <div className="corner tl"></div>
                            <div className="corner tr"></div>
                            <div className="corner bl"></div>
                            <div className="corner br"></div>

                            <div className="pass-inner">
                                <div className="pass-header">
                                    <img src="/Logo_without_background.png" alt="OrbitX" className="pass-logo" />
                                    <div className="pass-mission-title">
                                        <span>CHASING THE</span>
                                        <h2>SHADOW</h2>
                                    </div>
                                </div>

                                <div className="pass-details">
                                    <p><strong>Full Name:</strong> {userData.firstName} {userData.lastName}</p>
                                    <p><strong>Email Address:</strong> {userData.email}</p>
                                    <p><strong>Cell Phone:</strong> {userData.phone}</p>
                                </div>

                                <div className="pass-separator">
                                    <div className="line"></div>
                                    <div className="diamond">✦</div>
                                    <div className="line"></div>
                                </div>

                                <div className="pass-qr-area">
                                    {qrValue && (
                                        <div className="qr-wrapper">
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrValue)}&color=1e3c72`}
                                                alt="Secure Pass QR"
                                                className="qr-img"
                                                onLoad={() => { }} // Could trigger here too
                                            />
                                        </div>
                                    )}
                                    <span className="ticket-id-display">{userData.ticketId}</span>
                                </div>

                                <div className="pass-footer">
                                    <p>VALID FOR ADMISSION AT ZEAL INSTITUTE GROUND</p>
                                    <p className="security-tag">ENCRYPTED MISSION TOKEN • DO NOT TAMPER</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pass-modal-overlay">
            <div className="pass-modal-content">
                <button className="close-pass" onClick={onClose}>✕</button>

                <div className="pass-scroll-container">
                    <div className="mission-pass" ref={passRef}>
                        <div className="pass-border-container">
                            <div className="corner tl"></div>
                            <div className="corner tr"></div>
                            <div className="corner bl"></div>
                            <div className="corner br"></div>

                            <div className="pass-inner">
                                <div className="pass-header">
                                    <img src="/Logo_without_background.png" alt="OrbitX" className="pass-logo" />
                                    <div className="pass-mission-title">
                                        <span>CHASING THE</span>
                                        <h2>SHADOW</h2>
                                    </div>
                                </div>

                                <div className="pass-details">
                                    <p><strong>Full Name:</strong> {userData.firstName} {userData.lastName}</p>
                                    <p><strong>Email Address:</strong> {userData.email}</p>
                                    <p><strong>Cell Phone:</strong> {userData.phone}</p>
                                </div>

                                <div className="pass-separator">
                                    <div className="line"></div>
                                    <div className="diamond">✦</div>
                                    <div className="line"></div>
                                </div>

                                <div className="pass-qr-area">
                                    {qrValue && (
                                        <div className="qr-wrapper">
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrValue)}&color=1e3c72`}
                                                alt="Secure Pass QR"
                                                className="qr-img"
                                            />
                                        </div>
                                    )}
                                    <span className="ticket-id-display">{userData.ticketId}</span>
                                </div>

                                <div className="pass-footer">
                                    <p>VALID FOR ADMISSION AT ZEAL INSTITUTE GROUND</p>
                                    <p className="security-tag">ENCRYPTED MISSION TOKEN • DO NOT TAMPER</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pass-actions">
                    <button
                        className={`download-pass-btn ${isGenerating ? 'loading' : ''}`}
                        onClick={handleDownload}
                        disabled={isGenerating}
                    >
                        {isGenerating ? 'INITIALIZING SCAN...' : 'DOWNLOAD DIGITAL PASS (PDF)'}
                        <div className="btn-glow"></div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MissionPass;
