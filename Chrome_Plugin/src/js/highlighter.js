let active_url = window.location.href;
var wordTooltips;
if (active_url.includes('wef')) {
    wordTooltips = {
        'consumption': 'This is likely the topic of the article',
        'emissions': 'This is likely discussing an important element that relates to the incident',
        'fashion': 'This is likely discussing an important element that relates to the incident',
        'c40': 'This is likely discussing an important element that relates to the incident',
        'global': 'This is likely a related location to the incident discussed in the article',
    };
}
else if (active_url.includes('kruger')) {
    wordTooltips = {
        'miss': 'This is likely discussing an important element that relates to the incident',
        'usa': 'This is likely discussing an important element that relates to the incident',
        'man': 'This is likely discussing an important element that relates to the incident',
        'told': 'This is potentially a charged word that may need further examination',
        'boycotts': 'This is potentially a charged word that may need further examination',
    };

}
else if (active_url.includes('purple')) {
    wordTooltips = {
        'biden': 'This is likely discussing an important person that relates to the incident',
        'heart': 'This is likely discussing an important element that relates to the incident',
        'purple': 'This is likely discussing an important element that relates to the incident',
        'war': 'This is likely discussing an important element that relates to the incident',
        'impossible': 'This is potentially a charged word that may need further examination',
        'claims': 'This is potentially a charged word that may need further examination',
    };
}
else if (active_url.includes('cbs')) {
    wordTooltips = {
        'cocaine': 'This is likely discussing an important element that relates to the incident',
        'visiting': 'This is likely discussing an important element that relates to the incident',
        'tours': 'This is likely discussing an important element that relates to the incident',
        'secret': 'This is likely discussing an important element that relates to the incident',
        'service': 'This is likely discussing an important element that relates to the incident',
        'white': 'This is likely a related location to the incident discussed in the article',
        'house': 'This is likely a related location to the incident discussed in the article',
    };
}
else if (active_url.includes('fourth')) {
    wordTooltips = {
        'holiday': 'This is likely discussing an important element that relates to the incident',
        'weekend': 'This is likely discussing an important element that relates to the incident',
        'gun': 'This is likely discussing an important element that relates to the incident',
        '17': 'This is likely discussing an important element that relates to the incident',
        'shootings': 'This is potentially a charged word that may need further examination',
        'mass': 'This is potentially a charged word that may need further examination',
        'killed': 'This is potentially a charged word that may need further examination',
    };
}
else if (active_url.includes('fox')) {
    wordTooltips = {
        'biden': 'This is likely discussing an important person that relates to the incident',
        'trump': 'This is likely discussing an important person that relates to the incident',
        'cocaine': 'This is likely discussing an important element that relates to the incident',
        'discovery': 'This is likely discussing an important element that relates to the incident',
        'white': 'This is likely a related location to the incident discussed in the article',
        'house': 'This is likely a related location to the incident discussed in the article',
        'wing': 'This is likely a related location to the incident discussed in the article',
        'attacks': 'This is potentially a charged word that may need further examination',s
    };
}

function highlightWord(node, word) {
    let searchWord = new RegExp(`\\b(${word})\\b`, 'gi');
    let replaceWith = `<mark class='highlighted-word' style='background-color: lightgray;' data-tooltip="${wordTooltips[word] || ''}">$1</mark>`;

    let childNodes = Array.from(node.childNodes);
    childNodes.forEach(child => {
        if (child.nodeType === Node.TEXT_NODE && child.textContent.match(searchWord)) {
            let newHTML = child.textContent.replace(searchWord, replaceWith);
            let tempDiv = document.createElement('div');
            tempDiv.innerHTML = newHTML;
            let newNodes = Array.from(tempDiv.childNodes);
            newNodes.forEach(newNode => node.insertBefore(newNode, child));
            node.removeChild(child);
        } else if (child.nodeType === Node.ELEMENT_NODE && ['SCRIPT', 'STYLE', 'A', 'IMG'].indexOf(child.nodeName) === -1) {
            highlightWord(child, word);
        }
    });
}

function attachTooltipEvents() {
    let highlightedElements = document.querySelectorAll('.highlighted-word');
    highlightedElements.forEach(wordElement => {
        let tooltipText = wordElement.dataset.tooltip;
        let tooltip;
        let tooltipTimer;

        wordElement.addEventListener('mouseover', function() {
            tooltip = document.createElement('div');
            tooltip.className = 'word-tooltip';
            tooltip.style.position = 'absolute';
            tooltip.style.backgroundColor = '#000';
            tooltip.style.color = '#fff';
            tooltip.style.padding = '5px';
            tooltip.style.borderRadius = '5px';
            tooltip.style.zIndex = '1000';
            tooltip.innerText = tooltipText;
            document.body.appendChild(tooltip);
            tooltip.style.top = `${wordElement.getBoundingClientRect().top + window.pageYOffset}px`;
            tooltip.style.left = `${wordElement.getBoundingClientRect().left}px`;

            tooltip.addEventListener('mouseover', function() {
                clearTimeout(tooltipTimer);
            });

            tooltip.addEventListener('mouseout', function() {
                tooltipTimer = setTimeout(() => {
                    if (tooltip) {
                        tooltip.remove();
                        tooltip = null;
                    }
                }, 3000);
            });
        });

        wordElement.addEventListener('mouseout', function() {
            tooltipTimer = setTimeout(() => {
                if (tooltip) {
                    tooltip.remove();
                    tooltip = null;
                }
            }, 1);
        });
    });
}
setTimeout(function() {
    // Call highlightWord function for each word
    for(let word in wordTooltips) {
        highlightWord(document.body, word);
    }

    // Attach tooltip events after highlighting words
    attachTooltipEvents();
}, 5250); 
