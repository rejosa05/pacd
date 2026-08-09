function updateTime() {
    const now = new Date();
    const timeElement = document.getElementById("time");

    if (timeElement) 
        { timeElement.innerHTML = now.toLocaleTimeString(); }
}

setInterval( updateTime, 1000);
updateTime();

async function loadWaitingQueue() {
    try {
        const response = await fetch("/api/display-queue/", {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });

        if (!response.ok) {
            throw new Error(
                "API request failed"
            );
        }
        const data = await response.json();
            
        displayWaitingQueue(
            data.regular || [],
            "regularCurrent",
            "regularNext"
        );

        displayWaitingQueue(
            data.priority || [],
            "fastCurrent",
            "fastNext"
        );
    }
    catch (error) {

        console.error(
            "❌ REST API error:",
            error
        );
    }
}


function displayWaitingQueue(
    queues,
    currentId,
    nextId
) {
    const current = document.getElementById(currentId);
    const next = document.getElementById(nextId);

    if (!current || !next) { 
        console.error( "❌ Queue elements not found:", currentId, nextId ); 
        return; 
    }

    current.textContent = "00"; 
    next.innerHTML = "";

    if (!queues || queues.lenght === 0) {
        return;
    }

    current.textContent = queues[0];

    for (let i = 1; i < queues.length; i++) {
        addQueueToNext(
            queues[i],
            next
        )
    }
}

function addQueueToNext(queueNumber, container) {
    const span = document.createElement('span')
    span.textContent = queueNumber;
    container.appendChild(span);
}



/* =====================================================
   WEBSOCKET
===================================================== */

const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";

const socket = new WebSocket( protocol + window.location.host + "/ws/queue-display/" );

/* =====================================================
   WEBSOCKET CONNECTED
===================================================== */

socket.onopen = function () {

    console.log(
        "✅ WebSocket connected"
    );

};


/* =====================================================
   WEBSOCKET DISCONNECTED
===================================================== */

socket.onclose = function () {

    console.log(
        "❌ WebSocket disconnected"
    );

};

/* =====================================================
   WEBSOCKET ERROR
===================================================== */

socket.onerror = function (error) {

    console.error(
        "❌ WebSocket error:",
        error
    );

};


/* =====================================================
   RECEIVE REALTIME MESSAGE
===================================================== */

socket.onmessage = function (
    event
) {

    console.log(
        "📡 WebSocket received:",
        event.data
    );


    try {

        const data =
            JSON.parse(
                event.data
            );


        console.log(
            "📦 Parsed:",
            data
        );


        /*
         * CLIENT REGISTERED
         */

        if (
            data.event ===
            "CLIENT_REGISTERED"
        ) {

            addNewWaitingClient(

                data.queue_number,

                data.lane

            );

        }


    }
    catch (error) {

        console.error(
            "❌ JSON error:",
            error
        );

    }

};



/* =====================================================
   ADD NEW WAITING CLIENT
===================================================== */

function addNewWaitingClient(
    queueNumber,
    lane
) {
    let currentId;
    let nextId;

    if ( lane === "Regular" ) {
        currentId = "regularCurrent"; 
        nextId = "regularNext";
    } else if ( lane === "Priority" ) { 
        currentId = "fastCurrent"; 
        nextId = "fastNext"; 
    }

    const current = document.getElementById(currentId);
    const next = document.getElementById( nextId );

    if ( !current || !next ) { 
        console.error( "❌ Queue elements not found:", currentId, nextId ); 
        return; 
    }

    if ( current.textContent.trim() === "00" ) {
        current.textContent = queueNumber; console.log( "⭐ New CURRENT:", queueNumber ); 
        return; } 
       
    addQueueToNext( queueNumber, next ); 
        console.log( "➡️ Added to NEXT:", queueNumber );
}



/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
         * Get existing Waiting
         * clients from REST API
         */

        loadWaitingQueue();

    }
);