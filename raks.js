// ======================== SMART NAVIGATION FUNCTION ========================
// This is the core function that navigates instantly when user asks about any section
function navigateToSection(sectionId, sectionDisplayName) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offset = 80;
        const elementPosition = section.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
            top: elementPosition - offset,
            behavior: 'smooth'
        });
        
        // Visual feedback - highlight the section
        section.classList.add('highlight-section');
        setTimeout(() => section.classList.remove('highlight-section'), 1500);
        
        // Visual feedback for voice navigation
        updateVoiceStatus(`Navigating to ${sectionDisplayName}...`, 3000);
        speak(`Navigating to ${sectionDisplayName} section`);
        return true;
    }
    return false;
}

// Detect voice commands for navigation - supports many natural language variations
function processNavigationCommand(command) {
    const lower = command.toLowerCase();
    
    // Home section variations
    if (lower.match(/home|main page|top|go home|homepage|landing|start page|首页/i)) {
        return navigateToSection('home', 'Home');
    }
    // About section variations
    if (lower.match(/about|about me|who are you|tell me about yourself|bio|introduction|background|about section|know about you/i)) {
        return navigateToSection('about', 'About');
    }
    // Projects section variations
    if (lower.match(/project|projects|my projects|project section|show projects|portfolio|what projects|built|展示项目/i)) {
        return navigateToSection('projects', 'Projects');
    }
    // Experience section variations
    if (lower.match(/experience|work|job|career|experience section|work experience|professional|internship|employment|工作经历/i)) {
        return navigateToSection('experience', 'Experience');
    }
    // Contact section variations
    if (lower.match(/contact|contact me|reach me|connect|email|phone|get in touch|contact section|social|linkedin|联系/i)) {
        return navigateToSection('contact', 'Contact');
    }
    // Resume commands
    if (lower.match(/download resume|resume download|get resume|download my resume/i)) {
        speak("Downloading resume");
        document.getElementById('downloadResumeBtn').click();
        return true;
    }
    if (lower.match(/view resume|show resume|see resume|open resume/i)) {
        speak("Opening resume");
        document.getElementById('viewResumeBtn').click();
        return true;
    }
    
    return false;
}

// ======================== VOICE RECOGNITION ========================
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isListening = false;

if (SpeechRec) {
    recognition = new SpeechRec();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
}

const synth = window.speechSynthesis;
function speak(msg) {
    if (synth.speaking) synth.cancel();
    const utterance = new SpeechSynthesisUtterance(msg);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    synth.speak(utterance);
}

function updateVoiceStatus(message, duration = 4000) {
    const status = document.getElementById('voiceStatus');
    if (!status) return;
    status.textContent = message;
    status.classList.remove('hidden');
    if (status._timeoutId) clearTimeout(status._timeoutId);
    if (duration > 0) {
        status._timeoutId = setTimeout(() => {
            status.textContent = 'Voice ready';
        }, duration);
    }
}

// Answer general questions
function answerQuestion(question) {
    const q = question.toLowerCase();
    
    if (q.match(/hello|hi|hey|greetings/i)) {
        return "Hello! I'm Srustika's assistant. You can ask me to navigate: say 'go to about', 'show projects', 'experience section', or 'contact me'.";
    }
    if (q.match(/skills|what.*know|technologies/i)) {
        return "Srustika's skills include Python, Java, JavaScript, DBMS, and web development. She's also experienced with data analysis and AI tools.";
    }
    if (q.match(/education|degree|college|study/i)) {
        return "Srustika completed her BCA from Vidya First Grade College, Tumkur. She also studied PUC at Sarvodya PU College.";
    }
    if (q.match(/certification|certificate|courses/i)) {
        return "She holds certifications in DBMS and Python Essentials.";
    }
    if (q.match(/contact|email|phone|reach/i)) {
        return "You can contact Srustika at srustika@example.com or call 8147964340.";
    }
    if (q.match(/job|position|looking|internship|opportunity/i)) {
        return "Srustika is seeking entry-level positions as a Software Engineer, Testing Engineer, or Data Analyst. She's open to internships and full-time roles.";
    }
    if (q.match(/thank|thanks/i)) {
        return "You're welcome! Feel free to ask me anything or tell me to navigate anywhere on the portfolio.";
    }
    return null;
}

const voiceBtn = document.getElementById('voiceBtn');
if (recognition) {
    voiceBtn.addEventListener('click', () => {
        if (isListening) return;
        speak("Listening now. Say 'go to about', 'show projects', 'experience section', or 'contact me'.");
        updateVoiceStatus('Listening for your command...');
        voiceBtn.classList.add('listening-active');
        isListening = true;
        recognition.start();
    });
    
    recognition.onstart = () => {
        voiceBtn.classList.add('listening-active');
    };
    
    recognition.onresult = (event) => {
        const userCommand = event.results[0][0].transcript;
        console.log("Voice command:", userCommand);
        updateVoiceStatus(`Heard: ${userCommand}`, 5000);
        
        // First try navigation
        const navigated = processNavigationCommand(userCommand);
        
        if (!navigated) {
            const answer = answerQuestion(userCommand);
            if (answer) {
                speak(answer);
                updateVoiceStatus('Answered your question.');
            } else {
                speak("I can help you navigate. Try saying 'go to about', 'show projects', 'experience section', or 'contact me'.");
                updateVoiceStatus('Command not recognized. Please try again.');
            }
        }
    };
    
    recognition.onerror = (event) => {
        if (event.error !== 'no-speech') {
            speak("Sorry, I didn't catch that. Please try again.");
            updateVoiceStatus('Voice not recognized. Please try again.');
        } else {
            updateVoiceStatus('No speech detected. Please try again.');
        }
        voiceBtn.classList.remove('listening-active');
        isListening = false;
    };
    
    recognition.onend = () => {
        voiceBtn.classList.remove('listening-active');
        isListening = false;
        updateVoiceStatus('Voice ready');
    };
} else {
    voiceBtn.addEventListener('click', () => alert("Voice recognition not supported. Please use Chrome, Edge, or Safari."));
}

