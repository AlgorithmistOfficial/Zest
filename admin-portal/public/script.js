document.getElementById('examForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.getElementById('scheduleBtn');
    const statusMsg = document.getElementById('statusMessage');
    
    // Disable button and show loading
    btn.disabled = true;
    btn.innerHTML = '<span>Scheduling...</span><div class="spinner"></div>';
    statusMsg.classList.add('hidden');

    // Get values
    const examName = document.getElementById('examName').value;
    const rawDate = document.getElementById('examDate').value; // yyyy-mm-dd
    const rawTime = document.getElementById('examTime').value; // hh:mm
    const duration = parseInt(document.getElementById('duration').value);
    const difficultyLevel = document.getElementById('difficultyLevel').value;
    const totalMarks = parseInt(document.getElementById('totalMarks').value);
    const passingMarks = parseInt(document.getElementById('passingMarks').value);
    const topics = document.getElementById('topics').value.split(',').map(s => s.trim());
    const status = document.getElementById('status').value;

    // Format Date: ddmmyyyy (Number)
    const dateParts = rawDate.split('-');
    const formattedDate = parseInt(`${dateParts[2]}${dateParts[1]}${dateParts[0]}`);

    // Format Time: hhmmss (Number)
    const timeParts = rawTime.split(':');
    const formattedTime = parseInt(`${timeParts[0]}${timeParts[1]}00`);

    const payload = {
        examName,
        examDate: formattedDate,
        examTime: formattedTime,
        duration,
        topics,
        totalMarks,
        passingMarks,
        status,
        difficultyLevel
    };

    try {
        const response = await fetch('https://Shreyansh6726-zest.hf.space/api/exams', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            statusMsg.textContent = 'Success! Exam has been scheduled in zest_db.';
            statusMsg.className = 'success';
            statusMsg.classList.remove('hidden');
            document.getElementById('examForm').reset();
        } else {
            throw new Error(data.message || 'Failed to schedule exam');
        }
    } catch (err) {
        statusMsg.textContent = 'Error: ' + err.message;
        statusMsg.className = 'error';
        statusMsg.classList.remove('hidden');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>Schedule Exam</span><i data-lucide="arrow-right"></i>';
        lucide.createIcons();
    }
});
