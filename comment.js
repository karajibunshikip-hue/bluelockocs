// --- STEP 1: INITIALIZE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyDnhyLG0EOycpx_0dW4EqHjCOmpWh3ks1I",
  authDomain: "bluelock-ocs.firebaseapp.com",
  databaseURL: "https://bluelock-ocs-default-rtdb.firebaseio.com",
  projectId: "bluelock-ocs",
  storageBucket: "bluelock-ocs.firebasestorage.app",
  messagingSenderId: "362155078050",
  appId: "1:362155078050:web:e46b04c5bdbbe539da82fb"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();


// --- STEP 2: USER AUTHENTICATION & SAVED USERNAME ---
let rememberedUsername = localStorage.getItem('savedUsername') || "";
let currentUser = {
    username: rememberedUsername || "Guest",
    role: "visitor"
};

function triggerAuth() {
    let passwordPrompt = prompt("Enter Password (or leave blank to browse as Guest):");

    if (passwordPrompt === "shikikarajibunnies") { 
        alert("Welcome Back, Creator!");
        currentUser.username = "The Developer";
        currentUser.role = "developer";
    } else {
        if (!rememberedUsername) {
            let guestName = prompt("Enter your username for this session (leave blank for 'Guest'):");
            if (guestName && guestName.trim()) {
                currentUser.username = guestName.trim();
                let makePermanent = confirm("Would you like to save this username permanently on this device?");
                if (makePermanent) {
                    localStorage.setItem('savedUsername', currentUser.username);
                }
            }
        }
        currentUser.role = "visitor"; 
        alert(`Browsing as: ${currentUser.username}`);
    }

    // Auto-fill username in form if element exists
    const usernameEl = document.getElementById('usernameInput');
    if (usernameEl && currentUser.username !== "Guest") {
        usernameEl.value = currentUser.username;
    }
}


// --- STEP 3: LISTEN TO REALTIME DATABASE UPDATES ---
function listenToComments() {
    database.ref('comments').on('value', (snapshot) => {
        const commentsData = snapshot.val();
        const container = document.getElementById('commentsContainer');
        if (!container) return;
        
        container.innerHTML = ''; 

        let commentsList = [];
        if (commentsData) {
            Object.keys(commentsData).forEach(key => {
                commentsList.push({
                    key: key,
                    ...commentsData[key]
                });
            });
        }

        commentsList.sort((a, b) => {
            if (a.isPinned !== b.isPinned) {
                return b.isPinned ? 1 : -1;
            }
            return (b.timestamp || 0) - (a.timestamp || 0);
        });

        const countEl = document.getElementById('commentCount');
        if (countEl) {
            countEl.innerText = `(${commentsList.length})`;
        }

        if (commentsList.length === 0) {
            container.innerHTML = '<p style="color: #777;">No comments yet!</p>';
            return;
        }

        commentsList.forEach((comment) => {
            renderCommentCard(comment, container);
        });
    });
}


