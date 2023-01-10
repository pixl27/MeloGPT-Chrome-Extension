let isWebAccessOn = true;
let isProcessing = false;
var numWebResults = 1;
var timePeriod = "";
var region = "";
var textarea;

chrome.storage.sync.get(["num_web_results", "web_access", "region"], (data) => {
    numWebResults = data.num_web_results;
    isWebAccessOn = data.web_access;
    region = data.region || "wt-wt";
});


function showErrorMessage(e) {
    console.info("MeloGPT error --> API error: ", e);
    var errorDiv = document.createElement("div");
    errorDiv.classList.add("web-chatgpt-error", "absolute", "bottom-0", "right-1", "dark:text-white", "bg-red-500", "p-4", "rounded-lg", "mb-4", "mr-4", "text-sm");
    errorDiv.innerHTML = "<b>An error occurred</b><br>" + e + "<br><br>Check the console for more details.";
    document.body.appendChild(errorDiv);
    setTimeout(() => { errorDiv.remove(); }, 5000);
}

function pasteWebResultsToTextArea(results, query) {
    let counter = 1;
    let length = 15894
    results = results.replace(/[^a-zA-Z\d]/g, '');
    let reduceddata =  results.length > length ? results.substring(0, length) : results;
    reduceddata = "Summarize this and tell me " + query + " :" + reduceddata
    //let formattedResults = 
    textarea.value = reduceddata;
}

function pressEnter() {
    textarea.focus();
    const enterEvent = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'Enter',
        code: 'Enter'
    });
    textarea.dispatchEvent(enterEvent);
}

function onSubmit(event) {
    if (event.shiftKey && event.key === 'Enter') {
        return;
    }

    if ((event.type === "click" || event.key === 'Enter') && isWebAccessOn && !isProcessing) {

        isProcessing = true;

        try {
            let query = textarea.value;
            textarea.value = "";

            query = query.trim();

            if (query === "") {
                isProcessing = false;
                return;
            }

            api_search(query, numWebResults, timePeriod, region)
              .then( results => {

                let options = {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                        'X-RapidAPI-Key': '',
                        'X-RapidAPI-Host': 'tldrthis.p.rapidapi.com'
                    },
                    body: `{"url": "${results[0].href}","min_length":100,"max_length":300,"is_detailed":false}`
                };
                
               fetch('https://tldrthis.p.rapidapi.com/v1/model/abstractive/summarize-url/', options).then(response => response.json())
               .then(response => {
                pasteWebResultsToTextArea(response.article_text, query);
                pressEnter();
                isProcessing = false;
               })
               .catch(err => console.error(err));
                // console.log("response.json() "  + response)
               
                    // .then(async response => {return await response.json()})
                    // .then(response => console.log(response))
                    // .catch(err => console.error(err));


              });
        } catch (error) {
            isProcessing = false;
            showErrorMessage(error);
        }
    }
}

function updateTitleAndDescription() {
    const h1_title = document.evaluate("//h1[text()='ChatGPT']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (!h1_title) {
        return;
    }

    h1_title.textContent = "MeloGPT (Melody is UwU :3)";

    const div = document.createElement("div");
    div.classList.add("w-full", "bg-gray-50", "dark:bg-white/5", "p-6", "rounded-md", "mb-10", "border");
    div.textContent = "Welcome to MeloGPT , The ChatGPT that can access the web , follow me https://twitter.com/Mahery2K";
    h1_title.parentNode.insertBefore(div, h1_title.nextSibling);

}

