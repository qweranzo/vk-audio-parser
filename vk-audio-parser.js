// This browser console script downloads JSON with the next audio data: Artist, Title, Subtitle, Duration, VK Context (wall, recommended, added, explore, etc...) 
// How to:
//      1) Open vk.com page with audio (wall, post, playlist, messages, etc...)
//      2) Reload page 
//      3) Scroll all the tracks on the page 
//      4) Past and execute script in browser console

function getPlaylistName () {
    var name;
    // if playlist isn't opened
    if(!document.getElementsByClassName('audio_pl_snippet_info_maintitle')[0]) {
        name = "VK-Page__" + document.title.replace(" ","-")+".json";
    } else {
        name = "VK-PlayList__" + document.getElementsByClassName('audio_pl_snippet_info_maintitle')[0].innerHTML;
    }
    return name;
}

function createExportDataArray () {
    var all_divs = document.querySelectorAll("div");
    var one_track_data;
    var tracks_data = [];
    
    all_divs.forEach(div => {
        one_track_data = extractTrackDataFromDiv(div);
        if(one_track_data) {
            tracks_data.push(one_track_data);
        }
    });

    // replace html entities with unicode symbols
    tracks_data.forEach(data => {
        for (prop in data) {
            if (typeof data[prop] == "string") {
                data[prop] = decodeHTMLEntities(data[prop]);
            }
        }
    });

    // "%c TEXT" - Chrome feature to stylize console output with CSS
    console.log("%c Document Name: ", "background-color: #000; color: #af0", getPlaylistName());
    console.log("%c Tracks Data: ", "background-color: #000; color: #af0", tracks_data);

    if (tracks_data.length > 0) {
        downloadExportDataArray(tracks_data, getPlaylistName());
    } else {
        console.warn ("empty");
    }
}

// extract track data - {number, 'vk_context', 'artist', 'title', 'subtitle', duration} from <div> element
var track_counter=0;
function extractTrackDataFromDiv (div) {
    var is_wallpost_audio = div.getAttribute("data-task-click");
    var audio_data;

    if (div.getAttribute("data-audio")) {
        track_counter++;
        audio_data = div.getAttribute("data-audio");

        // there are two types of audio <div>: 'THE WALL POST' and 'NOT THE WALL POST', they're look different 
        // that's why I used different ways to extract data
        if(is_wallpost_audio) {

            var track = {
                number: track_counter,
                vk_context: JSON.parse(audio_data).context,
                artist: JSON.parse(audio_data).artist, 
                title: JSON.parse(audio_data).title, 
                subtitle: JSON.parse(audio_data).subtitle == null ? '' : JSON.parse(audio_data).subtitle,
                duration: JSON.parse(audio_data).duration
            }

        } else {

            var track = {
                number: track_counter,
                vk_context: JSON.parse(audio_data)[11],
                artist: JSON.parse(audio_data)[4], 
                title: JSON.parse(audio_data)[3], 
                subtitle: !JSON.parse(audio_data)[16] ? '' : JSON.parse(audio_data)[16],
                duration: JSON.parse(audio_data)[5]
            }
        }

        return track;
    }
}

function downloadExportDataArray (data, name) {
    var link = document.createElement("a");
    link.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data)));
    link.setAttribute("download", name+".json");
    document.body.appendChild(link);
    link.click();
}

function init () {
    if (!window.location.href.includes("vk.com/")) {
        console.error("VK only");
    } else {
        createExportDataArray();
    }
}

init();