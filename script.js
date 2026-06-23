let countries = [];
let correctCountry = null;
let score = 0;
let filteredCountries = [];
let selectedContinent = "all";
let mode = "flag";
let time = 10;
let timerInterval;
let questionCount = 0;
let maxQuestions = 10;
let remaningCountries = [];

const flagImg = document.getElementById("flag");
const optionsDiv = document.getElementById("options");
const message = document.getElementById("message");
const scoreElement = document.getElementById("score");
const nextBtn = document.getElementById("nextBtn");

document.getElementById("continent").addEventListener("change", (e) => {
    selectedContinent = e.target.value;
    filterCountries();

    questionCount = 0;
    score = 0;
    scoreElement.textContent = score;

    clearInterval(timerInterval);

    generateQuestion();
});

document.getElementById("mode").addEventListener("change", (e) => {
    mode = e.target.value;
    resetGame();
});

fetch("https://api.geocoded.me/countries")
.then(res => res.json())
.then(data => {

    console.log(data.data[0]);
    console.log(data.data[0].flag)

    countries = data.data.map(c => ({
        name: { common: c.name },
        capital: [c.capital || ""],
        region: c.region || "Unknown",
        flags: { png: `https://flagcdn.com/w320/${c.iso2?.toLowerCase()}.png`}
    }));

    filteredCountries = countries;
    remaningCountries = [...countries]
    generateQuestion();
})
.catch(err => console.error(err));


function generateQuestion(){

    if(questionCount >= maxQuestions){
        endGame();
        return;
    }

    if(!filteredCountries || filteredCountries.length === 0){
        message.textContent = "No countries in this region";
        return;
    }

    startTimer();

    message.textContent = "";
    optionsDiv.innerHTML = "";

    let randomIndex = Math.floor(Math.random() * remaningCountries.length);

    correctCountry = remaningCountries[randomIndex];

    remaningCountries.splice(randomIndex, 1);

    if(remaningCountries.length === 0){
        remaningCountries = [...filterCountries];
    }

    if(mode === "flag"){
        flagImg.src = correctCountry.flags.png;
    } else {
        flagImg.src = "";
        message.textContent = correctCountry.capital?.[0];
    }

    let options = [];

    options.push(correctCountry.name.common);

    while(options.length < 4){

        let randomCountry =
            countries[Math.floor(Math.random() * countries.length)]
            .name.common;

        if(!randomCountry.length) return;

        if(!options.includes(randomCountry)){
            options.push(randomCountry);
        }

        console.log(countries[0].flag);
    }

    options.sort(() => Math.random() - 0.5);

    options.forEach(option => {

        const btn = document.createElement("button");
        btn.classList.add("option-btn");
        btn.textContent = option;
        btn.onclick = () => checkAnswer(option);
        optionsDiv.appendChild(btn);
    });
}

function checkAnswer(selected){

    clearInterval(timerInterval);

    const buttons =
        document.querySelectorAll(".option-btn");

    buttons.forEach(btn => btn.disabled = true);

    questionCount++;

    if(selected === correctCountry.name.common){

        message.textContent = "✅ Correct";

        score++;

    }else{

        message.textContent =
            "❌ Wrong - " +
            correctCountry.name.common;

    }

    scoreElement.textContent = score;

    if(questionCount >= maxQuestions){
        setTimeout(endGame, 800);
    } else{
        setTimeout(generateQuestion, 800);
    }
}

function saveScore(){

    localStorage.setItem("score", score);

}

function filterCountries(){

    console.log("selected:", selectedContinent);

    if(selectedContinent === "all"){
        filteredCountries = countries;
    } else {
        filteredCountries = countries.filter(c =>
            c.region && c.region.toLowerCase() === selectedContinent.toLocaleLowerCase()
        );
    }
    console.log(filteredCountries);
}

function startTimer(){

    clearInterval(timerInterval);
    time = 10;

    timerInterval = setInterval(() => {

        time--;

        if(time <= 0){
            clearInterval(timerInterval);        }

    }, 1000);
}

function endGame(){

    clearInterval(timerInterval);

    let percent = Math.round((score / maxQuestions) * 100);

    showResultChart(percent);

    optionsDiv.innerHTML = "";
    flagImg.src = "";
    message.textContent = "Game Over";
}

function showResultChart(percent){

    new Chart(document.getElementById("chart"), {
        type: "pie",
        data: {
            labels: ["Correct", "Wrong"],
            datasets: [{
                data: [percent, 100 - percent]
            }]
        }
    });

}

function resetGame(){

    clearInterval(timerInterval);

    score = 0;
    questionCount = 0;

    scoreElement.textContent = score;

    generateQuestion();

    if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
}