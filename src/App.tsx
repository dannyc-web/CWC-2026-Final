import { useEffect, useRef, useState } from 'react';
import './App.css';

const OPENING_PASSWORD = 'CWC2026huntPassword';
const ADMIN_PASSWORD = 'diniescorelio72';
const STAGE_2_PART_A_PASSWORD = 'ga1.uk';
const STAGE_2_APPROVAL_PASSWORD = 'diniescorelio72';
const STAGE_1_A_PASSWORD = 'bacon';
const STAGE_1_B_PASSWORD = 'Site of Special Scientific Interest';
const STAGE_1_C_PASSWORD = 'Victor Phillip Dahdaleh';

const STAGE_12_LATITUDE = 52.1830833333;
const STAGE_12_LONGITUDE = 0.16525;
const LOCATION_RADIUS_METRES = 5;

type Screen = 'opening' | 'map' | 'stage' | 'final';

type Stage = {
  
  id: number;
  title: string;
  location: string;
  question: string;
  history: string;
  password?: string;
};
type SavedProgress = {
  completedStages?: Record<number, string>;
  stage1Part?: '1A' | '1B' | '1C';
  stage1Answers?: { A: string; B: string; C: string };
  stage2Part?: 'A' | 'B';
  stage2AnswerA?: string;
};

const PROGRESS_STORAGE_KEY = 'cwc-treasure-hunt-progress-v1';

function loadSavedProgress(): SavedProgress {
  try {
    const saved = localStorage.getItem(PROGRESS_STORAGE_KEY);
    return saved ? (JSON.parse(saved) as SavedProgress) : {};
  } catch {
    return {};
  }
}

const stages: Stage[] = [
  {
    id: 1,
    title: 'Stage 1',
    location: '',
    question: 'Complete 1A, then 1B, then 1C.',
    history:
      'Folder Stage 1',
  },
  {
    id: 2,
    title: 'Stage 2',
    location: '',
    question: 'Go to the Cambridge South secure cycle storage. What is the link before ".../cyclestorage" ?',
    history:
      'Folder Stage 2',
  },
  {
    id: 3,
    title: 'Stage 3',
    location: 'Home',
    question: 'What is the registration of the kayak?',
    history: 'Folder Stage 3',
    password: '780447',
  },
  {
    id: 4,
    title: 'Stage 4',
    location: 'Girton Interchange',
    question: 'What are the two places and distances on the signpost facing N/W? (Danny will say how to format answer)',
    history: 'Folder Stage 4',
    password: 'Bar Hill, Huntingdon, 3 1/4, 17',
  },
  {
    id: 5,
    title: 'Stage 5',
    location: 'Park your bikes where Danny shows you as we will be walking the city part.',
    question: 'How many red phone boxes are there on Market St.?',
    history: 'Folder Stage 5',
    password: '4',
  },
  {
    id: 6,
    title: 'Stage 6',
    location: 'Corpus Clock',
    question: 'Who designed the Corpus Clock?',
    history: 'Folder Stage 6',
    password: 'John C. Taylor',
  },
  {
    id: 7,
    title: 'Stage 7',
    location: 'Newton`s Apple tree',
    question: 'What is enscribed on Trinity College?',
    history: 'Folder Stage 7',
    password: 'DOMUS MEA DOMUS ORATIONIS VOCABITUR',
  },
  {
    id: 8,
    title: 'Stage 8',
    location: '117-125 King Street',
    question: 'Read the plaque and find when the Almshouses were built',
    history: 'Folder Stage 8',
    password: '1880',
  },
  {
    id: 9,
    title: 'Stage 9',
    location: 'Collect the bikes and go to Castle Mound',
    question: 'In what year did Edward I begin to rebuild the castle?',
    history: 'Folder Stage 9',
    password: '1283',
  },
  {
    id: 10,
    title: 'Stage 10',
    location: 'Cellarer`s Chequer',
    question: 'What type of ceiling did the Chequer have?',
    history: 'Folder Stage 10',
    password: 'vaulted ceiling',
  },
  {
    id: 11,
    title: 'Stage 11',
    location: 'West Wing, Camlife, Fulbourn Research Campus (follow Danny)',
    question: 'How many chimneys are visible?',
    history: 'Folder Stage 11',
    password: '4',
  },
  {
    id: 12,
    title: 'Stage 12, the final Stage',
    location: '43 Greystoke Road',
    question: 'Welcome home',
    history: 'Folder Stage 12',
  },
];

