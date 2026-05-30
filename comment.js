// --- STEP 1: PASSWORD CHALLENGE ---

// We start assuming whoever opened the page is just a regular visitor
let currentUser = {
    username: "Guest",
    role: "visitor"
};

// JavaScript opens a prompt box asking for your secret key!
let passwordPrompt = prompt("Enter Password (or leave blank to browse as Guest):");

// Checking if what they typed matches your master key!
if (passwordPrompt === "shikikarajibuninslash") { 
    alert("Welcome Back.");
    currentUser.username = "The Creator";
    currentUser.role = "developer"; // Handed the Gold Wristband!
} else {
    alert("Browsing mode: Regular Visitor. Secret options hidden.");
    currentUser.username = "Guest";
    currentUser.role = "visitor"; // Handed the Blue Wristband!
}


// --- STEP 2: DRAW THE SCREEN BASED ON WHO LOGGED IN ---
function displayComments() {
    const container = document.getElementById('commentsContainer');
    container.innerHTML = ''; 

    let comments = JSON.parse(localStorage.getItem('savedComments')) || [];

    comments.forEach(function(comment, index) {
        let newComment = document.createElement('div');
        newComment.className = `comment-box ${comment.isHighlighted ? 'highlighted' : ''}`;
        
        // Basic menu options anyone can see
        let menuHTML = `
            <button class="delete-btn" onclick="deleteComment(${index})">Delete</button>
        `;

        // THE SECURITY GUARD ACTION: Only attach the master features if the role is 'developer'
        if (currentUser.role === "developer") {
            menuHTML += `
                <hr style="border: 0; border-top: 1px solid #eee; margin: 5px 0;">
                <button onclick="togglePin(${index})" style="color: #ffaa00;">📌 Pin to Top</button>
            `;
        }

        newComment.innerHTML = `
            ${comment.isPinned ? '<span class="pin-badge">📌 Pinned Comment</span>' : ''}
            <span class="username">${comment.name}</span> 
            <p>${comment.text}</p>
            
            <div id="dropdown-${index}" class="dropdown-menu">
                ${menuHTML}
            </div>
        `;
        container.appendChild(newComment);
    });
}

// (All your underlying operation recipes stay perfectly intact)
function toggleMenu(index) { document.getElementById(`dropdown-${index}`).classList.toggle('show'); }
function deleteComment(index) {
    let comments = JSON.parse(localStorage.getItem('savedComments')) || [];
    comments.splice(index, 1);
    localStorage.setItem('savedComments', JSON.stringify(comments));
    displayComments();
}
function togglePin(index) {
    let comments = JSON.parse(localStorage.getItem('savedComments')) || [];
    comments[index].isPinned = !comments[index].isPinned;
    localStorage.setItem('savedComments', JSON.stringify(comments));
    displayComments();
}
function toggleHighlight(index) {
    let comments = JSON.parse(localStorage.getItem('savedComments')) || [];
    comments[index].isHighlighted = !comments[index].isHighlighted;
    localStorage.setItem('savedComments', JSON.stringify(comments));
    displayComments();
}

document.getElementById('commentForm').addEventListener('submit', function(event) {
    event.preventDefault(); 
    const name = document.getElementById('usernameInput').value;
    const text = document.getElementById('commentInput').value;
    let comments = JSON.parse(localStorage.getItem('savedComments')) || [];
    comments.push({ name: name, text: text, isPinned: false, isHighlighted: false });
    localStorage.setItem('savedComments', JSON.stringify(comments));
    document.getElementById('commentForm').reset();
    displayComments();
});

displayComments();