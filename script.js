document.getElementById('start-comparison').addEventListener('click', startComparison);
document.getElementById('file-input').addEventListener('change', handleFileUpload);
document.getElementById('choose-video1').addEventListener('click', () => chooseVideo(1));
document.getElementById('choose-video2').addEventListener('click', () => chooseVideo(2));
document.getElementById('choose-both').addEventListener('click', () => choosebothVideos());
document.getElementById('continue-selection').addEventListener('click', continueSelection);
document.getElementById('status-panel').addEventListener('click', showStatusPopup());
document.getElementById('close-status').addEventListener('click', closeStatusPopup());

const statusPopup = document.getElementById('status-popup');
const drawButton = document.getElementById('choose-both');
const chooseVideo1 = document.getElementById('choose-video1');
const chooseVideo2 = document.getElementById('choose-video2');

let videoLinks = [];
let videoTitles = [];
let results = [];
let winners = [];
let currentPair = 0;
let drawCount = 0;

function startComparison() {
    const input = document.getElementById('links-input').value.trim();
    const errorMessage = document.getElementById('error-message');
    errorMessage.style.display = 'none';

    if (input) {
        const links = input.split('\n').filter(link => link.trim() !== '');
        videoLinks = links.map(convertToEmbedLink);
    }

    if (videoLinks.length < 2) {
        errorMessage.textContent = "A lista deve conter pelo menos dois links.";
        errorMessage.style.display = 'block';
        return;
    }

    drawCount = videoLinks.length/4;
    drawCount = Math.floor(drawCount);
    
    drawButton.innerHTML = 'Empate (' + drawCount + ')';

    shuffleArray(videoLinks);
    fetchVideoTitles(videoLinks)
        .then(() => {
            document.getElementById('input-section').style.display = 'none';
            document.getElementById('comparison-section').style.display = 'block';
            showNextPair();
        })
        .catch(error => {
            console.error('Erro ao buscar títulos dos vídeos:', error);
            alert('Erro ao buscar títulos dos vídeos. Verifique os links e tente novamente.');
        });
}

function convertToEmbedLink(link) {
    let videoId = '';
    if (link.includes('youtube.com') || link.includes('music.youtube.com')) {
        const url = new URL(link);
        videoId = url.searchParams.get('v');
    } else if (link.includes('youtu.be')) {
        const url = new URL(link);
        videoId = url.pathname.slice(1);
    }
    return `https://www.youtube.com/embed/${videoId}`;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function fetchVideoTitles(links) {
    const videoIds = links.map(link => {
        const url = new URL(link);
        return url.pathname.split('/').pop();
    });

    const titlePromises = videoIds.map(videoId => fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`)
        .then(response => response.json())
        .then(data => data.title)
        .catch(() => 'Título não disponível'));

    videoTitles = await Promise.all(titlePromises);
}

function showNextPair() {
    if (currentPair < videoLinks.length - 1) {
        document.getElementById('video1').src = videoLinks[currentPair];
        document.getElementById('video2').src = videoLinks[currentPair + 1];
        chooseVideo1.innerHTML = '1 - ' + videoTitles[currentPair];
        chooseVideo2.innerHTML = '2 - ' + videoTitles[currentPair + 1];
        document.getElementById('video2-wrapper').style.display = 'block';
        document.getElementById('choose-video2').style.display = 'inline-block';
        if(videoLinks.length == 2){
            document.getElementById('choose-both').style.display = 'none';
        }else{
            document.getElementById('choose-both').style.display = 'inline-block';
        }
    } else if (currentPair === videoLinks.length - 1) {
        document.getElementById('video1').src = videoLinks[currentPair];
        chooseVideo1.innerHTML = 'Vote ' + videoTitles[currentPair];
        document.getElementById('video2-wrapper').style.display = 'none';
        document.getElementById('choose-video2').style.display = 'none';
        document.getElementById('choose-both').style.display = 'none';
    } else {
        document.getElementById('comparison-section').style.display = 'none';
        document.getElementById('results-section').style.display = 'block';
        displayResults();
    }
}

function chooseVideo(choice) {
    if (currentPair === videoLinks.length - 1) {
        //winners.push(videoLinks[currentPair]);
        results.push(currentPair);
    } else {
        results.push(currentPair + choice - 1);
    }
    currentPair += 2;
    showNextPair();
}

function choosebothVideos() {
    if(drawCount === 0){
        return;
    }

    if (currentPair === videoLinks.length - 1) {
        winners.push(videoLinks[currentPair]);
    } else {
        results.push(currentPair);
        results.push(currentPair + 1);
    }
    currentPair += 2;
    drawCount -= 1;

    drawButton.innerHTML = 'Empate (' + drawCount + ')';
    showNextPair();
}

function displayResults() {
    const resultsList = document.getElementById('results-list');
    resultsList.innerHTML = '';
    results.forEach(index => {
        const li = document.createElement('li');
        li.textContent = videoTitles[index];
        resultsList.appendChild(li);
    });

    winners = results.map(index => videoLinks[index]);
    if (winners.length > 1) {
        document.getElementById('continue-selection').style.display = 'block';
    } else {
        showWinner();
    }
}

function continueSelection() {
    videoLinks = winners;
    results = [];
    videoTitles = [];
    currentPair = 0;
    shuffleArray(videoLinks);
    fetchVideoTitles(videoLinks);
    document.getElementById('results-section').style.display = 'none';
    document.getElementById('continue-selection').style.display = 'none';
    document.getElementById('comparison-section').style.display = 'block';

    setTimeout(() => {
        showNextPair();
      }, 500);
}

function showWinner() {
    document.getElementById('results-section').style.display = 'none';
    document.getElementById('winner-section').style.display = 'flex';
    document.getElementById('winner-video').src = winners[0];
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const links = content.split('\n').filter(link => link.trim() !== '');
            videoLinks = links.map(convertToEmbedLink);
            document.getElementById('links-input').value = links.join('\n');
        };
        reader.readAsText(file);
    }
}

function showStatusPopup() {
    //statusPopup.style.display = 'flex'; // Exibe o popup
}

function closeStatusPopup() {
    //statusPopup.style.display = 'none';
}