function getDistanceInMetres(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number
) {
  const earthRadius = 6371000;

  const lat1 = (latitude1 * Math.PI) / 180;
  const lat2 = (latitude2 * Math.PI) / 180;

  const differenceLatitude = ((latitude2 - latitude1) * Math.PI) / 180;

  const differenceLongitude = ((longitude2 - longitude1) * Math.PI) / 180;

  const a =
    Math.sin(differenceLatitude / 2) * Math.sin(differenceLatitude / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(differenceLongitude / 2) *
      Math.sin(differenceLongitude / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

function App() {
  const [savedProgress] = useState<SavedProgress>(loadSavedProgress);
  const [screen, setScreen] = useState<Screen>('opening');

  const [openingInput, setOpeningInput] = useState('');
  const [openingError, setOpeningError] = useState('');

  const [selectedStage, setSelectedStage] = useState<number | null>(null);

  const [completedStages, setCompletedStages] = useState<Record<number, string>>(
    savedProgress.completedStages ?? {}
  );

  const [stageInput, setStageInput] = useState('');
  const [stageError, setStageError] = useState('');
  const [stage2Part, setStage2Part] = useState<'A' | 'B'>(
    savedProgress.stage2Part ?? 'A'
  );
  const [stage2AnswerA, setStage2AnswerA] = useState(
    savedProgress.stage2AnswerA ?? ''
  );

  const [stage1Part, setStage1Part] = useState<'1A' | '1B' | '1C'>(
    savedProgress.stage1Part ?? '1A'
  );

  const [stage1Answers, setStage1Answers] = useState(
    savedProgress.stage1Answers ?? { A: '', B: '', C: '' }
  );

  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminInput, setAdminInput] = useState('');
  const [adminError, setAdminError] = useState('');

  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const [cameraError, setCameraError] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const [showApproval, setShowApproval] = useState(false);
  const [approvalInput, setApprovalInput] = useState('');
  const [approvalError, setApprovalError] = useState('');

  const [locationChecking, setLocationChecking] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentStage =
    selectedStage === null
      ? null
      : stages.find((stage) => stage.id === selectedStage) || null;

  const completedCount = Object.keys(completedStages).length;
  const allStagesComplete = completedCount === 12;

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, [cameraStream]);

  useEffect(() => {
    try {
      localStorage.setItem(
        PROGRESS_STORAGE_KEY,
        JSON.stringify({
          completedStages,
          stage1Part,
          stage1Answers,
          stage2Part,
          stage2AnswerA,
        })
      );
    } catch (error) {
      console.error('Could not save game progress.', error);
    }
  }, [
    completedStages,
    stage1Part,
    stage1Answers,
    stage2Part,
    stage2AnswerA,
  ]);

  function enterGate() {
    if (openingInput.trim() === OPENING_PASSWORD) {
      setOpeningError('');
      setScreen('map');

      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          () => {},
          () => {}
        );
      }
    } else {
      setOpeningError("That isn't the correct entry.");
    }
  }

  function openStage(stageId: number) {
    setSelectedStage(stageId);
    setStageInput('');
    setStageError('');
    setLocationMessage('');


    setCapturedPhoto(null);
    setShowApproval(false);
    setApprovalInput('');
    setApprovalError('');
    setCameraError('');


    setScreen('stage');
  }

  function returnToMap() {
    stopCamera();

    setSelectedStage(null);
    setScreen('map');
    setStageError('');
    setLocationMessage('');
  }

  function completeStage(stageId: number, answer: string) {
    setCompletedStages((previous) => {
      return {
        ...previous,
        [stageId]: answer,
      };
    });
  }

  function submitNormalStage() {
    if (!currentStage) {
      return;
    }

    const answer = stageInput.trim();

    if (!answer) {
      setStageError('Please enter an answer.');
      return;
    }

    if (
      currentStage.password &&
      answer.toLowerCase() !== currentStage.password.toLowerCase()
    ) {
      setStageError("That's not correct. Try again.");
      return;
    }

    completeStage(currentStage.id, answer);
    setStageError('');
  }

  function submitStage1Part() {
    if (stage1Part === '1A') {
      const answer = stage1Answers.A.trim();
  
      if (!answer) {
        setStageError('Please enter an answer for 1A.');
        return;
      }
  
      if (answer.toLowerCase() !== STAGE_1_A_PASSWORD.toLowerCase()) {
        setStageError("That's not correct. Try again.");
        return;
      }
  
      setStageError('');
      setStage1Part('1B');
      return;
    }
  
    if (stage1Part === '1B') {
      const answer = stage1Answers.B.trim();
  
      if (!answer) {
        setStageError('Please enter an answer for 1B.');
        return;
      }
  
      if (answer.toLowerCase() !== STAGE_1_B_PASSWORD.toLowerCase()) {
        setStageError("That's not correct. Try again.");
        return;
      }
  
      setStageError('');
      setStage1Part('1C');
      return;
    }
  
    const answer = stage1Answers.C.trim();
  
    if (!answer) {
      setStageError('Please enter an answer for 1C.');
      return;
    }
  
    if (answer.toLowerCase() !== STAGE_1_C_PASSWORD.toLowerCase()) {
      setStageError("That's not correct. Try again.");
      return;
    }
  
    const combinedAnswer =
      '1A: ' +
      stage1Answers.A +
      ' | 1B: ' +
      stage1Answers.B +
      ' | 1C: ' +
      stage1Answers.C;
  
    completeStage(1, combinedAnswer);
    setStageError('');
  }

  function submitStage2PartA() {
    const answer = stageInput.trim();

    if (!answer) {
      setStageError('Please enter an answer for Part A.');
      return;
    }

    if (answer.toLowerCase() !== STAGE_2_PART_A_PASSWORD.toLowerCase()) {
      setStageError("That's not correct. Try again.");
      return;
    }

    setStage2AnswerA(answer);
    setStageInput('');
    setStageError('');
    setStage2Part('B');
  }

  async function startCamera() {
    setCameraError('');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('This browser does not support camera access.');
        return;
      }

      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: 'environment',
          },
        },
        audio: false,
      });

      setCameraStream(stream);
    } catch (error) {
      console.error(error);

      setCameraError(
        'The camera could not be opened. Please allow camera access when your browser asks.'
      );
    }
  }

  function takePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      setCameraError('The camera is not ready yet.');
      return;
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError('The camera is still starting. Please wait a moment.');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');

    if (!context) {
      setCameraError('The photo could not be captured.');
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const photo = canvas.toDataURL('image/jpeg', 0.9);

    setCapturedPhoto(photo);
    setCameraError('');
    stopCamera();
  }

  function retakePhoto() {
    setCapturedPhoto(null);
    setShowApproval(false);
    setApprovalInput('');
    setApprovalError('');
    startCamera();
  }

  function submitStage2Photo() {
    if (!capturedPhoto) {
      setCameraError('Please take a photo first.');
      return;
    }

    setShowApproval(true);
    setApprovalError('');
  }

  function approveStage2() {
    if (approvalInput.trim() !== STAGE_2_APPROVAL_PASSWORD) {
      setApprovalError('Incorrect admin password.');
      return;
    }

    completeStage(
      2,
      'Part A: ' + stage2AnswerA + ' | Part B: Photo approved by Danny.'
    );

    setShowApproval(false);
    setApprovalInput('');
    setApprovalError('');
  }

  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    setCameraStream(null);
  }

  function checkStage12Location() {
    setLocationChecking(true);
    setLocationMessage('');

    if (!navigator.geolocation) {
      setLocationChecking(false);
      setLocationMessage('Location services are not available on this device.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const distance = getDistanceInMetres(
          position.coords.latitude,
          position.coords.longitude,
          STAGE_12_LATITUDE,
          STAGE_12_LONGITUDE
        );

        setLocationChecking(false);

        if (distance <= LOCATION_RADIUS_METRES) {
          setLocationMessage('Location confirmed.');
        } else {
          setLocationMessage(
            'You are approximately ' +
              Math.round(distance) +
              ' metres away. Go closer and try again. '
          );
        }
      },
      () => {
        setLocationChecking(false);
        setLocationMessage(
          "We couldn't get your location. Please make sure location access is allowed."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  function unlockAdmin() {
    if (adminInput === ADMIN_PASSWORD) {
      setAdminUnlocked(true);
      setAdminError('');
      setShowAdminLogin(false);
      setAdminInput('');
    } else {
      setAdminError('Incorrect admin password.');
    }
  }

  function uncompleteStage(stageId: number) {
    setCompletedStages((previous) => {
      const next = { ...previous };
      delete next[stageId];
      return next;
    });

    if (stageId === 1) {
      setStage1Answers({
        A: '',
        B: '',
        C: '',
      });

      setStage1Part('1A');
    }

    if (stageId === 2) {
      setCapturedPhoto(null);
      setShowApproval(false);
      setStage2Part('A');
      setStage2AnswerA('');
    }
  }

  function adminCompleteCurrentStage() {
    if (!currentStage) {
      return;
    }

    const answer =
      currentStage.id === 2
        ? 'Part A: ' + STAGE_2_PART_A_PASSWORD + ' | Part B: Photo approved by Danny.'
        : currentStage.password || 'Completed by Danny.';

    completeStage(currentStage.id, answer);
    setStageError('');
  }

  function renderAdminLock() {
    return (
      <>
        <button
          className="admin-lock admin-lock-bottom"
          onClick={() => {
            setShowAdminLogin(true);
            setAdminError('');
          }}
          aria-label="Admin"
          title="Admin"
        >
          🔒 Admin
        </button>

        {showAdminLogin && (
          <div className="admin-login-overlay">
            <div className="admin-login">
              <h2>Admin</h2>

              <input
                type="password"
                value={adminInput}
                onChange={(event) => {
                  setAdminInput(event.target.value);
                }}
                placeholder="Admin password"
                autoFocus
              />

              <button onClick={unlockAdmin}>Unlock</button>

              {adminError && <p className="error">{adminError}</p>}

              <button
                className="secondary-button"
                onClick={() => {
                  setShowAdminLogin(false);
                  setAdminInput('');
                  setAdminError('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  function renderMapAdminControls() {
    if (!adminUnlocked) {
      return null;
    }

    return (
      <div className="admin-panel">
        <h3>Admin Controls</h3>

        <p>Admin mode is unlocked. You can control the stages from the map.</p>

        <div className="admin-controls">
          {stages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => {
                uncompleteStage(stage.id);
              }}
              disabled={completedStages[stage.id] === undefined}
            >
              Uncomplete Stage {stage.id}
            </button>
          ))}
        </div>

        <button
          className="secondary-button"
          onClick={() => {
            setAdminUnlocked(false);
          }}
        >
          Lock Admin
        </button>
      </div>
    );
  }

  function renderStageAdminControls() {
    if (!adminUnlocked || !currentStage) {
      return null;
    }

    const completed = completedStages[currentStage.id] !== undefined;

    return (
      <div className="admin-panel">
        <h3>Admin — Stage {currentStage.id}</h3>

        <div className="admin-controls">
          {!completed && (
            <button onClick={adminCompleteCurrentStage}>
              Complete This Stage
            </button>
          )}

          {completed && (
            <button
              onClick={() => {
                uncompleteStage(currentStage.id);
              }}
            >
              Uncomplete This Stage
            </button>
          )}

          <button
            className="secondary-button"
            onClick={() => {
              setAdminUnlocked(false);
            }}
          >
            Lock Admin
          </button>
        </div>
      </div>
    );
  }

  function renderCompletedStage() {
    if (!currentStage) {
      return null;
    }

    return (
      <div className="completed-content">
        <div className="success-mark">✓</div>

        <h2>Stage Complete!</h2>

        <div className="answer-record">
          <h3>Your Answer</h3>

          <p>{completedStages[currentStage.id]}</p>
        </div>

        <div className="history-box">
          <h3>History</h3>

          <p>{currentStage.history}</p>
        </div>
      </div>
    );
  }

  function renderStage1() {
    if (completedStages[1] !== undefined) {
      return renderCompletedStage();
    }

    return (
      <>
        <div className="question-box">
          <h2>{stage1Part}</h2>

          {stage1Part === '1A' && (
  <p>Who was the inventor on the Blue Plaque whose name is a common breakfast food?</p>
)}

{stage1Part === '1B' && <p>What does SSSI stand for?</p>}

{stage1Part === '1C' && <p>Who is the Heart and Lung Research Institute named after?</p>}
        </div>

        <div className="answer-area">
          {stage1Part === '1A' && (
            <input
              value={stage1Answers.A}
              onChange={(event) => {
                setStage1Answers((previous) => {
                  return {
                    ...previous,
                    A: event.target.value,
                  };
                });
              }}
              placeholder="Answer 1A"
            />
          )}

          {stage1Part === '1B' && (
            <input
              value={stage1Answers.B}
              onChange={(event) => {
                setStage1Answers((previous) => {
                  return {
                    ...previous,
                    B: event.target.value,
                  };
                });
              }}
              placeholder="Answer 1B"
            />
          )}

          {stage1Part === '1C' && (
            <input
              value={stage1Answers.C}
              onChange={(event) => {
                setStage1Answers((previous) => {
                  return {
                    ...previous,
                    C: event.target.value,
                  };
                });
              }}
              placeholder="Answer 1C"
            />
          )}

          <button onClick={submitStage1Part}>
            {stage1Part === '1C' ? 'Complete Stage 1' : 'Continue'}
          </button>

          {stageError && <p className="error">{stageError}</p>}
        </div>
      </>
    );
  }

  function renderStage2() {
    if (completedStages[2] !== undefined) {
      return renderCompletedStage();
    }

    if (stage2Part === 'A') {
      return (
        <>
          <div className="question-box">
            <h2>Part A</h2>
            <p>{currentStage?.question}</p>
          </div>

          <div className="answer-area">
            <input
              type="password"
              value={stageInput}
              onChange={(event) => {
                setStageInput(event.target.value);
              }}
              placeholder="Part A password"
            />

            <button onClick={submitStage2PartA}>Submit Part A</button>

            {stageError && <p className="error">{stageError}</p>}
          </div>
        </>
      );
    }

    return (
      <>
        <div className="question-box">
          <h2>Part B</h2>

          <p>Take a photo at this stage location using the camera.</p>

          <p>
            Danny will check the photo before the stage is completed.
          </p>
        </div>

        <div className="camera-area">
          {!cameraStream && !capturedPhoto && (
            <button onClick={startCamera}>Open Camera</button>
          )}

          {cameraStream && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-preview"
              />

              <button onClick={takePhoto}>Take Photo</button>
            </>
          )}

          {capturedPhoto && (
            <>
              <img
                src={capturedPhoto}
                alt="Captured stage photo"
                className="captured-photo"
              />

              <button onClick={retakePhoto}>Retake Photo</button>

              {!showApproval && (
                <button onClick={submitStage2Photo}>Submit Photo</button>
              )}
            </>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {cameraError && <p className="error">{cameraError}</p>}
        </div>

        {showApproval && (
          <div className="approval-box">
            <h3>Admin Approval</h3>

            <p>
              The admin must enter the approval password to complete this
              stage.
            </p>

            <input
              type="password"
              value={approvalInput}
              onChange={(event) => {
                setApprovalInput(event.target.value);
              }}
              placeholder="Admin password"
            />

            <button onClick={approveStage2}>Approve Photo</button>

            {approvalError && <p className="error">{approvalError}</p>}
          </div>
        )}
      </>
    );
  }

  function renderNormalStage() {
    if (!currentStage) {
      return null;
    }

    if (completedStages[currentStage.id] !== undefined) {
      return renderCompletedStage();
    }

    return (
      <>
        <div className="question-box">
          <h2>Question</h2>

          <p>{currentStage.question}</p>
        </div>

        <div className="answer-area">
          <input
            value={stageInput}
            onChange={(event) => {
              setStageInput(event.target.value);
            }}
            placeholder="Enter your answer"
          />

          <button onClick={submitNormalStage}>Submit Answer</button>

          {stageError && <p className="error">{stageError}</p>}
        </div>
      </>
    );
  }

  function renderStage() {
    if (!currentStage) {
      return null;
    }

    return (
      <div className="stage-page">
        <button className="back-button" onClick={returnToMap}>
          ← Back to Map
        </button>

        {renderAdminLock()}

        <div className="stage-content">
          <h1>{currentStage.title}</h1>

          <div className="location-box">
            <strong>Location</strong>

            <p>
  {currentStage.id === 1
    ? stage1Part === '1A'
      ? '82 High Street, Little Shelford'
      : stage1Part === '1B'
        ? 'Ninewells Nature Reserve'
        : 'Addenbrooke’s Royal Papworth'
    : currentStage.location}
</p>
          </div>

          {currentStage.id === 1 && renderStage1()}

          {currentStage.id === 2 && renderStage2()}

          {currentStage.id >= 3 && currentStage.id <= 11 && renderNormalStage()}

          {currentStage.id === 12 &&
            (completedStages[12] !== undefined ? (
              renderCompletedStage()
            ) : (
              <>
                <div className="question-box">
                  <h2>Final Location</h2>

                  <p>{currentStage.question}</p>
                </div>

                <div className="answer-area">
                  <button
                    onClick={checkStage12Location}
                    disabled={locationChecking}
                  >
                    {locationChecking
                      ? 'Checking Location...'
                      : 'Check My Location'}
                  </button>

                  {locationMessage && (
                    <p
                      className={
                        locationMessage === 'Location confirmed.'
                          ? 'success-text'
                          : 'error'
                      }
                    >
                      {locationMessage === 'Location confirmed.' && (
                        <button
                          onClick={() => {
                            completeStage(12, 'Final checkpoint confirmed.');
                          }}
                        >
                          Submit to Complete Level
                        </button>
                      )}
                      {locationMessage}
                    </p>
                  )}
                </div>
              </>
            ))}

          {renderStageAdminControls()}
        </div>
      </div>
    );
  }

  function renderMap() {
    return (
      <div className="game map-page">
        {renderAdminLock()}

        <div className="opening-screen">
          <p className="eyebrow">CWC 2026 Tresure Hunt</p>

          <h1>Choose a door</h1>

          <p className="clue">Complete all the stages to unlock the treasure. </p>

          <div className="doors">
            {Array.from({ length: 12 }, (_, index) => {
              const stageId = index + 1;

              const completed = completedStages[stageId] !== undefined;

              return (
                <button
                  key={stageId}
                  className="door"
                  onClick={() => {
                    openStage(stageId);
                  }}
                  aria-label={'Open stage ' + stageId}
                >
                  <span
                    className={
                      completed ? 'door-number completed-tick' : 'door-number'
                    }
                  >
                    {completed ? '✓' : stageId}
                  </span>

                  {completed && <span className="door-complete">COMPLETE</span>}
                </button>
              );
            })}
          </div>

          <p className="progress">{completedCount} / 12 stages complete</p>

          {allStagesComplete && (
            <button
              className="final-button"
              onClick={() => {
                setScreen('final');
              }}
            >
              Reveal Final Treasure
            </button>
          )}

          {renderMapAdminControls()}
        </div>
      </div>
    );
  }

  function renderFinal() {
    return (
      <div className="game map-page">
        {renderAdminLock()}

        <div className="final-panel">
          <div className="final-icon">🏆</div>

          <h1>You've completed all the stages!</h1>

          <p className="final-instruction">Find the treasurue</p>

          <div className="what3words">///spits.baked.value</div>

          <p>Good luck!</p>

          <button
            onClick={() => {
              setScreen('map');
            }}
          >
            Back to Map
          </button>
        </div>

        {renderMapAdminControls()}
      </div>
    );
  }

  if (screen === 'opening') {
    return (
      <div className="game opening-screen">
        <p className="eyebrow">CWC 2026 Treasure Hunt</p>

        <h1>Welcome to CWC 2026,</h1>

        <p className="clue">your first ever team challenge.</p>

        <input
          type="password"
          value={openingInput}
          onChange={(event) => {
            setOpeningInput(event.target.value);
          }}
          placeholder="Password"
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              enterGate();
            }
          }}
        />

        <button onClick={enterGate}>Enter</button>

        {openingError && <p className="error">{openingError}</p>}
      </div>
    );
  }

  if (screen === 'map') {
    return renderMap();
  }

  if (screen === 'stage') {
    return renderStage();
  }

  return renderFinal();
}

export default App;