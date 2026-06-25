import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
    LogOut, Info, ShieldCheck, PlayCircle, Clock, Send,
    ChevronLeft, ChevronRight, Code, CheckCircle2, XCircle,
    Award, AlertTriangle, Trophy, Home, Loader2, Play,
    Circle, Square, Type, Camera
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://Shreyansh6726-zest.hf.space';

const Test = () => {
    const { testId } = useParams();
    const navigate = useNavigate();

    // Core state
    const [testData, setTestData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [phase, setPhase] = useState('lobby'); // lobby | testing | results
    const pageTitle = testData?.examName ? `Zest - ${testData.examName}` : 'Zest - Test';

    // Test interaction state
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [warningsCount, setWarningsCount] = useState(0);
    const [warningPrompt, setWarningPrompt] = useState(null);
    const [warningLimitExceeded, setWarningLimitExceeded] = useState(false);
    const [yellowWarningsCount, setYellowWarningsCount] = useState(0);
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState('');
    const [faceWarningVisible, setFaceWarningVisible] = useState(false);
    const [warningCorner, setWarningCorner] = useState('top-right');
    const [cameraWidgetPos, setCameraWidgetPos] = useState({ right: 16, bottom: 16 });
    const [isDraggingCamera, setIsDraggingCamera] = useState(false);
    const [cameraDevices, setCameraDevices] = useState([]);
    const [selectedCameraDeviceId, setSelectedCameraDeviceId] = useState('');

    // Exit fullscreen on test end
    useEffect(() => {
        if (phase === 'results' && document.fullscreenElement) {
            if (document.exitFullscreen) document.exitFullscreen().catch(() => { });
        }
    }, [phase]);

    // Code execution
    const [codeRunning, setCodeRunning] = useState(false);
    const [codeResults, setCodeResults] = useState({});

    // Results
    const [results, setResults] = useState(null);

    const timerRef = useRef(null);
    const hasSubmitted = useRef(false);
    const submitFnRef = useRef(null);
    const warningPromptOpenRef = useRef(false);
    const audioContextRef = useRef(null);
    const videoRef = useRef(null);
    const overlayCanvasRef = useRef(null);
    const streamRef = useRef(null);
    const detectorRef = useRef(null);
    const detectorLoopRef = useRef(null);
    const detectorLoopRunnerRef = useRef(null);
    const overlayLoopRef = useRef(null);
    const prevFaceCenterRef = useRef(null);
    const lastFaceBoxRef = useRef(null);
    const faceMotionStreakRef = useRef({ direction: 0, count: 0 });
    const faceWarningCooldownRef = useRef(0);
    const mediaPipeReadyRef = useRef(false);
    const yellowWarningsRef = useRef(0);
    const dragStateRef = useRef({ startX: 0, startY: 0, startRight: 16, startBottom: 16 });
    const faceOverlayNoiseRef = useRef(0);

    const drawFaceOverlay = useCallback((faceBox, video) => {
        const canvas = overlayCanvasRef.current;
        if (!canvas || !video) return;

        const rect = video.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.max(1, Math.round(rect.width * dpr));
        canvas.height = Math.max(1, Math.round(rect.height * dpr));
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, rect.width, rect.height);

        if (!faceBox) return;

        const scaleX = rect.width / video.videoWidth;
        const scaleY = rect.height / video.videoHeight;
        const wobble = Math.sin(faceOverlayNoiseRef.current * 0.18) * 1.5;
        const wobbleY = Math.cos(faceOverlayNoiseRef.current * 0.14) * 1.1;
        const x = (faceBox.originX * scaleX) + wobble;
        const y = (faceBox.originY * scaleY) + wobbleY;
        const w = faceBox.width * scaleX;
        const h = faceBox.height * scaleY;
        const pad = Math.min(w, h) * 0.08;
        const frameX = x - pad;
        const frameY = y - pad;
        const frameW = w + pad * 2;
        const frameH = h + pad * 2;

        ctx.save();
        ctx.shadowColor = 'rgba(0, 242, 254, 0.55)';
        ctx.shadowBlur = 14;
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.25)';
        ctx.lineWidth = 1;
        ctx.strokeRect(frameX, frameY, frameW, frameH);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 3;
        const cornerSize = Math.min(22, Math.max(12, frameW * 0.12));
        ctx.beginPath(); ctx.moveTo(frameX, frameY + cornerSize); ctx.lineTo(frameX, frameY); ctx.lineTo(frameX + cornerSize, frameY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(frameX + frameW - cornerSize, frameY); ctx.lineTo(frameX + frameW, frameY); ctx.lineTo(frameX + frameW, frameY + cornerSize); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(frameX, frameY + frameH - cornerSize); ctx.lineTo(frameX, frameY + frameH); ctx.lineTo(frameX + cornerSize, frameY + frameH); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(frameX + frameW - cornerSize, frameY + frameH); ctx.lineTo(frameX + frameW, frameY + frameH); ctx.lineTo(frameX + frameW, frameY + frameH - cornerSize); ctx.stroke();
        ctx.restore();
    }, []);

    // Fetch test data
    useEffect(() => {
        const fetchTest = async () => {
            try {
                const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://Shreyansh6726-zest.hf.space';
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

                // Enforce the same 5-minute late-entry rule here so direct navigation cannot bypass Home.jsx
                const examRes = await fetch(`${backendUrl}/api/exams/by-testid/${testId}${user.batchId ? `?batchId=${user.batchId}` : ''}`);
                if (examRes.ok) {
                    const exam = await examRes.json();
                    const parseDateTime = (d, t) => {
                        const ds = d.toString().padStart(8, '0');
                        const ts = t.toString().padStart(6, '0');
                        return new Date(
                            parseInt(ds.slice(4)),
                            parseInt(ds.slice(2, 4)) - 1,
                            parseInt(ds.slice(0, 2)),
                            parseInt(ts.slice(0, 2)),
                            parseInt(ts.slice(2, 4)),
                            parseInt(ts.slice(4))
                        );
                    };

                    const startTime = parseDateTime(exam.examDate, exam.examTime);
                    const entryDeadline = new Date(startTime.getTime() + 5 * 60 * 1000);
                    const now = new Date();

                    if (now > entryDeadline) {
                        if (!token) {
                            navigate('/home');
                            return;
                        }

                        const statusRes = await fetch(`${backendUrl}/api/test/late-entry-status/${testId}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });

                        if (!statusRes.ok) {
                            navigate('/home');
                            return;
                        }

                        const statusData = await statusRes.json();
                        if (statusData.status !== 'allowed') {
                            await fetch(`${backendUrl}/api/test/late-entry-request`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({ testId })
                            }).catch(() => { });
                            navigate('/home');
                            return;
                        }
                    }
                }

                const batchId = user.batchId || (user.batch && user.batch._id) || user.batch?.id || '';
                const res = await fetch(`${backendUrl}/api/test-contents/${testId}${batchId ? `?batchId=${batchId}` : ''}`);
                if (!res.ok) throw new Error('Test not found');
                const data = await res.json();
                setTestData(data);
                setTimeLeft((data.duration || 60) * 60);
            } catch (err) {
                console.error('Error loading test:', err);
                navigate('/home');
            } finally {
                setLoading(false);
            }
        };
        fetchTest();
    }, [testId, navigate]);

    // Fullscreen on load
    useEffect(() => {
        if (!loading && phase === 'lobby') {
            const enterFullscreen = () => {
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen().catch(err => {
                        console.log("Could not auto-start fullscreen:", err);
                    });
                }
            };
            enterFullscreen();

            // Fallback for browsers requiring a user gesture
            const handleFirstClick = () => {
                enterFullscreen();
                document.removeEventListener('click', handleFirstClick);
            };
            document.addEventListener('click', handleFirstClick);
            return () => document.removeEventListener('click', handleFirstClick);
        }
    }, [loading, phase]);

    // Submit handler
    const handleSubmit = useCallback(async (autoSubmit = false, forceZeroMarks = false) => {
        if (hasSubmitted.current || submitting) return;

        hasSubmitted.current = true;
        setSubmitting(true);
        clearInterval(timerRef.current);

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const payloadAnswers = forceZeroMarks ? {} : answers;
            const res = await fetch(`${backendUrl}/api/test/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    testId,
                    answers: payloadAnswers,
                    alarmCount: warningsCount,
                    yellowWarningCount: yellowWarningsRef.current
                })
            });
            const data = await res.json();
            if (res.ok) {
                setResults(data);
                setPhase('results');
            } else {
                alert(data.message || 'Failed to submit test');
                hasSubmitted.current = false;
            }
        } catch (err) {
            console.error('Submit error:', err);
            alert('Network error. Please try again.');
            hasSubmitted.current = false;
        } finally {
            setSubmitting(false);
        }
    }, [testId, answers, warningsCount, submitting]);

    // Keep ref updated for timer callback
    submitFnRef.current = handleSubmit;
    warningPromptOpenRef.current = Boolean(warningPrompt);

    // Timer effect
    useEffect(() => {
        if (phase !== 'testing') return;

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    if (!hasSubmitted.current) {
                        submitFnRef.current(true);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [phase]);

    useEffect(() => {
        yellowWarningsRef.current = yellowWarningsCount;
    }, [yellowWarningsCount]);

    useEffect(() => {
        if (!isDraggingCamera) return;

        const handleMove = (event) => {
            event.preventDefault();
            const dx = event.clientX - dragStateRef.current.startX;
            const dy = event.clientY - dragStateRef.current.startY;
            const nextRight = Math.max(12, dragStateRef.current.startRight - dx);
            const nextBottom = Math.max(12, dragStateRef.current.startBottom - dy);
            setCameraWidgetPos({ right: nextRight, bottom: nextBottom });
        };

        const handleUp = () => setIsDraggingCamera(false);

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
        };
    }, [isDraggingCamera]);

    useEffect(() => {
        if (phase !== 'testing') return;

        let cancelled = false;
        const startCamera = async () => {
            try {
                const videoConstraints = selectedCameraDeviceId
                    ? { deviceId: { exact: selectedCameraDeviceId } }
                    : { facingMode: 'user' };
                const stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: false });
                if (cancelled) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }

                streamRef.current = stream;
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoInputs = devices.filter((device) => device.kind === 'videoinput');
                setCameraDevices(videoInputs);
                if (!selectedCameraDeviceId && videoInputs.length > 0) {
                    const activeTrack = stream.getVideoTracks()[0];
                    const activeSettings = activeTrack?.getSettings?.() || {};
                    const matchedDevice = videoInputs.find((device) => device.deviceId === activeSettings.deviceId);
                    setSelectedCameraDeviceId(matchedDevice?.deviceId || videoInputs[0].deviceId);
                }

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play().catch(() => { });
                }
                setCameraReady(true);

                const { FaceDetector, FilesetResolver } = await import(
                    /* webpackIgnore: true */
                    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/vision_bundle.mjs'
                );
                if (cancelled) return;
                if (!mediaPipeReadyRef.current) {
                    const vision = await FilesetResolver.forVisionTasks(
                        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
                    );
                    detectorRef.current = await FaceDetector.createFromModelPath(
                        vision,
                        'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite'
                    );
                    detectorRef.current.setOptions({
                        runningMode: 'VIDEO',
                        minDetectionConfidence: 0.6
                    });
                    mediaPipeReadyRef.current = true;
                }

                const loop = async () => {
                    if (cancelled || phase !== 'testing') return;
                    const detector = detectorRef.current;
                    const video = videoRef.current;
                    if (detector && video && video.readyState >= 2) {
                        try {
                            const now = performance.now();
                            const res = detector.detectForVideo(video, now);
                            const detections = res.detections || [];
                            faceOverlayNoiseRef.current += 1;
                            lastFaceBoxRef.current = detections[0]?.boundingBox || null;

                            if (detections.length > 0) {
                                const box = detections[0].boundingBox;
                                const centerX = box.originX + (box.width / 2);
                                const prev = prevFaceCenterRef.current;
                                if (prev !== null) {
                                    const delta = centerX - prev;
                                    const threshold = Math.max(28, box.width * 0.22);
                                    const direction = delta === 0 ? 0 : (delta > 0 ? 1 : -1);
                                    const streak = faceMotionStreakRef.current;

                                    if (Math.abs(delta) > threshold) {
                                        if (streak.direction === direction) {
                                            streak.count += 1;
                                        } else {
                                            streak.direction = direction;
                                            streak.count = 1;
                                        }
                                    } else {
                                        streak.direction = 0;
                                        streak.count = 0;
                                    }

                                    if (streak.count >= 2 && Date.now() > faceWarningCooldownRef.current) {
                                        faceWarningCooldownRef.current = Date.now() + 5000;
                                        streak.direction = 0;
                                        streak.count = 0;
                                        setYellowWarningsCount((prevCount) => prevCount + 1);
                                        setFaceWarningVisible(true);
                                        setWarningCorner(delta > 0 ? 'top-right' : 'top-left');
                                        window.setTimeout(() => setFaceWarningVisible(false), 1800);
                                    }
                                }
                                prevFaceCenterRef.current = centerX;
                            } else {
                                prevFaceCenterRef.current = null;
                                faceMotionStreakRef.current = { direction: 0, count: 0 };
                            }
                        } catch (err) {
                            console.warn('Face detection failed:', err);
                            lastFaceBoxRef.current = null;
                        }
                    }
                    detectorLoopRef.current = window.setTimeout(loop, 250);
                };

                detectorLoopRunnerRef.current = loop;
                loop();

                const animateOverlay = () => {
                    if (!cancelled && phase === 'testing') {
                        drawFaceOverlay(lastFaceBoxRef.current, videoRef.current);
                        overlayLoopRef.current = window.requestAnimationFrame(animateOverlay);
                    }
                };
                animateOverlay();
            } catch (err) {
                console.warn('Camera monitoring failed:', err);
                setCameraError('Camera monitoring could not start');
            }
        };

        startCamera();

        return () => {
            cancelled = true;
            if (detectorLoopRef.current) window.clearTimeout(detectorLoopRef.current);
            if (overlayLoopRef.current) window.cancelAnimationFrame(overlayLoopRef.current);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }
        };
    }, [phase, selectedCameraDeviceId, drawFaceOverlay]);

    // Prevent accidental navigation during test
    useEffect(() => {
        if (phase !== 'testing') return;
        const handler = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [phase]);

    // Security monitoring (Tab switching, Fullscreen exit)
    useEffect(() => {
        if (phase !== 'testing') return;

        const playAlarmTone = () => {
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) return;
                if (!audioContextRef.current) {
                    audioContextRef.current = new AudioCtx();
                }
                const ctx = audioContextRef.current;
                if (ctx.state === 'suspended') {
                    ctx.resume().catch(() => { });
                }

                const durationSec = 2.2;
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                oscillator.type = 'sawtooth';
                oscillator.frequency.value = 760;
                gainNode.gain.value = 0;
                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);

                const now = ctx.currentTime;
                gainNode.gain.setValueAtTime(0.0001, now);
                gainNode.gain.exponentialRampToValueAtTime(0.25, now + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.08, now + durationSec);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, now + durationSec + 0.05);
                oscillator.start(now);
                oscillator.stop(now + durationSec + 0.08);
            } catch (err) {
                console.warn('Alarm tone could not be played:', err);
            }
        };

        const triggerWarningPrompt = () => {
            if (warningPromptOpenRef.current) return;
            playAlarmTone();
            setWarningPrompt('Attempt of unfair means observed, giving you a warning!');
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                triggerWarningPrompt();
            }
        };

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                triggerWarningPrompt();
            }
        };

        const handleWindowBlur = () => {
            triggerWarningPrompt();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        window.addEventListener('blur', handleWindowBlur);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            window.removeEventListener('blur', handleWindowBlur);
        };
    }, [phase]);

    const handleContinueAfterWarning = () => {
        const nextWarnings = warningsCount + 1;
        setWarningsCount(nextWarnings);
        setWarningPrompt(null);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            fetch(`${backendUrl}/api/test/alarm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ testId, alarmCount: nextWarnings })
            }).catch((err) => console.warn('Failed to sync alarm count:', err));
        }

        if (nextWarnings >= 3) {
            setWarningLimitExceeded(true);
            return;
        }

        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => { });
        }
    };

    const handleTerminateWithZero = () => {
        setWarningPrompt(null);
        setWarningLimitExceeded(false);
        handleSubmit(false, true);
    };

    useEffect(() => {
        if (!warningLimitExceeded) return;
        const timeoutId = setTimeout(() => {
            handleSubmit(false, true);
        }, 1500);
        return () => clearTimeout(timeoutId);
    }, [warningLimitExceeded, handleSubmit]);

    // Format time
    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const getTimerColor = () => {
        if (timeLeft <= 60) return 'text-red-500';
        if (timeLeft <= 300) return 'text-amber-500';
        return 'text-lime';
    };

    const getAuthToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

    const isWrongAttempt = (question, studentAnswer, codeResult) => {
        if (!question) return false;

        if (question.type === 'write code answer') {
            return Boolean(codeResult) && (!codeResult.compiled || !codeResult.allPassed);
        }

        const isEmptyAnswer = studentAnswer === undefined || studentAnswer === null || studentAnswer === '' || (Array.isArray(studentAnswer) && studentAnswer.length === 0);
        if (isEmptyAnswer) return false;

        switch (question.type) {
            case 'single option answer':
                return String(studentAnswer).trim() !== String(question.answerKey).trim();
            case 'multiple option answer': {
                const correctArr = Array.isArray(question.answerKey) ? [...question.answerKey].sort() : [];
                const studentArr = Array.isArray(studentAnswer) ? [...studentAnswer].sort() : [];
                return JSON.stringify(correctArr) !== JSON.stringify(studentArr);
            }
            case 'value enter answer':
                return String(studentAnswer).trim().toLowerCase() !== String(question.answerKey).trim().toLowerCase();
            default:
                return false;
        }
    };

    const logWrongAttempt = async (questionIndex, question, studentAnswer, codeResult) => {
        if (phase !== 'testing' || !question?._id) return;
        if (!isWrongAttempt(question, studentAnswer, codeResult)) return;

        const token = getAuthToken();
        if (!token) return;

        try {
            await fetch(`${backendUrl}/api/test/wrong-answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    testId,
                    questionId: question._id,
                    questionNo: question.questionNo || questionIndex + 1,
                    ques: question.ques,
                    type: question.type,
                    correctAnswer: question.answerKey,
                    studentAnswer,
                    marks: question.marks || 0
                })
            });
        } catch (err) {
            console.warn('Failed to log wrong attempt:', err);
        }
    };

    const goToQuestion = (nextIndex) => {
        const currentQuestion = testData?.questions?.[currentQ];
        void logWrongAttempt(currentQ, currentQuestion, answers[currentQ], codeResults[currentQ]);
        setCurrentQ(nextIndex);
    };

    // Start test
    const startTest = () => {
        setPhase('testing');
        setCurrentQ(0);
        setAnswers({});
        hasSubmitted.current = false;
    };

    // Exit handler
    const handleExit = () => {
        if (phase === 'testing') {
            if (window.confirm('Are you sure you want to exit? Your progress will be lost and the test will be marked as unattempted.')) {
                navigate('/home');
            }
        } else {
            navigate('/home');
        }
    };

    // Answer handlers
    const setAnswer = (qIndex, value) => {
        setAnswers(prev => ({ ...prev, [qIndex]: value }));
    };

    const toggleMultiAnswer = (qIndex, option) => {
        setAnswers(prev => {
            const current = Array.isArray(prev[qIndex]) ? [...prev[qIndex]] : [];
            if (current.includes(option)) {
                return { ...prev, [qIndex]: current.filter(o => o !== option) };
            }
            return { ...prev, [qIndex]: [...current, option] };
        });
    };

    // Run Java code against test cases
    const runCode = async (qIndex) => {
        const question = testData.questions[qIndex];
        const code = answers[qIndex];
        if (!code) return;

        setCodeRunning(true);
        try {
            const res = await fetch(`${backendUrl}/api/test/run-java-testcases`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, testCases: question.testCases })
            });
            const data = await res.json();
            setCodeResults(prev => ({ ...prev, [qIndex]: data }));
        } catch (err) {
            console.error('Code run error:', err);
        } finally {
            setCodeRunning(false);
        }
    };

    // Check if question is answered
    const isAnswered = (qIndex) => {
        const a = answers[qIndex];
        return a !== undefined && a !== null && a !== '' && !(Array.isArray(a) && a.length === 0);
    };

    // ==================== LOADING ====================
    if (loading) {
        return (
            <div className="min-h-screen bg-[#fffef2] flex items-center justify-center">
                <Helmet>
                    <title>{pageTitle}</title>
                </Helmet>

                <div className="w-16 h-16 border-4 border-lime border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // ==================== LOBBY PHASE ====================
    if (phase === 'lobby') {
        return (
            <div className="min-h-screen bg-[#fffef2] text-navy selection:bg-lime/30 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <Helmet>
                    <title>{pageTitle}</title>
                </Helmet>

                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime/5 rounded-full blur-[100px] -mr-64 -mt-64"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-navy/5 rounded-full blur-[100px] -ml-64 -mb-64"></div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="max-w-2xl w-full bg-white/70 backdrop-blur-xl p-12 rounded-[3.5rem] border border-white shadow-2xl relative z-10"
                >
                    <div className="flex justify-center mb-8">
                        <div className="w-24 h-24 bg-lime/10 rounded-3xl flex items-center justify-center text-lime">
                            <ShieldCheck size={48} />
                        </div>
                    </div>

                    <div className="text-center space-y-4 mb-10">
                        <h1 className="text-4xl font-extrabold tracking-tight">
                            Welcome to <span className="text-lime">{testData?.examName || 'the Test'}</span>
                        </h1>
                        <p className="text-slate-600 font-medium">
                            You have successfully entered the secure test environment.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-10">
                        <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Duration</p>
                            <p className="text-xl font-bold">{testData?.duration} Min</p>
                        </div>
                        <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Full Marks</p>
                            <p className="text-xl font-bold">{testData?.totalMarks}</p>
                        </div>
                        <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Questions</p>
                            <p className="text-xl font-bold">{testData?.questions?.length || 0}</p>
                        </div>
                    </div>

                    {/* Instructions & Guidelines */}
                    <div className="bg-navy/5 border border-navy/10 p-6 rounded-3xl mb-10 text-left">
                        <div className="flex items-center gap-3 mb-4">
                            <Info className="text-navy shrink-0" size={24} />
                            <h2 className="font-bold text-navy text-lg">Test Guidelines & Security Protocols</h2>
                        </div>

                        <div className="text-sm text-slate-700 space-y-4">
                            <div className="flex gap-3">
                                <Clock className="text-slate-500 shrink-0 mt-0.5" size={16} />
                                <p>
                                    <strong>Duration & Submission:</strong> The test is {testData?.duration} minutes long. When the timer expires, the test will automatically submit your saved responses. You may also choose to submit manually before the time runs out.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <CheckCircle2 className="text-slate-500 shrink-0 mt-0.5" size={16} />
                                <div>
                                    <p className="mb-2"><strong>Question Formats:</strong> This test contains four types of questions:</p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li><strong>Single Option:</strong> Click the single correct option. (Noted as "Choose one answer")</li>
                                        <li><strong>Multiple Options:</strong> Select all applicable correct options. (Noted as "Select all that apply")</li>
                                        <li><strong>Numerical/Character Value:</strong> Type a single number or character into the given input field.</li>
                                        <li><strong>Java Code:</strong> Write Java code to pass the visible test case. Additional test cases will be validated securely on the backend.</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                                <p>
                                    <strong>Security Protocols:</strong> The test environment strictly prohibits cheating. Any attempt to switch tabs, minimize the window, or exit fullscreen mode will raise an alarm, resulting in a formal warning. Accumulating 3 warnings will immediately terminate the test and lead to a suspension.
                                </p>
                            </div>

                            <p className="font-bold text-navy mt-6 text-center text-base">Best of luck!</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={startTest}
                            className="flex-1 py-4 bg-lime text-white rounded-2xl font-extrabold shadow-lg shadow-lime/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                        >
                            <PlayCircle size={20} /> Start Solving
                        </button>
                        <button
                            onClick={handleExit}
                            className="flex-1 py-4 bg-white text-navy border-2 border-slate-200 rounded-2xl font-extrabold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                        >
                            <LogOut size={20} /> Exit Test
                        </button>
                    </div>
                </motion.div>

                <div className="mt-8 flex items-center gap-2 opacity-30 grayscale pointer-events-none">
                    <img src="/logo.png" alt="Zest" className="w-5 h-5" />
                    <span className="font-black tracking-tighter text-navy uppercase text-xs">Secure environment powered by Zest</span>
                </div>
            </div>
        );
    }

    // ==================== RESULTS PHASE ====================
    if (phase === 'results' && results) {
        const percentage = results.totalMarks > 0 ? Math.round((results.totalScore / results.totalMarks) * 100) : 0;
        const isPassed = results.passingMarks ? results.totalScore >= results.passingMarks : percentage >= 40;
        const attempted = results.questionResults.filter(r => r.status === 'attempted').length;
        const correct = results.questionResults.filter(r => r.correct).length;

        return (
            <div className="min-h-screen bg-[#fffef2] text-navy flex items-center justify-center p-6 relative overflow-hidden">
                <Helmet>
                    <title>{pageTitle}</title>
                </Helmet>

                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-lime/5 rounded-full blur-[120px] -mr-64 -mt-64"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-navy/5 rounded-full blur-[120px] -ml-64 -mb-64"></div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="max-w-lg w-full bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] border border-white shadow-2xl relative z-10 text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                        className="mx-auto mb-6"
                    >
                        <div className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto ${isPassed ? 'bg-lime/10' : 'bg-red-50'}`}>
                            {isPassed
                                ? <Trophy size={56} className="text-lime" />
                                : <AlertTriangle size={56} className="text-red-400" />
                            }
                        </div>
                    </motion.div>

                    <h1 className="text-3xl font-extrabold mb-2">
                        {isPassed ? 'Congratulations! 🎉' : 'Keep Practicing!'}
                    </h1>
                    <p className="text-slate-500 font-medium mb-8">{results.examName}</p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className={`text-7xl font-black mb-2 ${isPassed ? 'text-lime' : 'text-red-500'}`}>
                            {results.totalScore}
                        </div>
                        <p className="text-lg text-slate-400 font-bold">out of {results.totalMarks}</p>

                        <div className="w-full bg-slate-100 rounded-full h-3 mt-6 mb-8 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ delay: 0.7, duration: 1, ease: 'easeOut' }}
                                className={`h-full rounded-full ${isPassed ? 'bg-lime' : 'bg-red-400'}`}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-8">
                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <p className="text-2xl font-black text-navy">{results.totalQuestions}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-2xl">
                                <p className="text-2xl font-black text-green-600">{correct}</p>
                                <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Correct</p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-2xl">
                                <p className="text-2xl font-black text-red-500">{results.totalQuestions - correct}</p>
                                <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Wrong / Skipped</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-8">
                            <div className="bg-lime/5 border border-lime/10 p-4 rounded-2xl">
                                <p className="text-lg font-black text-navy">{attempted}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attempted</p>
                            </div>
                            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                                <p className="text-lg font-black text-amber-600">{results.totalQuestions - attempted}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unattempted</p>
                            </div>
                        </div>
                    </motion.div>

                    <button
                        onClick={() => navigate('/home')}
                        className="w-full py-4 bg-navy text-white rounded-2xl font-extrabold hover:bg-navy/90 transition-all flex items-center justify-center gap-2 shadow-xl"
                    >
                        <Home size={20} /> Back to Dashboard
                    </button>
                </motion.div>
            </div>
        );
    }

    // ==================== TESTING PHASE ====================
    const question = testData?.questions?.[currentQ];
    const totalQuestions = testData?.questions?.length || 0;
    const answeredCount = Object.keys(answers).filter(k => isAnswered(parseInt(k))).length;
    const questionNumber = question?.questionNo || currentQ + 1;

    return (
        <div className="min-h-screen bg-[#fffef2] text-navy flex flex-col">
            <Helmet>
                <title>{pageTitle}</title>
            </Helmet>

            {/* Submitting overlay */}
            <AnimatePresence>
                {submitting && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="bg-white p-10 rounded-3xl shadow-2xl text-center"
                        >
                            <Loader2 size={48} className="text-lime animate-spin mx-auto mb-4" />
                            <p className="text-xl font-extrabold text-navy">Evaluating your answers...</p>
                            <p className="text-slate-500 font-medium mt-2">Please wait while we grade your test</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Warning Prompt overlay */}
            <AnimatePresence>
                {warningPrompt && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-red-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                            className="bg-white p-10 rounded-3xl shadow-2xl max-w-lg w-full text-center"
                        >
                            <AlertTriangle size={64} className="text-red-500 mx-auto mb-6" />
                            <h2 className="text-2xl font-black text-navy mb-2">Attempt of unfair means observed!</h2>
                            <p className="text-lg text-slate-600 font-medium mb-2">{warningPrompt}</p>
                            <p className="text-sm text-slate-500 font-bold mb-6">Current warnings: {warningsCount} / 3</p>

                            <div className="space-y-3">
                                <button
                                    onClick={handleTerminateWithZero}
                                    className="w-full py-4 bg-slate-100 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-colors"
                                >
                                    Exit (Finish test with 0 marks)
                                </button>
                                <button
                                    onClick={handleContinueAfterWarning}
                                    className="w-full py-4 bg-navy text-white rounded-xl font-bold hover:bg-navy/90 transition-colors shadow-lg"
                                >
                                    Continue (Return to test)
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {warningLimitExceeded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-red-900/90 backdrop-blur-md z-[110] flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="bg-white p-10 rounded-3xl shadow-2xl max-w-lg w-full text-center"
                        >
                            <AlertTriangle size={64} className="text-red-500 mx-auto mb-6" />
                            <h2 className="text-2xl font-black text-navy mb-3">You have exceeded warning limit.</h2>
                            <p className="text-slate-600 font-medium mb-6">Your test is being terminated and you will receive 0 marks.</p>
                            <button
                                onClick={handleTerminateWithZero}
                                className="w-full py-4 bg-red-600 text-white rounded-xl font-bold transition-all hover:bg-red-700 shadow-lg"
                            >
                                Acknowledge
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {faceWarningVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className={`fixed ${warningCorner === 'top-left' ? 'left-4' : 'right-4'} top-4 z-[95] rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-700 shadow-lg`}
                    >
                        Face movement detected
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Header Bar */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="Zest" className="w-7 h-7" />
                    <div>
                        <p className="font-extrabold text-navy text-sm leading-none">{testData?.examName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Test ID: {testId}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl border border-red-100 font-bold text-sm">
                    <AlertTriangle size={18} />
                    {warningsCount} / 3 Warnings
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex">
                {/* LEFT: Question Display (62%) */}
                <div className="w-[62%] p-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 60px)' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQ}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Question Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="bg-navy text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm">
                                        {questionNumber}
                                    </span>
                                    <div>
                                        <p className="font-extrabold text-navy">Question {questionNumber} of {totalQuestions}</p>
                                        <p className="text-xs text-slate-400 font-bold capitalize">{question?.type}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-lime/10 px-4 py-2 rounded-xl">
                                    <Award size={16} className="text-lime" />
                                    <span className="font-black text-navy text-sm">{question?.marks || 0} marks</span>
                                </div>
                            </div>

                            {/* Question Text */}
                            <div className="bg-white rounded-3xl border border-slate-100 p-8 mb-8 shadow-sm">
                                <p className="text-lg font-bold text-navy leading-relaxed whitespace-pre-wrap">
                                    {question?.ques}
                                </p>
                            </div>

                            {/* ===== SINGLE CHOICE ===== */}
                            {question?.type === 'single option answer' && (
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Circle size={14} /> Choose one answer
                                    </p>
                                    {question.options?.map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                if (answers[currentQ] === opt) {
                                                    setAnswer(currentQ, null);
                                                } else {
                                                    setAnswer(currentQ, opt);
                                                }
                                            }}
                                            className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 group ${answers[currentQ] === opt
                                                    ? 'border-lime bg-lime/5 shadow-lg shadow-lime/10'
                                                    : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${answers[currentQ] === opt
                                                    ? 'border-lime bg-lime'
                                                    : 'border-slate-200 group-hover:border-slate-300'
                                                }`}>
                                                {answers[currentQ] === opt && (
                                                    <motion.div
                                                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                                                        className="w-3 h-3 bg-white rounded-full"
                                                    />
                                                )}
                                            </div>
                                            <span className={`font-bold ${answers[currentQ] === opt ? 'text-navy' : 'text-slate-600'}`}>
                                                {opt}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* ===== MULTIPLE CHOICE ===== */}
                            {question?.type === 'multiple option answer' && (
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Square size={14} /> Select all that apply
                                    </p>
                                    {question.options?.map((opt, i) => {
                                        const selected = Array.isArray(answers[currentQ]) && answers[currentQ].includes(opt);
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => toggleMultiAnswer(currentQ, opt)}
                                                className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 group ${selected
                                                        ? 'border-lime bg-lime/5 shadow-lg shadow-lime/10'
                                                        : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${selected ? 'border-lime bg-lime' : 'border-slate-200 group-hover:border-slate-300'
                                                    }`}>
                                                    {selected && (
                                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                            <CheckCircle2 size={18} className="text-white" />
                                                        </motion.div>
                                                    )}
                                                </div>
                                                <span className={`font-bold ${selected ? 'text-navy' : 'text-slate-600'}`}>{opt}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* ===== VALUE ENTER ===== */}
                            {question?.type === 'value enter answer' && (
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Type size={14} /> Enter your answer
                                    </p>
                                    <input
                                        type="text"
                                        value={answers[currentQ] || ''}
                                        onChange={(e) => setAnswer(currentQ, e.target.value)}
                                        placeholder="Type your answer here..."
                                        className="w-full p-5 rounded-2xl border-2 border-slate-100 bg-white focus:border-lime focus:outline-none font-bold text-lg text-navy transition-all placeholder:text-slate-300 shadow-sm focus:shadow-lg"
                                    />
                                </div>
                            )}

                            {/* ===== WRITE CODE (JAVA) ===== */}
                            {question?.type === 'write code answer' && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Code size={14} /> Java Code Editor
                                        </p>
                                        <button
                                            onClick={() => runCode(currentQ)}
                                            disabled={codeRunning || !answers[currentQ]}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-lime text-white rounded-xl font-bold text-sm hover:bg-lime/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95"
                                        >
                                            {codeRunning ? (
                                                <><Loader2 size={14} className="animate-spin" /> Running...</>
                                            ) : (
                                                <><Play size={14} /> Run Code</>
                                            )}
                                        </button>
                                    </div>
                                    <textarea
                                        value={answers[currentQ] || ''}
                                        onCopy={(e) => e.preventDefault()}
                                        onPaste={(e) => e.preventDefault()}
                                        onCut={(e) => e.preventDefault()}
                                        onChange={(e) => setAnswer(currentQ, e.target.value)}
                                        placeholder={`public class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}`}
                                        className="w-full h-72 p-5 rounded-2xl bg-[#1e1e2e] text-[#cdd6f4] font-mono text-sm border-2 border-[#313244] focus:border-lime/50 focus:outline-none resize-none leading-relaxed shadow-inner"
                                        spellCheck={false}
                                    />

                                    {/* Test case results */}
                                    {codeResults[currentQ] && (
                                        <div className="mt-4 space-y-2">
                                            {!codeResults[currentQ].compiled ? (
                                                <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
                                                    <p className="font-bold text-red-600 text-sm flex items-center gap-2">
                                                        <XCircle size={16} /> Compilation Error
                                                    </p>
                                                    <pre className="mt-2 text-xs text-red-500 font-mono whitespace-pre-wrap overflow-x-auto">
                                                        {codeResults[currentQ].error}
                                                    </pre>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                        Test Results — {codeResults[currentQ].results?.filter(r => r.passed).length}/{codeResults[currentQ].results?.length} passed
                                                    </p>
                                                    {codeResults[currentQ].results?.map((r, i) => (
                                                        <div key={i} className={`p-3 rounded-xl border text-sm ${r.passed ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
                                                            }`}>
                                                            <div className="flex items-center gap-2 font-bold">
                                                                {r.passed
                                                                    ? <CheckCircle2 size={14} className="text-green-500" />
                                                                    : <XCircle size={14} className="text-red-500" />
                                                                }
                                                                <span className={r.passed ? 'text-green-700' : 'text-red-700'}>
                                                                    Test Case {i + 1} — {r.passed ? 'Passed' : r.timedOut ? 'Timed Out' : 'Failed'}
                                                                </span>
                                                            </div>
                                                            {!r.passed && !r.timedOut && (
                                                                <div className="mt-2 text-xs font-mono pl-6 space-y-0.5">
                                                                    <p className="text-slate-500">Expected: <span className="text-navy font-bold">{r.expectedOutput}</span></p>
                                                                    <p className="text-slate-500">Got: <span className="text-red-600 font-bold">{r.actualOutput}</span></p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100">
                        <button
                            onClick={() => goToQuestion(Math.max(0, currentQ - 1))}
                            disabled={currentQ === 0}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft size={18} /> Previous
                        </button>
                        <span className="text-sm text-slate-400 font-bold">
                            {currentQ + 1} / {totalQuestions}
                        </span>
                        <button
                            onClick={() => goToQuestion(Math.min(totalQuestions - 1, currentQ + 1))}
                            disabled={currentQ === totalQuestions - 1}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-navy bg-slate-50 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            Next <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                {/* RIGHT: Question Panel + Timer (38%) */}
                <div className="w-[38%] bg-white border-l border-slate-100 p-6 flex flex-col" style={{ maxHeight: 'calc(100vh - 60px)' }}>
                    {/* Timer Display */}
                    <div className={`text-center p-6 rounded-3xl mb-6 transition-colors ${timeLeft <= 60 ? 'bg-red-50 border border-red-100' :
                            timeLeft <= 300 ? 'bg-amber-50 border border-amber-100' :
                                'bg-lime/5 border border-lime/10'
                        }`}>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Time Remaining</p>
                        <p className={`text-4xl font-black font-mono tracking-wider ${getTimerColor()} ${timeLeft <= 60 ? 'animate-pulse' : ''}`}>
                            {formatTime(timeLeft)}
                        </p>
                    </div>

                    {/* Question Grid */}
                    <div className="flex-1 overflow-y-auto">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Question Navigator</p>
                        <div className="grid grid-cols-5 gap-2">
                            {testData?.questions?.map((_, i) => (
                                <button
                                    key={i}
                                            onClick={() => goToQuestion(i)}
                                    className={`w-full aspect-square rounded-xl font-bold text-sm flex items-center justify-center transition-all duration-200 border-2 ${i === currentQ
                                            ? 'bg-navy text-white border-navy shadow-lg scale-110'
                                            : isAnswered(i)
                                                ? 'bg-lime/10 text-lime border-lime/30 hover:bg-lime/20'
                                                : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-200 hover:bg-slate-100'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Legend + Stats */}
                    <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-slate-400 font-bold">
                                <div className="w-3 h-3 rounded bg-lime/30 border border-lime/50"></div> Answered
                            </span>
                            <span className="font-black text-navy">{answeredCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-slate-400 font-bold">
                                <div className="w-3 h-3 rounded bg-slate-100 border border-slate-200"></div> Remaining
                            </span>
                            <span className="font-black text-navy">{totalQuestions - answeredCount}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-lime transition-all duration-500"
                                style={{ width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%` }}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={() => handleSubmit(false)}
                        disabled={submitting}
                        className="mt-6 w-full py-4 bg-navy text-white rounded-2xl font-extrabold flex items-center justify-center gap-2 shadow-xl hover:bg-navy/90 transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50"
                    >
                        <Send size={18} /> Submit Test
                    </button>
                </div>
            </div>

            <div className="pointer-events-none fixed bottom-4 right-4 z-[90] flex flex-col items-end gap-2">
                {cameraError ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 shadow-lg">
                        {cameraError}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 shadow-lg">
                        {cameraReady ? 'Camera monitoring active' : 'Starting camera monitoring...'}
                    </div>
                )}
            </div>

            <div
                className="fixed z-[85] overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-2xl shadow-navy/20"
                style={{ right: `${cameraWidgetPos.right}px`, bottom: `${cameraWidgetPos.bottom}px` }}
            >
                <div
                    className="flex cursor-move select-none items-center justify-between gap-3 border-b border-white/10 bg-slate-950/90 px-4 py-2"
                    onMouseDown={(event) => {
                        setIsDraggingCamera(true);
                        dragStateRef.current = {
                            startX: event.clientX,
                            startY: event.clientY,
                            startRight: cameraWidgetPos.right,
                            startBottom: cameraWidgetPos.bottom
                        };
                    }}
                >
                    <div className="flex min-w-0 items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-white/70">
                        <Camera size={12} />
                        <span className="truncate">Live Self View</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${cameraReady ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
                            <span className={`h-2 w-2 rounded-full ${cameraReady ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
                            {cameraReady ? 'Active' : 'Loading'}
                        </div>
                        <select
                            value={selectedCameraDeviceId}
                            onChange={(e) => setSelectedCameraDeviceId(e.target.value)}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="max-w-[9rem] rounded-xl border border-white/10 bg-white/10 px-2 py-1 text-[10px] font-bold text-white outline-none backdrop-blur"
                            title="Choose camera"
                        >
                            {cameraDevices.length === 0 ? (
                                <option value="">Default camera</option>
                            ) : (
                                cameraDevices.map((device, idx) => (
                                    <option key={device.deviceId} value={device.deviceId} className="text-navy">
                                        {device.label || `Camera ${idx + 1}`}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>
                </div>
                <div className="relative h-44 w-56 bg-black">
                    <video
                        ref={videoRef}
                        className="h-full w-full object-cover scale-x-[-1]"
                        playsInline
                        muted
                        autoPlay
                    />
                    <canvas
                        ref={overlayCanvasRef}
                        className="pointer-events-none absolute inset-0 h-full w-full scale-x-[-1]"
                    />
                    {!cameraReady && !cameraError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 text-center">
                            <div className="space-y-1">
                                <Camera size={28} className="mx-auto text-white/60" />
                                <p className="text-xs font-bold text-white/70">Starting camera...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Test;