// ======================== CHAT FUNCTIONALITY ========================
const chatBtn = document.getElementById('chatBtn');
const chatModal = document.getElementById('chatModal');
const closeChatBtn = document.getElementById('closeChatBtn');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChatBtn');
const chatMessages = document.getElementById('chatMessages');

chatBtn.addEventListener('click', () => {
    chatModal.classList.toggle('hidden');
    if (!chatModal.classList.contains('hidden')) chatInput.focus();
});
closeChatBtn.addEventListener('click', () => chatModal.classList.add('hidden'));

function addChatMessage(text, isUser) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'}`;
    msgDiv.innerHTML = `<div class="max-w-xs px-4 py-2 rounded-lg ${isUser ? 'bg-accent text-darkblue font-semibold' : 'bg-darkblue/50 text-accent border border-accent/30'}">${text}</div>`;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleChatMessage() {
    const userMsg = chatInput.value.trim();
    if (!userMsg) return;
    chatInput.value = '';
    addChatMessage(userMsg, true);
    
    // Try navigation first
    const navigated = processNavigationCommand(userMsg);
    if (navigated) {
        addChatMessage("✅ Navigated to that section!", false);
    } else {
        const answer = answerQuestion(userMsg);
        if (answer) {
            addChatMessage(answer, false);
        } else {
            addChatMessage("I can help you navigate! Try saying 'go to about', 'show projects', 'experience section', or 'contact me'.", false);
        }
    }
}

sendChatBtn.addEventListener('click', handleChatMessage);
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleChatMessage(); });

// ======================== RESUME HANDLERS ========================
const resumeUrl = 'resume.rtf';
let resumeFile = null;
let resumeText = '';

document.getElementById('uploadResumeBtn').addEventListener('click', () => document.getElementById('resumeFileInput').click());
document.getElementById('resumeFileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        resumeFile = file;
        document.getElementById('introPara').innerHTML = `✨ Resume loaded: ${file.name} ✨`;
        if (file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (ev) => {
                resumeText = ev.target.result;
                speak("Resume uploaded successfully");
            };
            reader.readAsText(file);
        } else {
            resumeText = '';
            speak("Resume uploaded successfully");
        }
    }
});

document.getElementById('photoFileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        document.getElementById('profilePhoto').src = url;
        speak("Profile photo updated");
    }
});

document.getElementById('viewResumeBtn').addEventListener('click', () => {
    if (resumeFile && resumeText) {
        const win = window.open();
        win.document.write(`<pre style="background:#0A192F; color:#64FFDA; padding:20px; font-family:monospace;">${resumeText}</pre>`);
    } else if (resumeFile) {
        const win = window.open(URL.createObjectURL(resumeFile), '_blank');
        if (!win) alert('Please allow popups to open the resume.');
    } else {
        const win = window.open(resumeUrl, '_blank');
        if (!win) alert('Please allow popups to open the resume.');
    }
});

document.getElementById('downloadResumeBtn').addEventListener('click', () => {
    const link = document.createElement('a');
    if (resumeFile) {
        link.href = URL.createObjectURL(resumeFile);
        link.download = resumeFile.name;
    } else {
        link.href = resumeUrl;
        link.download = 'resume.rtf';
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// ======================== INITIAL GREETING & MOBILE MENU ========================
window.onload = () => {
    // Create floating background shapes
    for (let i = 0; i < 12; i++) {
        const div = document.createElement('div');
        const size = Math.random() * 100 + 30;
        div.style.width = size + 'px';
        div.style.height = size + 'px';
        div.style.left = Math.random() * 100 + '%';
        div.style.top = Math.random() * 100 + '%';
        div.style.animationDelay = Math.random() * 5 + 's';
        div.style.animationDuration = Math.random() * 15 + 8 + 's';
        document.getElementById('floatingBg').appendChild(div);
    }
    
    setTimeout(() => {
        speak("Welcome to Srustika's portfolio. You can say 'go to about', 'show projects', 'experience section', or 'contact me' to navigate instantly.");
    }, 1000);
};

// Mobile menu toggle
document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.toggle('hidden');
});

// Smooth scroll for nav links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('href');
        const section = document.querySelector(target);
        if (section) {
            const offset = 80;
            const pos = section.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({ top: pos - offset, behavior: 'smooth' });
        }
        document.getElementById('mobileMenu')?.classList.add('hidden');
    });
});

// Language selector
document.getElementById('langSelect').addEventListener('change', (e) => {
    const lang = e.target.value;
    if (lang === 'hi') speak("हिंदी में स्वागत है। 'अबाउट पर जाएं' कहें");
    if (lang === 'es') speak("Bienvenido. Di 'ir a about' para navegar");
    if (lang === 'en') speak("Language set to English");
});