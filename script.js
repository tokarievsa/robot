$(document).ready(() => {
  const langGoogle = {
    'en': ['English', 'Australian', 'Fallback'],
    'ar': 'Arabic',
    'hy': 'Armenian',
    'pt': ['Brazilian', 'Portuguese'],
    'zh-CN': 'Chinese',
    'cs': 'Czech',
    'da': 'Danish',
    'de': 'Deutsch',
    'nl': 'Dutch',
    'fi': 'Finnish',
    'fr': 'French',
    'el': 'Greek',
    'hi': 'Hindi',
    'hu': 'Hungarian',
    'id': 'Indonesian',
    'it': 'Italian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'la': 'Latin',
    'no': 'Norwegian',
    'pl': 'Polish',
    'ro': ['Romanian', 'Moldavian'],
    'ru': 'Russian',
    'sk': 'Slovak',
    'es': 'Spanish',
    'sv': 'Swedish',
    'ta': 'Tamil',
    'th': 'Thai',
    'tr': 'Turkish',
    'vi': 'Vietnamese',
    'af': 'Afrikaans',
    'sq': 'Albanian',
    'bs': 'Bosnian',
    'ca': 'Catalan',
    'hr': ['Croatian', 'Serbo-Croatian'],
    'eo': 'Esperanto',
    'is': 'Icelandic',
    'lv': 'Latvian',
    'mk': 'Macedonian',
    'sr': ['Montenegrin', 'Serbian'],
    'sw': 'Swahili',
    'cy': 'Welsh'
  }
  
  let joinSymbol = function(lang){
    if(lang === 'ar') return '!';
    else if (lang === 'hy' || lang === 'cs') return '...';
    return '@';
  };

  responsiveVoice.setDefaultVoice("Russian Male");
  const voicelist = responsiveVoice.getVoices();
  let name = 'незнакомец';
  $("[type = 'button']").on('click', ()=>{
    const nameInput = $("[type = 'text']").val();
    name = nameInput || name;
    $(nameInput).val('');
    $(".welcome").fadeOut(1000);
    setTimeout(()=>{
      $(".container").fadeIn(1000);
    }, 1000);

    const select = $("#voiceselection");
    $.each(voicelist, (i, voice)=>{
      select.append(
        $("<option>")
        .val(voice.name)
        .text(voice.name)
        .attr('data-lang', findLang(voice.name))
      );
    });

    select.val('Russian Male');


    const head = $('.head'),
          leftEye = $('.left-eye'), rightEye = $('.right-eye'),
          leftHand = $('.left-hand'), rightHand = $('.right-hand'),
          trunk = $('.trunk'),
          leftLeg = $('.left-leg'), rightLeg = $('.right-leg');

    const robot = [head, leftEye, rightEye, leftHand, rightHand, trunk, leftLeg, rightLeg];

    const sourceLang = 'ru';
    
    const url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=";

    let selectedOption = $('select option:selected');
    let targetLang = selectedOption.attr('data-lang');

    let greeting = ['друг-робот', `Здраствуй, ${name}`, 'Я твой друг-робот','Выбери язык, на котором я буду говорить, и наведи курсор на любую часть моего тела'].join(joinSymbol(targetLang));

    let firstGreeting = true;

    ajaxSimplePhrase(selectedOption, url, parseResponse);
    ajaxSimplePhrase(selectedOption, url, changeHeader, greeting);

    addEventVoice();
    const arrowTriger = setInterval(upAndDown, 500);

    select.on('change', ()=>{
      firstGreeting = false;
      
      clearInterval(arrowTriger);
      $('.fa-arrow-down').hide();
        selectedOption = $('select option:selected');
        greeting = greeting.split(joinSymbol(targetLang));
        targetLang = selectedOption.attr('data-lang');
        greeting = greeting.join(joinSymbol(targetLang));
        ajaxSimplePhrase(selectedOption, url, parseResponse);
        ajaxSimplePhrase(selectedOption, url, changeHeader, greeting);
    });

    function ajaxSimplePhrase(selectedOption, url, callback, phrase = false){
      
      let sourceText = ["Это голова", "Это левый глаз", "Это правый глаз", "Это левая рука", "Это правая рука", "Это моё тело", "Это левая нога", "Это правая нога"].join(joinSymbol(targetLang));

      phrase = phrase || sourceText;
      const fullUrl = url + sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(phrase);
      $.ajax({
        url: fullUrl,
        success: (data)=>{
          callback(data);
        }
      });
    }

    function parseResponse(data) {
      const speech = data[0][0][0].split(joinSymbol(targetLang));
      for(let i=0; i < robot.length; i++){
        robot[i].attr('data-voice', speech[i]);
      }
    }

    function changeHeader(data) {
      const speech = data[0][0][0].split(joinSymbol(targetLang));
      console.log(speech);
      const header = $('.container > h1');
      if(targetLang === 'ru' ||
         targetLang === 'sr' ||
         targetLang === 'mk'){
        header.css('font-family', 'Gabriela');
      } else {
        header.css('font-family', 'Mali');
      }
      $(header).text(speech[0]).css('text-transform', 'capitalize');
      if(firstGreeting){
        setTimeout(()=>{
          const lang = $(selectedOption).val();
          const text = [speech[1], speech[2], speech[3]].join('. ');
          responsiveVoice.speak(text, lang, {rate: 1.0});
        }, 2000);
      }
    }

    function findLang(voice){
      const keys = Object.keys(langGoogle);
      for(let i=0; i < keys.length;i++){
        const value = langGoogle[keys[i]];
        if (Array.isArray(value)){
          for(let j=0; j < value.length; j++){
            if(voice.search(value[j]) !== -1) return keys[i];
          }
        } else {
          if(voice.search(value) !== -1) return keys[i];
        }
      } 
    }

    function upAndDown() {
      const arrow = $(".fa-arrow-down");
      if(arrow.css('top') === '0px') {
        arrow.css('top', "-20px");
        arrow.css('opacity', 0.3);
      } else {
        arrow.css('top', "0px");
        arrow.css('opacity', 1);
      }
    }

    function addEventVoice(){
      for(let i=0; i < robot.length; i++){
        robot[i].on('mouseover', (event)=>{
          responsiveVoice.speak($(robot[i]).attr('data-voice'), $(selectedOption).val(), {rate: 1.0});
          event.stopPropagation();
        });
        robot[i].on('mouseout', ()=>{
          responsiveVoice.cancel();
        });
      }
    }
  });
});