// --- STEP 4: RENDER INDIVIDUAL COMMENT CARD ---
function renderCommentCard(comment, container) {
    let newComment = document.createElement('div');
    
    newComment.className = `comment-box ${comment.isPinned ? 'pinned' : ''} ${comment.isHighlighted ? 'highlighted' : ''}`;
    newComment.style.cssText = `
        display: flex; gap: 12px; padding: 14px; border-radius: 12px; margin-bottom: 15px; 
        font-family: sans-serif; transition: all 0.2s ease;
        ${comment.isPinned ? 'background: #f0f7ff; border-left: 4px solid #004a99;' : 'background: #ffffff; border: 1px solid #ccc;'}
        ${comment.isHighlighted ? 'box-shadow: 0 0 10px rgba(0, 74, 153, 0.3); border-color: #004a99;' : ''}
    `;

    let likedByArray = comment.likedBy ? Object.values(comment.likedBy) : [];
    let hasLiked = likedByArray.includes(currentUser.username);
    let likeCount = likedByArray.length;

    let canDeleteMain = (currentUser.role === "developer") || (comment.name === currentUser.username);

    let menuHTML = `
        <button onclick="toggleLike('${comment.key}')" style="background: none; border: none; color: ${hasLiked ? '#e11d48' : '#666'}; font-weight: bold; cursor: pointer; font-size: 0.85em;">
            ${hasLiked ? '❤️ Liked' : '🤍 Like'} (${likeCount})
        </button>
        <button onclick="toggleReplyBox('${comment.key}')" style="background: none; border: none; color: #004a99; font-weight: bold; cursor: pointer; font-size: 0.85em;">Reply 💬</button>
    `;

    if (canDeleteMain) {
        menuHTML += `<button onclick="deleteComment('${comment.key}')" style="background: none; border: none; color: #dc2626; font-weight: bold; cursor: pointer; font-size: 0.85em;">Delete 🗑️</button>`;
    }

    if (currentUser.role === "developer") {
        menuHTML += `
            <button onclick="togglePin('${comment.key}', ${!comment.isPinned})" style="background: none; border: none; color: #d97706; font-weight: bold; cursor: pointer; font-size: 0.85em;">
                ${comment.isPinned ? 'Unpin 📌' : 'Pin 📌'}
            </button>
            <button onclick="toggleHighlight('${comment.key}', ${!comment.isHighlighted})" style="background: none; border: none; color: #0284c7; font-weight: bold; cursor: pointer; font-size: 0.85em;">
                ${comment.isHighlighted ? 'Unhighlight ✨' : 'Highlight ✨'}
            </button>
        `;
    }

    let avatarLetter = comment.name ? comment.name.replace('@', '').charAt(0).toUpperCase() : 'G';

    let repliesHTML = '';
    if (comment.replies) {
        Object.keys(comment.replies).forEach(replyKey => {
            let reply = comment.replies[replyKey];
            let canDeleteReply = (currentUser.role === "developer") || (reply.name === currentUser.username);
            let replyAvatar = reply.name ? reply.name.replace('@', '').charAt(0).toUpperCase() : 'G';

            repliesHTML += `
                <div style="padding-left: 10px; border-left: 2px solid #004a99; margin-top: 10px; display: flex; gap: 10px; align-items: start;">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background: #0056b3; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.75em; flex-shrink: 0;">
                        ${replyAvatar}
                    </div>
                    <div style="flex-grow: 1;">
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <b style="color: #111; font-size: 0.85em;">${reply.name}</b>
                            ${reply.name === currentUser.username ? '<span style="font-size: 0.65em; background: #e2e8f0; color: #475569; padding: 1px 4px; border-radius: 3px;">You</span>' : ''}
                        </div>
                        <p style="margin: 2px 0 4px 0; font-size: 0.88em; color: #333;">${reply.text}</p>
                        ${canDeleteReply ? `<button onclick="deleteReply('${comment.key}', '${replyKey}')" style="background: none; border: none; color: #dc2626; font-weight: bold; cursor: pointer; font-size: 0.75em; padding: 0;">Delete 🗑️</button>` : ''}
                    </div>
                </div>
            `;
        });
    }

    newComment.innerHTML = `
        <div style="width: 40px; height: 40px; border-radius: 50%; background: #004a99; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">
            ${avatarLetter}
        </div>
        <div style="flex-grow: 1;">
            ${comment.isPinned ? '<div style="font-size: 0.75em; font-weight: bold; color: #004a99; margin-bottom: 2px;">📌 PINNED BY CREATOR</div>' : ''}
            <div style="display: flex; align-items: center; gap: 8px;">
                <b style="color: #111; font-size: 0.95em;">${comment.name}</b>
                ${comment.name === currentUser.username ? '<span style="font-size: 0.7em; background: #e2e8f0; color: #475569; padding: 1px 5px; border-radius: 4px;">You</span>' : ''}
            </div>
            <p style="margin: 4px 0 8px 0; font-size: 0.95em; color: #333;">${comment.text}</p>
            
            <div style="display: flex; gap: 12px; align-items: center; margin-top: 8px;">
                ${menuHTML}
            </div>

            <div id="replyBox-${comment.key}" style="display: none; margin-top: 10px; flex-direction: column; gap: 6px; background: #f8f9fa; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <input type="text" id="replyUsername-${comment.key}" value="${currentUser.username !== 'Guest' ? currentUser.username : ''}" placeholder="Your Username..." style="padding: 6px 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 0.8em; outline: none;">
                <div style="display: flex; gap: 8px;">
                    <input type="text" id="replyInput-${comment.key}" placeholder="Reply to ${comment.name}..." style="flex-grow: 1; padding: 6px 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 0.85em; outline: none;">
                    <button onclick="postReply('${comment.key}')" style="background: #004a99; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 0.8em; font-weight: bold; cursor: pointer;">Send</button>
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 5px;">
                ${repliesHTML}
            </div>
        </div>
    `;

    container.appendChild(newComment);
}