function updateUI() {

    if (document.querySelector(".web-chatgpt-toolbar")) {
        return;
    }

    textarea = document.querySelector("textarea");
    if (!textarea) {
        return;
    }
    var textareaWrapper = textarea.parentNode;

    var btnSubmit = textareaWrapper.querySelector("button");

    textarea.addEventListener("keydown", onSubmit);

    btnSubmit.addEventListener("click", onSubmit);


    var toolbarDiv = document.createElement("div");
    toolbarDiv.classList.add("web-chatgpt-toolbar", "flex", "items-baseline", "gap-3", "mt-0");
    toolbarDiv.style.padding = "0em 0.5em";


    // Web access switch
    var toggleWebAccessDiv = document.createElement("div");
    toggleWebAccessDiv.innerHTML = '<label class="web-chatgpt-toggle"><input class="web-chatgpt-toggle-checkbox" type="checkbox"><div class="web-chatgpt-toggle-switch"></div><span class="web-chatgpt-toggle-label">Search on the web (Melody :3)</span></label>';
    toggleWebAccessDiv.classList.add("web-chatgpt-toggle-web-access");
    chrome.storage.sync.get("web_access", (data) => {
        toggleWebAccessDiv.querySelector(".web-chatgpt-toggle-checkbox").checked = data.web_access;
    });

    var checkbox = toggleWebAccessDiv.querySelector(".web-chatgpt-toggle-checkbox");
    checkbox.addEventListener("click", () => {
            isWebAccessOn = checkbox.checked;
            chrome.storage.sync.set({ "web_access": checkbox.checked });
        });


    // Number of web results
    // var numResultsDropdown = document.createElement("select");
    // numResultsDropdown.classList.add("text-sm", "dark:text-white", "ml-0", "dark:bg-gray-800", "border-0");

    // for (let i = 1; i <= 10; i++) {
    //     let optionElement = document.createElement("option");
    //     optionElement.value = i;
    //     optionElement.text = i + " result" + (i == 1 ? "" : "s");
    //     numResultsDropdown.appendChild(optionElement);
    // }

    // chrome.storage.sync.get("num_web_results", (data) => {
    //     numResultsDropdown.value = data.num_web_results;
    // });

    // numResultsDropdown.onchange = function () {
    //     numWebResults = this.value;
    //     chrome.storage.sync.set({ "num_web_results": this.value });
    // };

    // Time period
    var timePeriodLabel = document.createElement("label");
    timePeriodLabel.innerHTML = "Results from:";
    timePeriodLabel.classList.add("text-sm", "dark:text-white");

    var timePeriodDropdown = document.createElement("select");
    timePeriodDropdown.classList.add("text-sm", "dark:text-white", "ml-0", "dark:bg-gray-800", "border-0");

    var timePeriodOptions = [
        { value: "", label: "Any time" },
        { value: "d", label: "Past day" },
        { value: "w", label: "Past week" },
        { value: "m", label: "Past month" },
        { value: "y", label: "Past year" }
    ];

    timePeriodOptions.forEach(function (option) {
        var optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.innerHTML = option.label;
        optionElement.classList.add("text-sm", "dark:text-white");
        timePeriodDropdown.appendChild(optionElement);
    });

    timePeriodDropdown.onchange = function () {
        chrome.storage.sync.set({ "time_period": this.value });
        timePeriod = this.value;
    };

    // Region
    var regionDropdown = document.createElement("select");
    regionDropdown.classList.add("text-sm", "dark:text-white", "ml-0", "dark:bg-gray-800", "border-0");

    fetch(chrome.runtime.getURL('regions.json'))
        .then(function (response) {
        return response.json();
        })
        .then(function (regions) {
        regions.forEach(function (region) {
            var optionElement = document.createElement("option");
            optionElement.value = region.value;
            optionElement.innerHTML = region.label;
            optionElement.classList.add("text-sm", "dark:text-white");
            regionDropdown.appendChild(optionElement);
        });

        regionDropdown.value = region;
        });

    regionDropdown.onchange = function () {
        chrome.storage.sync.set({ "region": this.value });
        region = this.value;
    };

    toolbarDiv.appendChild(toggleWebAccessDiv);
    // toolbarDiv.appendChild(numResultsDropdown);
    toolbarDiv.appendChild(timePeriodDropdown);
    toolbarDiv.appendChild(regionDropdown);

    textareaWrapper.parentNode.insertBefore(toolbarDiv, textareaWrapper.nextSibling);

    toolbarDiv.parentNode.classList.remove("flex");
    toolbarDiv.parentNode.classList.add("flex-col");


    var bottomDiv = document.querySelector("div[class*='absolute bottom-0']");

    var footerDiv = document.createElement("div");

    var extension_version = chrome.runtime.getManifest().version;
    footerDiv.innerHTML = "<a href='https://github.com/qunash/chatgpt-advanced' target='_blank' class='underline'>MeloGPT extension v." + extension_version + "</a>. If you like the extension, please consider <a href='https://twitter.com/Mahery2K' target='_blank' class='underline'>follow me / support me :3</a>.";

    var lastElement = bottomDiv.lastElementChild;
    lastElement.appendChild(footerDiv);
}

const rootEl = document.querySelector('div[id="__next"]');

window.onload = () => {
   
    updateTitleAndDescription();
    updateUI();

    new MutationObserver(() => {
        try {
            updateTitleAndDescription();
            updateUI();
        } catch (e) {
            console.info("MeloGPT error --> Could not update UI:\n", e.stack);
        }
    }).observe(rootEl, { childList: true });
};
