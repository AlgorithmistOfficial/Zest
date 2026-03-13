const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.text());

const TEMP_DIR = path.join(__dirname, 'temp');

if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

// --- ADD THIS ROOT HANDLER ---
app.get('/', (req, res) => {
    res.status(200).send('Java Compiler API is online and waiting for requests.');
});
// -----------------------------

app.post('/compile', (req, res) => {
    const code = req.body;
    if (!code) {
        return res.status(400).send('No code provided');
    }

    const sessionId = uuidv4();
    const sessionDir = path.join(TEMP_DIR, sessionId);
    fs.mkdirSync(sessionDir);

    const javaFile = path.join(sessionDir, 'Main.java');
    fs.writeFileSync(javaFile, code);

    exec(`javac Main.java`, { cwd: sessionDir }, (error, stdout, stderr) => {
        if (error || stderr) {
            fs.rmSync(sessionDir, { recursive: true, force: true });
            return res.send(stderr || error.message);
        }

        exec(`java Main`, { cwd: sessionDir, timeout: 5000 }, (runError, runStdout, runStderr) => {
            const output = runStdout + runStderr;
            fs.rmSync(sessionDir, { recursive: true, force: true });

            if (runError && runError.killed) {
                return res.send(output + '\n[Execution Timed Out]');
            }

            res.send(output || 'Program executed with no output.');
        });
    });
});

const PORT = process.env.PORT || 7860;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend compilation server running on port ${PORT}`);
});