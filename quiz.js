let mcqs = [];
let currentIndex = 0;
let userAnswers = {};
let timer;

// 📌 Load Excel File
document.getElementById("excelFile").addEventListener("change", function(e) {
    let file = e.target.files[0];
    let reader = new FileReader();

    reader.onload = function(event) {
        let data = new Uint8Array(event.target.result);
        let workbook = XLSX.read(data, { type: "array" });

        let sheet = workbook.Sheets[workbook.SheetNames[0]];
        let rows = XLSX.utils.sheet_to_json(sheet);

        mcqs = rows.map(r => ({
            question: r["Question"],
            options: [r["A"], r["B"], r["C"], r["D"]],
            answer: r["Correct Answer"]
        }));

        // RANDOMIZE all MCQs
        mcqs = shuffle(mcqs);

        startTimer(300); // 5 minutes
        showQuestion();
    };

    reader.readAsArrayBuffer(file);
});

// 📌 Shuffle Questions
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

// 📌 Display Question
function showQuestion() {
    let q = mcqs[currentIndex];

    document.getElementById("quiz-container").innerHTML = `
        <div class="question-box">
            <h3>Q${currentIndex + 1}. ${q.question}</h3>
            <div class="options">
                ${q.options
                    .map(
                        (opt, i) => `
                    <label>
                        <input type="radio" name="option" value="${String.fromCharCode(65+i)}"
                        ${userAnswers[currentIndex] === String.fromCharCode(65+i) ? "checked" : ""}>
                        ${String.fromCharCode(65+i)}. ${opt}
                    </label>
                `
                    )
                    .join("")}
            </div>
        </div>
    `;

    document.getElementById("prevBtn").disabled = currentIndex === 0;
    document.getElementById("nextBtn").style.display =
        currentIndex === mcqs.length - 1 ? "none" : "inline-block";
    document.getElementById("submitBtn").style.display =
        currentIndex === mcqs.length - 1 ? "inline-block" : "none";
}

// 📌 Save Answer
function saveAnswer() {
    let selected = document.querySelector('input[name="option"]:checked');
    if (selected) {
        userAnswers[currentIndex] = selected.value;
    }
}

// 📌 Navigation
function nextQuestion() {
    saveAnswer();
    currentIndex++;
    showQuestion();
}

function prevQuestion() {
    saveAnswer();
    currentIndex--;
    showQuestion();
}

// 📌 Timer
function startTimer(seconds) {
    timer = setInterval(() => {
        document.getElementById("time").innerText = seconds;
        seconds--;

        if (seconds < 0) {
            clearInterval(timer);
            submitQuiz();
        }
    }, 1000);
}

// 📌 Submit Quiz (with wrong answer list)
function submitQuiz() {
    saveAnswer();
    clearInterval(timer);

    let score = 0;
    let wrongList = [];

    mcqs.forEach((q, i) => {
        if (userAnswers[i] === q.answer) {
            score++;
        } else {
            wrongList.push({
                question: q.question,
                userAnswer: userAnswers[i] || "Not Answered",
                correctAnswer: q.answer,
                options: q.options
            });
        }
    });

    // Final score
    let resultHTML = `<h2>Your Score: ${score} / ${mcqs.length}</h2>`;

    // Wrong answers list
    if (wrongList.length > 0) {
        resultHTML += `<h3>❌ Wrongly Answered Questions:</h3>`;
        wrongList.forEach((item, index) => {
            resultHTML += `
                <div style="border:1px solid #ccc; padding:10px; margin:10px 0; border-radius:8px; background:#fafafa;">
                    <b>Q${index + 1}.</b> ${item.question} <br><br>

                    <b>Your Answer:</b> 
                    <span style="color:red;">${item.userAnswer}</span><br>

                    <b>Correct Answer:</b> 
                    <span style="color:green;">${item.correctAnswer}</span><br><br>

                    <b>Options:</b><br>
                    A. ${item.options[0]} <br>
                    B. ${item.options[1]} <br>
                    C. ${item.options[2]} <br>
                    D. ${item.options[3]} <br>
                </div>
            `;
        });
    } else {
        resultHTML += `<p>🎉 Excellent! All answers are correct.</p>`;
    }

    document.getElementById("result").innerHTML = resultHTML;
}
