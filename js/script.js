//<![CDATA[ 
$(window).scroll(function(){
        $("#floatbar").css({position:'fixed',left:'0',top:'0',width:'100%'});
});
//]]> 
var quote_data = null;
var markov_starter = {};
var markov_data = {};
var markov_starter_sum = 0;
var markov_data_sums = {};
var inv_m = true;

var max_iters = 50;

var word_valid = "[a-zA-Z0-9\-’,]";

function stripNonWord(word){
    // Returns word and any non-word appended
    // Strips all from it though
    // "a!" -> ("a","!")
    // "!a!" -> ("a","!")
    // "a!a?" -> ("a","!?")
    var new_word = "";
    var non_word = "";
    var seen_word_yet = false;
    var started_end = false;
    for (i=0; i<word.length; i++){
        var charat = word[i];
        if (charat.match(word_valid)){
            seen_word_yet = true;
            if (!started_end){
                new_word += charat;
            }
        } else {
            if (seen_word_yet){
                non_word += charat;
                started_end = true;
            }
        }
    }
    return [new_word, non_word.replace(/"/g,"")];
}

function makeMarkovData(){
    markov_starter = {};
    markov_data = {};
    markov_starter_sum = 0;
    markov_data_sums = {};
    for (quote in quote_data){
        var quote_table = quote.split(" ");
        var last_word = null;
        var ended_sentence = false;
        for (word_index in quote_table){
            word = quote_table[word_index].toLowerCase();
            san_word = stripNonWord(word);
            word = san_word[0];
            var punct_word = san_word[1];

            if (punct_word != ""){
                ended_sentence = true;
            }
            // First edit mat for last word
            if (last_word==null){
                var t = markov_starter[word];
                if (t == null){
                    markov_starter[word] = 1;
                } else {
                    markov_starter[word] ++;
                }
            } else { 
                // Else
                var t = markov_data[last_word];
                if (t==null){
                    markov_data[last_word] = {};
                }
                var t = markov_data[last_word][word];
                if (t==null){
                    markov_data[last_word][word] = 1;
                } else {
                    markov_data[last_word][word] ++;
                }
            }
            last_word = word;
            if (ended_sentence){
                last_word = null;
                var t = markov_data[word];
                if (t==null){
                    markov_data[word] = {};
                }
                var t = markov_data[word][punct_word];
                if (t==null){
                    markov_data[word][punct_word] = 1;
                } else {
                    markov_data[word][punct_word]++;
                }
                ended_sentence = false;
            }
        }
        // If it ended without punctuation
        if (last_word != null){
            t = markov_data[null]
            if (t==null){
                markov_data[null] = 1;
            } else {
                markov_data[null]++;
            }
        }
    }
    markov_starter_sum = 0;
    markov_data_sums = {};
    for (k in markov_starter){
        markov_starter_sum += markov_starter[k];
    }
    for (word in markov_data){
        markov_data_sums[word] = 0;
        for (second_word in markov_data[word]){
            markov_data_sums[word] += markov_data[word][second_word];
        }
    }
    console.log(markov_starter);
    console.log(markov_starter_sum);
    console.log(markov_data);
    console.log(markov_data_sums);
}

function makeMarkovQuote (){
    var m = 50;
    var starter = false;
    var word = randomProperty(markov_starter);
    //var word = weightedProperty(markov_starter,markov_starter_sum);
    word = capitalizeFirstLetter(word);
    var s = word;
    var next_word = null
    while (word != null){
        m--;
        if (m==0){return s;}
        var arr = null;
        if (starter){
            arr = markov_starter;
            next_word = capitalizeFirstLetter(randomProperty(arr));
            //var temp = weightedProperty(arr,markov_starter_sum);
            //next_word = capitalizeFirstLetter(temp);
            starter = false;
        } else {
            arr = markov_data[word.toLowerCase()];
            //next_word = randomProperty(arr);
            next_word = weightedProperty(arr,markov_data_sums[word.toLowerCase()]);
        }
        if (next_word != null){
            if (!next_word.match(word_valid)){
                s += next_word;
                starter = true;
                // Chance to end -> 50%
                if (Math.random() >= 0.5){next_word = null;}
            } else {
                if (next_word=="i"){
                    s += " " + next_word.toUpperCase();
                } else {
                    s += " " + next_word;
                }
            }
        }
        word = next_word;
        if (word!=null){
            word = word.toLowerCase();
        }
    }
    return s;
}

function randomProperty(obj) {
    if (obj==null){return null;}
    var keys = Object.keys(obj);
    return keys[ keys.length * Math.random() << 0];
};

function weightedProperty(obj,total){
    // {key:int ...}
    console.log("Weighted property");
    console.log(obj);
    console.log(total);
    var val = 1+(total*Math.random() << 0);
    console.log(val);
    keys = Object.keys(obj);
    console.log(keys);
    for (k=0; i<keys.length; k++){
        key = keys[k];
        val -= obj[key];
        if (val<=0){console.log(key);return key;}
    }
    console.log(keys[keys.length-1]);
    return keys[keys.length-1];
}

function capitalizeFirstLetter(string) {
    if (string==null){return null;}
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function addMarkov(list){
    for (i = 0; i < max_iters;i++){
        var l_item = document.createElement("li");
        list.appendChild(l_item);

        var quote_content = document.createElement("p");
        quote_content.setAttribute("id","quote_content");
        quote_content.innerHTML = makeMarkovQuote();
        l_item.appendChild(quote_content);

        var quote_name = document.createElement("p");
        quote_name.setAttribute("id","quote_name");
        quote_name.innerHTML = "- Graeme Bailey";
        l_item.appendChild(quote_name);
    }
}

window.onscroll = function(ev) {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight-200) {
        // Make markov chain
        var myElem = document.getElementById('makequotes');
        var myList = document.getElementById('quote_list');
        if (myElem != null && myList != null){
            var list = myList;
            if (inv_m) {
                $.getJSON('quotes.json', function (data){
                    inv_m = (quote_data != data);
                    quote_data = data;
                    if (inv_m) {makeMarkovData();}
                    addMarkov(list);
                });
            } else {
                addMarkov(list);
            }
        }
    }
};

$(document).ready( function() {
    var myElem = document.getElementById('quotes');
    if (myElem != null){
        var list = document.createElement("ul");
        list.setAttribute("id","quote_list");
        myElem.appendChild(list);
        $.getJSON('quotes.json', function (data){
            inv_m = (quote_data != data);
            quote_data = data;
            $.each(quote_data, function(key, val){
                var l_item = document.createElement("li");
                list.appendChild(l_item);

                var quote_content = document.createElement("p");
                quote_content.setAttribute("id","quote_content");
                quote_content.innerHTML = key;
                l_item.appendChild(quote_content);

                var quote_name = document.createElement("p");
                quote_name.setAttribute("id","quote_name");
                quote_name.innerHTML = val;
                l_item.appendChild(quote_name);
            });
            // Rebuild markov chain
            if (inv_m){makeMarkovData();}
        });
    }

    // Make markov chain
    var myElem = document.getElementById('makequotes');
    if (myElem != null){
        var list = document.createElement("ul");
        list.setAttribute("id","quote_list");
        myElem.appendChild(list);
        if (inv_m) {
            $.getJSON('quotes.json', function (data){
                inv_m = (quote_data != data);
                quote_data = data;
                if (inv_m) {makeMarkovData();}
                addMarkov(list);
            });
        } else {
            addMarkov(list);
        }
    }
});
