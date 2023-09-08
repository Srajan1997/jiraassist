// Copyright 2022 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const tabs = await chrome.tabs.query({
  url: [
    'https://koreteam.atlassian.net/browse/*',
  ]
});

var extensions = "https://koreteam.atlassian.net/browse"
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url.startsWith(extensions)) {
    document.getElementsByTagName('Button')[0].style.display = "";
  }
  else {
    document.getElementsByTagName('Button')[0].style.display = "none";
  }
});

var currentTabTitle = "";
chrome.tabs.query({ active: true, currentWindow: true }, function (tab) {
  currentTabTitle = JSON.stringify(tab[0].url);
  if (currentTabTitle.search("https://koreteam.atlassian.net/browse/RA-") !== -1) {
    document.getElementById("openAB").style.display = "inline-block";

    document.getElementById("openAD").style.display = "inline-block";

    var des = JSON.stringify(tab[0].title).split('] ')[1].trim();
    des = des.split(' - JIR')[0].trim()
    document.getElementById("ticketName").innerText = '"' + des + '"'
    document.getElementById("openAB").addEventListener('click', async () => {
      getDescription(des);
    });
    document.getElementById("openAD").addEventListener('click', async () => {
      getSteps(des);
    });
  }
  else {
    document.getElementById("openAB").style.display = "none";
    document.getElementById("openAD").style.display = "none";
  }
});

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator
const collator = new Intl.Collator();
tabs.sort((a, b) => collator.compare(a.title, b.title));