// --- STEP 5: FIREBASE DATABASE ACTIONS ---

function toggleLike(commentKey) {
    const likeRef = database.ref(`comments/${commentKey}/likedBy`);
    likeRef.once('value', (snapshot) => {
        let likes = snapshot.val() || {};
        let userLikeKey = Object.keys(likes).find(k => likes[k] === currentUser.username);

        if (userLikeKey) {
            database.ref(`comments/${commentKey}/likedBy/${userLikeKey}`).remove();
        } else {
            likeRef.push(currentUser.username);
        }
    });
}

function toggleReplyBox(commentKey) {
    const box = document.getElementById(`replyBox-${commentKey}`);
    if (box) {
        box.style.display = box.style.display === 'none' ? 'flex' : 'none';
    }
}

function postReply(commentKey) {
    const input = document.getElementById(`replyInput-${commentKey}`);
    const nameInput = document.getElementById(`replyUsername-${commentKey}`);
    
    const replyText = input.value.trim();
    const replyName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : currentUser.username;

    if (!replyText) return;

    database.ref(`comments/${commentKey}/replies`).push({
        name: replyName,
        text: replyText,
        timestamp: Date.now()
    });

    input.value = '';
}

function deleteComment(commentKey) {
    database.ref(`comments/${commentKey}`).remove();
}

function deleteReply(commentKey, replyKey) {
    database.ref(`comments/${commentKey}/replies/${replyKey}`).remove();
}

function togglePin(commentKey, newStatus) {
    if (currentUser.role !== "developer") return;
    database.ref(`comments/${commentKey}`).update({ isPinned: newStatus });
}

function toggleHighlight(commentKey, newStatus) {
    if (currentUser.role !== "developer") return;
    database.ref(`comments/${commentKey}`).update({ isHighlighted: newStatus });
}


// --- STEP 6: INITIALIZE ON PAGE LOAD ---

// Fire automatic password popup immediately when the page finishes loading
window.addEventListener('load', () => {
    triggerAuth();
    listenToComments();

    const form = document.getElementById('commentForm');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); 
            
            const commentEl = document.getElementById('commentInput');
            const usernameEl = document.getElementById('usernameInput');
            const inputName = usernameEl ? usernameEl.value.trim() : "";

            const name = inputName || currentUser.username;
            const text = commentEl ? commentEl.value.trim() : "";

            if (!text) return;

            if (name !== currentUser.username && currentUser.role !== "developer") {
                currentUser.username = name;
                localStorage.setItem('savedUsername', name);
            }

            database.ref('comments').push({
                name: name,
                text: text,
                isPinned: false,
                isHighlighted: false,
                timestamp: Date.now()
            });

            if (commentEl) commentEl.value = '';
            
            if (usernameEl) {
                usernameEl.value = currentUser.username;
            }
        });
    }
});