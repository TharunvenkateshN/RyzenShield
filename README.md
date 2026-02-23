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

## ✨ Key Features

- **🔍 Hybrid PII Scanning**: Combines high-speed Regex patterns with deep SpaCy NLP (Named Entity Recognition) to detect Emails, API Keys, Passwords, and more.
- **🛡️ Secure Browser Integration**: Intercepts input in real-time, preventing sensitive data from being leaked to LLMs or web forms.
- **🎭 Hardware Shadow Tokens**: Automatically masks PII with "Shadow Tokens" (e.g., `[RS-MAIL-01]`) for zero-knowledge interactions.
- **⚡ XDNA Accelerated**: Optimized for AMD Ryzen AI NPUs to ensure the security layer doesn't slow down your workflow.
- **📊 Live Hardware Pulse**: Real-time dashboard showing NPU utilization and latency comparisons.

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
