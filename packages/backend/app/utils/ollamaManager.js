const { exec, spawn } = require('child_process');
const os = require('os');

class OllamaManager {
    constructor() {
        this.ollamaProcess = null;
    }

    async checkOllamaInstallation() {
        return new Promise((resolve) => {
            exec('ollama --version', (error) => {
                if (error) {
                    console.log('Ollama is not installed. Installing...');
                    this.installOllama().then(resolve);
                } else {
                    console.log('Ollama is already installed');
                    resolve(true);
                }
            });
        });
    }

    async checkModelAvailability() {
        return new Promise((resolve) => {
            exec('ollama list', (error, stdout) => {
                if (error) {
                    console.error('Error checking model availability:', error);
                    resolve(false);
                    return;
                }
                // Check if llama3.2:3b is in the list
                const hasModel = stdout.includes('llama3.2:3b');
                resolve(hasModel);
            });
        });
    }

    async installOllama() {
        return new Promise((resolve, reject) => {
            const platform = os.platform();
            let installCommand;

            if (platform === 'darwin') {
                installCommand = 'curl -fsSL https://ollama.com/install.sh | sh';
            } else if (platform === 'linux') {
                installCommand = 'curl -fsSL https://ollama.com/install.sh | sh';
            } else if (platform === 'win32') {
                installCommand = 'powershell -Command "Invoke-WebRequest -Uri https://ollama.com/install.ps1 -OutFile install.ps1; .\\install.ps1"';
            } else {
                reject(new Error('Unsupported platform'));
                return;
            }

            exec(installCommand, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(true);
                }
            });
        });
    }

    async pullModel() {
        return new Promise((resolve, reject) => {
            console.log('Pulling llama3.2:3b model...');
            exec('ollama pull llama3.2:3b', (error, stdout, stderr) => {
                if (error) {
                    console.error('Error pulling model:', error);
                    reject(error);
                    return;
                }
                console.log('Model pulled successfully:', stdout);
                resolve(true);
            });
        });
    }

    startOllama() {
        if (this.ollamaProcess) {
            console.log('Ollama is already running');
            return;
        }

        console.log('Starting Ollama service...');
        this.ollamaProcess = spawn('ollama', ['serve']);

        this.ollamaProcess.stdout.on('data', (data) => {
            console.log(`Ollama stdout: ${data}`);
        });

        this.ollamaProcess.stderr.on('data', (data) => {
            console.error(`Ollama stderr: ${data}`);
        });

        this.ollamaProcess.on('close', (code) => {
            console.log(`Ollama process exited with code ${code}`);
            this.ollamaProcess = null;
        });
    }

    stopOllama() {
        if (this.ollamaProcess) {
            this.ollamaProcess.kill();
            this.ollamaProcess = null;
            console.log('Ollama service stopped');
        }
    }
}

module.exports = new OllamaManager(); 