const template = document.getElementById('li_template');
const elements = new Set();
for (const tab of tabs) {
  document.getElementById('notFound').style.display = '';
  const element = template.content.firstElementChild.cloneNode(true);

  var raid = tab.title.split('] ')[0].trim();
  raid = raid.replaceAll("[", "");
  var des = tab.title.split('] ')[1].trim();
  des = des.split(' - JIR')[0].trim()
  element.querySelector('.title').innerHTML = '<i class="bi bi-bookmark-star-fill"></i>' + raid;
  element.querySelector('.pathname').textContent = des;
  element.querySelector('a').addEventListener('click', async () => {
    // need to focus window as well as the active tab
    await chrome.tabs.update(tab.id, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
  });
  elements.add(element);
}
if (tabs.length !== 0) {
  document.getElementById('notFound').style.display = 'none';
}
else {
  document.getElementById('notFound').style.display = '';
}

document.querySelector('ul').append(...elements);


async function getDescription(title) {
  document.getElementById("openAD").style.display="none";
  document.getElementById("openAB").style.display="none"
  document.getElementById('list-main').style.display="none";
  document.getElementById("ticketName").style.marginTop="30px";
  document.getElementById("ticketName").style.color="rgb(155, 56, 204)";
    document.getElementById("ticketName").style.fontSize="16px";
  document.getElementById("loader").style.display="";
  var myHeaders = new Headers(); 
  myHeaders.append("Authorization", "Bearer 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"); 
  myHeaders.append("Content-Type", "application/json"); 
  var raw = JSON.stringify({ "model": "text-davinci-003", "prompt": "i want to generate a short description (max 200 words) for my jira ticket titled: "+title, "temperature": 0.7, "max_tokens": 256, "top_p": 1, "frequency_penalty": 0, "presence_penalty": 0, "stop": "Q:" }); 
  var requestOptions = { method: 'POST', headers: myHeaders, body: raw, redirect: 'follow' }; 
  fetch("https://api.openai.com/v1/completions", requestOptions)
  .then(response => response.json())
  .then(result => {
    document.getElementById("ticketDescription").innerHTML = result.choices[0].text; 
    document.getElementById("ticketDescription").style.display=""
    document.getElementById("loader").style.display="none";
    document.getElementById("ticketDescription").style.display="block";
    document.getElementById("openA1").style.display="inline-block";
    document.getElementById("openA2").style.display="inline-block";
    document.getElementById("openA1").innerHTML='<i class="bi bi-clipboard-check"></i>Copy to Clipboard'
    document.getElementById("openA1").style.backgroundColor="rgb(65, 65, 65)";
    document.getElementById("openA1").addEventListener('click', async () => {
      copyToClipboard(result.choices[0].text);
    });
    document.getElementById("openA2").addEventListener('click', async () => {
      goBack();
    });
  })
  .catch(error => console.log('error', error));
}


async function getSteps(title) {
  document.getElementById("openAD").style.display="none";
  document.getElementById("openAB").style.display="none"
  document.getElementById('list-main').style.display="none";
  document.getElementById("ticketName").style.marginTop="30px";
  document.getElementById("ticketName").style.color="rgb(155, 56, 204)";
    document.getElementById("ticketName").style.fontSize="16px";
  document.getElementById("loader").style.display="";
  var myHeaders = new Headers(); 
  myHeaders.append("Authorization", "Bearer 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"); 
  myHeaders.append("Content-Type", "application/json"); 
  var raw = JSON.stringify({ "model": "text-davinci-003", "prompt": "list the major subtask names without any description for the jira ticket titled: "+title+". strictly return html with proper ol & li tags", "temperature": 0.7, "max_tokens": 256, "top_p": 1, "frequency_penalty": 0, "presence_penalty": 0, "stop": "Q:" }); 
  var requestOptions = { method: 'POST', headers: myHeaders, body: raw, redirect: 'follow' }; 
  fetch("https://api.openai.com/v1/completions", requestOptions)
  .then(response => response.json())
  .then(result => {
    document.getElementById("ticketDescription").style.display=""
    document.getElementById("ticketDescription").innerHTML = result.choices[0].text; 
    document.getElementById("loader").style.display="none";
    document.getElementById("ticketDescription").style.display="block";
    document.getElementById("openA1").style.display="inline-block";
    document.getElementById("openA2").style.display="inline-block";
    document.getElementById("openA1").innerHTML='<i class="bi bi-clipboard-check"></i>Copy to Clipboard'
    document.getElementById("openA1").style.backgroundColor="rgb(65, 65, 65)";

    document.getElementById("openA1").addEventListener('click', async () => {
      copyToClipboard(result.choices[0].text);
    });
    document.getElementById("openA2").addEventListener('click', async () => {
      goBack();
    });
  })
  .catch(error => console.log('error', error));
}

function goBack() {
  document.getElementById('list-main').style.display="block";
  document.getElementById("ticketName").style.marginTop="10px";
  document.getElementById("ticketName").style.fontSize="12px";
  document.getElementById("ticketDescription").style.display="none";
    document.getElementById("openAD").style.display="inline-block";
    document.getElementById("openAB").style.display="inline-block";
    document.getElementById("openA1").style.display="none";
    document.getElementById("openA2").style.display="none"
    document.getElementById("ticketName").style.color="gray"
}

function copyToClipboard(copyText){
    //Create a textbox field where we can insert text to. 
    var copyFrom = document.createElement("textarea");
  
    //Set the text content to be the text you wished to copy.
    copyFrom.textContent = copyText;
  
    //Append the textbox field into the body as a child. 
    //"execCommand()" only works when there exists selected text, and the text is inside 
    //document.body (meaning the text is part of a valid rendered HTML element).
    document.body.appendChild(copyFrom);
  
    //Select all the text!
    copyFrom.select();
  
    //Execute command
    document.execCommand('copy');
  
    //(Optional) De-select the text using blur(). 
    copyFrom.blur();
  
    //Remove the textbox field from the document.body, so no other JavaScript nor 
    //other elements can get access to this.
    document.body.removeChild(copyFrom);

    document.getElementById("openA1").innerHTML='<i class="bi bi-check2-all"></i>Content Copied'
    document.getElementById("openA1").style.backgroundColor="rgb(155, 56, 204)";
  }