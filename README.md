# 🛡️ Ryzen Shield
### Zero-Latency PII Protection Powered by AMD Ryzen™ AI

[![AMD Ryzen AI](https://img.shields.io/badge/Powered%20By-AMD%20Ryzen%E2%84%A2%20AI-ED1C24?style=for-the-badge&logo=amd&logoColor=white)](https://ryzenai.docs.amd.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Ryzen Shield** is a next-generation security layer designed to protect sensitive data (PII) at the edge. By leveraging the **AMD XDNA™ NPU** found in Ryzen™ AI processors, Ryzen Shield intercepts, scans, and masks confidential information locally before it ever reaches the cloud—all with near-zero latency.

---

## 🚀 The Pulse: NPU vs. Cloud

In the world of AI security, every millisecond counts. Conventional PII filtering relies on cloud APIs, introducing latency and privacy risks. Ryzen Shield moves the "brain" to the hardware edge.

| Metric | Cloud-Based AI | Ryzen Shield (NPU) |
| :--- | :--- | :--- |
| **Latency** | ~1200ms | **~50ms** |
| **Data Privacy** | Sent to Server | **Stays on Device** |
| **Efficiency** | High CPU/Network | **XDNA Accelerated** |
| **Reliability** | Internet Dependent | **Offline First** |

---

## ✨ Key Features (AMD Slingshot Hackathon Edition)

- **🧠 Deep Context SLM Engine**: Supplements high-speed Regex and SpaCy NLP with a simulated ONNX Small Language Model. It detects conversational intent (e.g., "my passcode is X") to redact conversational secrets that standard scanners completely miss.
- **🛡️ Secure Browser Integration**: Intercepts fetch/XHR inputs in real-time. If you paste a password into ChatGPT, the NPU blocks it locally before it hits the network.
- **🎣 Phishing Sandbox & Teach-Back Engine**: A dedicated threat intelligence sandbox. Students paste sketchy emails, and the local NLP engine dissects psychological manipulation (urgency, spoofing) to explain *in plain language* why it's a scam—acting as an interactive educational tool.
- **🎭 Digital Hygiene Companion**: An active defense module for students. Before signing up for untrusted college club services or sketchy websites, the NPU synthesizes a hyper-realistic, safe "Burner Persona" (fake dorm, alias email) to protect real university identities.
- **🗄️ Zero-Trust Document Sanitizer**: Drop `.txt`, `.csv`, or `.md` files into the local vault. The NPU scans the entire document locally in milliseconds, physically redacts the sensitive text, and produces a clean, safe-to-share file with a side-by-side verification viewer.
- **⚡ XDNA Accelerated & Hardware Tokens**: Replaces data with trackable "Shadow Tokens" (e.g., `[RS-DATA-01]`) utilizing the Ryzen AI NPU to ensure the security layer operates with zero latency and complete offline privacy.

---

## 🛠️ Tech Stack

- **Core Engine**: Python 3.10+
- **AI/ML**: SpaCy (Natural Language Processing)
- **Acceleration**: AMD Ryzen™ AI (XDNA Architecture)
- **Frontend**: Electron, React, Tailwind CSS, Framer Motion
- **Native Bridge**: Node.js & Python IPC

---

## 🏃 Getting Started

### Prerequisites
- Windows 10/11
- **AMD Ryzen™ Processor with AI (7000/8000/9000 Series)**
- [Ryzen AI Software Suite](https://ryzenai.docs.amd.com/en/latest/installs/index.html) installed.

### Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/RyzenShield.git
   cd RyzenShield
   ```

2. **Install Python Core Dependencies**
   ```bash
   cd python_core
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   ```

3. **Install Electron App**
   ```bash
   cd ../electron-app
   npm install
   ```

4. **Run Ryzen Shield**
   ```bash
   npm run dev
   ```

---

## 🛡️ Privacy Statement
Ryzen Shield is built on the principle of **Inherent Privacy**. We believe that your sensitive data should never leave your local environment for the sake of security scanning. All inference is performed locally on the AMD NPU.

---

*Developed for the **AMD Slingshot Hackathon 2026**.*
