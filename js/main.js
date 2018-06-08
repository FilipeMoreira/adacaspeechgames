$(document).ready(function() {
    log('Window width', $(window).width());
    log('Window height', $(window).height());

    var spec = "";

    var targets = {
        words: _words,

        animals: ["abelha", "cachorro", "cavalo", "coelho", "galinha", "gato", "rato"],

        numbers: {
            easy: {min: 0, max: 20},
            medium: {min: 21, max: 100},
            hard: {min: 101, max: 1000}
        },

        pictures: {
            medium: ["cavalo", "janela", "porta"]
        },

        silhouette: {
            medium: ["cavalo", "girafa"]
        }
    }

    var pixelHistory = $(window).width() * $(window).height(); // variable to track window size changes
    var boardSize = setBoardSize();
    log('Board size set', boardSize);

    // setting board resizing interval
    var resizeInterval = setInterval( () => {
        if (($(window).width() * $(window).height()) != pixelHistory) {
            pixelHistory = $(window).width() * $(window).height();
            setBoardSize();
            log('Board size set', boardSize);
        }
    }, 500);

    // game start
    var previousTargets = [];

    let mode = findGetParameter("mode");
    if (mode === null) mode = "words";
    else if (mode === "animals") {
        spec = findGetParameter("spec");
        if (spec === "") alert("No specification detected");
    }

    newRound(mode, previousTargets);

    // ---------------------- functions ----------------------
    function getBoardPreferredDimensions ( _ratio = 0.8 ) {
        var ratio = ( _ratio > 0 && ratio <= 1 ) ? _ratio : 0.8;
        return ($(window).width() < $(window).height()) ? $(window).width() * ratio : $(window).height() * ratio;
    }

    function setBoardSize () {
        let baseValue = getBoardPreferredDimensions();
        $(".board").css({
            height: baseValue + 'px',
            width: baseValue + 'px'
        });
        return baseValue;
    }

    function pickTarget (mode = 'words', previousTargets = []) {
        const randomRange = targets[mode].length;
        let pick;
        do
            pick = parseInt( Math.random() * randomRange );
        while(arrayContains(previousTargets, pick));
        let target = targets[mode][pick];
        log('Target selected', target);
        return target;
    }

    function newRound(mode, previousTargets) {
        let target = pickTarget(mode, previousTargets);
        console.log(previousTargets);
        previousTargets.push(target);
        console.log(previousTargets);

        $(".board").css('border','none');
        
        if (mode === "animals") $(".target").html(getImage("animals/" + spec, target));
        else $(".target").text(target);

        try {
            var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            var recognition = new SpeechRecognition();
            recognition.lang = 'pt-BR';
            recognition.maxAlternatives = 5;

            var continuous = true;

            recognition.onstart = function() { 
                log('Reconhecimento de voz ativado');
            }

            recognition.onspeechend = function() {
                log('Silencio detectado. Reconhecimento de voz desativado');
            }

            recognition.onerror = function(event) {
                if(event.error == 'no-speech') {
                    log('Nenhuma fala foi detectada.');
                }
            }

            recognition.onend = function(event) {
                log('Reconhecimento de voz finalizado');
                if (continuous) recognition.start();
            }

            recognition.onresult = function(event) {

                // event is a SpeechRecognitionEvent object.
                // It holds all the lines we have captured so far. 
                // We only need the current one.
                var current = event.resultIndex;

                // Get a transcript of what was said.
                var transcript = event.results[current][0].transcript;

                // Add the current transcript to the contents of our Note.
                log('Fala detectada', transcript);

                if (!transcript.toLowerCase().includes(target)) {
                    $(".board").css('border','solid 4px #ff5555');
                    setTimeout(() => {
                        $(".board").css('border','none');
                    }, 1000);
                } else {
                    $(".board").css('border','solid 4px #55ff55');
                    continuous = false;

                    endRound(mode, previousTargets);
                }
            }

        } catch(e) {
            console.error(e);
        }

        recognition.start();
    }

    function endRound(mode, previousTargets) {
        console.log(previousTargets);
        if (previousTargets.length >= _words.length) log("Game ended");
        else newRound(mode, previousTargets);
    }

    function getImage(tag, name) {
        return "<img src='./images/" + tag + "/" + name + ".png' style='max-height: 400px; max-width: 400px'/>";
    }

    function findGetParameter(parameterName) {
        var result = null,
            tmp = [];
        location.search
            .substr(1)
            .split("&")
            .forEach(function (item) {
              tmp = item.split("=");
              if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
            });
        return result;
    }

    function arrayContains(array, target) {
        array.forEach(function(item) {
            if (item == target) return true;
        });
        return false;
    }

    function log (message, value = null, type = "info") {
        console.log('[' + type.toUpperCase() + '] ' + message + (value ? ': ' + value : ''));
    }
});