$(document).ready(function() {
    log('Window width', $(window).width());
    log('Window height', $(window).height());

    var targets = {
        words: {
            easy: ["casa", "bota", "roda", "pipa", "vida"],
            medium: ["carro", "portal", "retrato", "cadeira"],
            hard: ["computador", "ventilador", "cafeteria"]
        },

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

    let target = pickTarget();

    $(".target").text(target);

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
	        og('Silencio detectado. Reconhecimento de voz desativado');
		}

		recognition.onerror = function(event) {
            if(event.error == 'no-speech') {
                log('Nenhuma fala foi detectada.');
			}
		}

		recognition.onend = function(event) {
            log('Reconhecimento de voz finalizado');
			//if (continuous) recognition.start();
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

            if (!transcript.includes(target)) {
                $(".board").css('box-shadow','0 3px 3px 1px rgba(255,64,64,0.3);');
            } else {
                $(".board").css('box-shadow','0 3px 3px 1px rgba(64,255,64,0.3);');
                continuous = false;
            }
        }

	} catch(e) {
		console.error(e);
	}

    recognition.start();

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

    function pickTarget (mode = 'words', dificulty = 'medium') {
        let randomRange = targets[mode][dificulty].length;
        let pick = parseInt( Math.random() * randomRange );
        let target = targets[mode][dificulty][pick];
        log('Target selected', target);
        return target;
    }

    function log (message, value = null, type = "info") {
        console.log('[' + type.toUpperCase() + '] ' + message + (value ? ': ' + value : ''));
    }
});