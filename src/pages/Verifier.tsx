import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyPassToken } from '../utils/security';
import PageTransition from '../components/effects/PageTransition';
import { useNavigate } from 'react-router-dom';
import './Verifier.css';

interface VerifiedUser {
    'First Name': string;
    'Last Name': string;
    'Email': string;
    'Phone': string;
    'Ticket ID': string;
    [key: string]: any;
}

const Verifier: React.FC = () => {
    const navigate = useNavigate();
    const [manifest, setManifest] = useState<Record<string, VerifiedUser>>({});
    const [isManifestLoaded, setIsManifestLoaded] = useState(false);
    const [scanResult, setScanResult] = useState<{ status: 'success' | 'error' | 'duplicate', message: string, user?: VerifiedUser } | null>(null);
    const [scannedTickets, setScannedTickets] = useState<Set<string>>(new Set());
    const [isDragging, setIsDragging] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);

    // PERSISTENCE: Load from LocalStorage on mount
    useEffect(() => {
        const savedManifest = localStorage.getItem('mission_manifest');
        const savedScanned = localStorage.getItem('scanned_tickets');

        if (savedManifest) {
            try {
                setManifest(JSON.parse(savedManifest));
                setIsManifestLoaded(true);
            } catch (e) {
                console.error("Failed to load saved manifest", e);
            }
        }

        if (savedScanned) {
            try {
                setScannedTickets(new Set(JSON.parse(savedScanned)));
            } catch (e) {
                console.error("Failed to load scanned logs", e);
            }
        }
    }, []);

    // PERSISTENCE: Save scannedTickets whenever it changes
    useEffect(() => {
        if (scannedTickets.size > 0) {
            localStorage.setItem('scanned_tickets', JSON.stringify(Array.from(scannedTickets)));
        }
    }, [scannedTickets]);

    // Unified file processing logic
    const processFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                const manifestMap: Record<string, VerifiedUser> = {};

                // Assuming the JSON format from our Export (Array of objects)
                (json as VerifiedUser[]).forEach(user => {
                    const tid = user['Ticket ID']?.toString().trim().toUpperCase();
                    if (tid) manifestMap[tid] = user;
                });

                setManifest(manifestMap);
                setIsManifestLoaded(true);
                // PERSISTENCE: Save manifest
                localStorage.setItem('mission_manifest', JSON.stringify(manifestMap));
            } catch {
                alert("Invalid JSON file. Please upload a valid Mission Manifest.");
            }
        };
        reader.readAsText(file);
    };

    // Handle JSON Manifest Upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type === "application/json") {
            processFile(file);
        } else {
            alert("Please drop a valid JSON file.");
        }
    };

    useEffect(() => {
        if (isManifestLoaded && !scannerRef.current) {
            const html5QrCode = new Html5Qrcode("reader");

            html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                },
                onScanSuccess,
                onScanError
            ).catch(err => {
                console.error("Sensor ignition failed:", err);
            });

            scannerRef.current = html5QrCode;
        }

        return () => {
            if (scannerRef.current) {
                if (scannerRef.current.isScanning) {
                    scannerRef.current.stop().catch(e => console.error("Scanner stop error:", e));
                }
                scannerRef.current = null;
            }
        };
    }, [isManifestLoaded]);

    async function onScanSuccess(decodedText: string) {
        // Guard: If there's an active result, don't overwrite it until manual reset
        if (scanResult) return;

        // 1. Decrypt and Verify Digital Signature
        const decodedData = await verifyPassToken(decodedText);

        if (!decodedData) {
            setScanResult({
                status: 'error',
                message: "CRYPTOGRAPHIC FAILURE: SIGNATURE INVALID OR TAMPERED"
            });
            return;
        }

        const ticketId = decodedData.uid?.toString().trim().toUpperCase();
        console.log("Verification Attempt:", { ticketId, manifestCount: Object.keys(manifest).length });

        // 2. Check for Duplicate Entry (Offline Guard)
        if (scannedTickets.has(ticketId)) {
            setScanResult({
                status: 'duplicate',
                message: "SECURITY ALERT: OBSERVER ALREADY REGISTERED AT GATE",
                user: manifest[ticketId]
            });
            return;
        }

        // 3. Match against Offline Manifest (Case Insensitive)
        const userInManifest = manifest[ticketId];
        if (userInManifest) {
            setScannedTickets(prev => new Set(prev).add(ticketId));
            setScanResult({
                status: 'success',
                message: "IDENTITY VERIFIED: ACCESS GRANTED",
                user: userInManifest
            });
        } else {
            console.warn("Ticket ID mismatch:", { scanned: ticketId, manifestKeys: Object.keys(manifest) });
            setScanResult({
                status: 'error',
                message: `MANIFEST ERROR: TICKET [${ticketId}] NOT FOUND IN DATABASE`
            });
        }
    }

    function onScanError(_err: any) {
        // Errors are common while looking for QR, we ignore them to keep scanning smooth
    }

    const handleResetManifest = () => {
        if (window.confirm("CAUTION: This will clear the entire local manifest and scan logs. Continue?")) {
            localStorage.removeItem('mission_manifest');
            localStorage.removeItem('scanned_tickets');
            setManifest({});
            setScannedTickets(new Set());
            setIsManifestLoaded(false);
            if (scannerRef.current) {
                if (scannerRef.current.isScanning) {
                    scannerRef.current.stop();
                }
                scannerRef.current = null;
            }
        }
    };

    return (
        <PageTransition>
            <div className="verifier-page">
                <header className="terminal-nav">
                    <div className="nav-brand">TICKET VERIFIER <span className="version">V1.0</span></div>
                    <button className="nav-exit" onClick={() => navigate('/admin-dashboard')}>EXIT TERMINAL</button>
                </header>

                {!isManifestLoaded ? (
                    <div
                        className="manifest-upload-zone"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <motion.div
                            className={`upload-card ${isDragging ? 'dragging' : ''}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="upload-icon">📥</div>
                            <h2>INITIALIZE MANIFEST</h2>
                            <p>Upload or <strong>DRAG & DROP</strong> the confirmed observer manifest (JSON) to synchronize the terminal.</p>
                            <label className="custom-file-upload">
                                <input type="file" accept=".json" onChange={handleFileUpload} />
                                CHOOSE MANIFEST FILE
                            </label>
                            <div className="offline-badge">OFFLINE VERIFICATION MODE</div>
                        </motion.div>
                    </div>
                ) : (
                    <div className="verifier-grid">
                        <section className="scanner-column">
                            <div className="column-label">OPTICAL SCANNER</div>
                            <div className="scanner-hud">
                                <div id="reader"></div>
                                <div className="scanner-frame">
                                    <div className="corner tl"></div><div className="corner tr"></div>
                                    <div className="corner bl"></div><div className="corner br"></div>
                                </div>
                            </div>

                            <div className="terminal-stats">
                                <div className="stat-pill">
                                    <label>LOADED</label>
                                    <span className="val">{Object.keys(manifest).length}</span>
                                </div>
                                <div className="stat-pill">
                                    <label>VERIFIED</label>
                                    <span className="val highlight">{scannedTickets.size}</span>
                                </div>
                            </div>
                        </section>

                        <section className="results-column">
                            <div className="column-label">VERIFICATION STATUS</div>
                            <AnimatePresence mode="wait">
                                {scanResult ? (
                                    <motion.div
                                        key={scanResult.status}
                                        className={`scan-result-card ${scanResult.status}`}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <div className="result-header">
                                            <span className="status-label">{scanResult.status.toUpperCase()}</span>
                                            <h3>{scanResult.message}</h3>
                                        </div>

                                        {scanResult.user && (
                                            <div className="user-details">
                                                <div className="detail-group">
                                                    <label>NAME</label>
                                                    <div className="value">{scanResult.user['First Name']} {scanResult.user['Last Name']}</div>
                                                </div>
                                                <div className="detail-grid">
                                                    <div className="detail-group">
                                                        <label>PHONE</label>
                                                        <div className="value">{scanResult.user.Phone}</div>
                                                    </div>
                                                    <div className="detail-group">
                                                        <label>TICKET ID</label>
                                                        <div className="value mono">{scanResult.user['Ticket ID']}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <button className="next-scan-btn" onClick={() => setScanResult(null)}>
                                            READY FOR NEXT SCAN
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        className="scanner-idle"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <div className="waiting-spinner"></div>
                                        <p>AWAITING MISSION PASS</p>
                                        <span>Position the QR code within the scanner frame</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <footer className="terminal-meta">
                                <div className="sys-info">
                                    <span>GATE: 01</span>
                                    <span className="separator">/</span>
                                    <span>TERMINAL: ACTIVE</span>
                                </div>
                                <button className="purge-btn" onClick={handleResetManifest}>
                                    PURGE DATA
                                </button>
                            </footer>
                        </section>
                    </div>
                )}
            </div>
        </PageTransition>
    );
};

export default Verifier;
