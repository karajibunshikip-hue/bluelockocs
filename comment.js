// --- STEP 1: PASSWORD AUTHENTICATION & SAVED USERNAME ---

let rememberedUsername = localStorage.getItem('savedUsername') || "";

let currentUser = {
    username: rememberedUsername || "Guest",
    role: "visitor"
};

let passwordPrompt = prompt("Enter Password (or leave blank to browse as Guest):");

if (passwordPrompt === "shikikarajibunnies") { 
    alert("Welcome Back, Creator! 👑");
    currentUser.username = "The Creator";
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
    alert(`Browsing as: ${currentUser.username}.`);
}


// --- STEP 2: RENDER COMMENTS & REPLIES FROM LOCALSTORAGE ---
function displayComments() {
    const container = document.getElementById('commentsContainer');
    if (!container) return;
    
    container.innerHTML = ''; 

    let comments = JSON.parse(localStorage.getItem('savedComments')) || [];

    const countEl = document.getElementById('commentCount');
    if (countEl) {
        countEl.innerText = `(${comments.length})`;
    }

    comments.forEach(function(comment, index) {
        let newComment = document.createElement('div');
        
        newComment.className = `comment-box ${comment.isPinned ? 'pinned' : ''} ${comment.isHighlighted ? 'highlighted' : ''}`;
        newComment.style.cssText = `
            display: flex; gap: 12px; padding: 14px; border-radius: 12px; margin-bottom: 15px; 
            font-family: sans-serif; transition: all 0.2s ease;
            ${comment.isPinned ? 'background: #f0f7ff; border-left: 4px solid #004a99;' : 'background: #ffffff; border: 1px solid #ccc;'}
            ${comment.isHighlighted ? 'box-shadow: 0 0 10px rgba(0, 74, 153, 0.3); border-color: #004a99;' : ''}
        `;

        // Check if current user has already liked this comment
        let likedByArray = comment.likedBy || [];
        let hasLiked = likedByArray.includes(currentUser.username);
        let likeCount = likedByArray.length;

        // CHECK DELETE PRIVILEGES
        let canDeleteMain = (currentUser.role === "developer") || (comment.name === currentUser.username);

        let menuHTML = `
            <button onclick="toggleLike(${index})" style="background: none; border: none; color: ${hasLiked ? '#e11d48' : '#666'}; font-weight: bold; cursor: pointer; font-size: 0.85em;">
                ${hasLiked ? '❤️ Liked' : '🤍 Like'} (${likeCount})
            </button>
            <button onclick="toggleReplyBox(${index})" style="background: none; border: none; color: #004a99; font-weight: bold; cursor: pointer; font-size: 0.85em;">Reply 💬</button>
        `;

        if (canDeleteMain) {
            menuHTML += `<button onclick="deleteComment(${index})" style="background: none; border: none; color: #dc2626; font-weight: bold; cursor: pointer; font-size: 0.85em;">Delete 🗑️</button>`;
        }

        if (currentUser.role === "developer") {
            menuHTML += `
                <button onclick="togglePin(${index})" style="background: none; border: none; color: #d97706; font-weight: bold; cursor: pointer; font-size: 0.85em;">
                    ${comment.isPinned ? 'Unpin 📌' : 'Pin 📌'}
                </button>
                <button onclick="toggleHighlight(${index})" style="background: none; border: none; color: #0284c7; font-weight: bold; cursor: pointer; font-size: 0.85em;">
                    ${comment.isHighlighted ? 'Unhighlight ✨' : 'Highlight ✨'}
                </button>
            `;
        }

        let avatarLetter = comment.name ? comment.name.replace('@', '').charAt(0).toUpperCase() : 'G';

        // BUILD REPLIES HTML
        let repliesHTML = '';
        if (comment.replies && comment.replies.length > 0) {
            comment.replies.forEach(function(reply, replyIndex) {
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
                            ${canDeleteReply ? `<button onclick="deleteReply(${index}, ${replyIndex})" style="background: none; border: none; color: #dc2626; font-weight: bold; cursor: pointer; font-size: 0.75em; padding: 0;">Delete 🗑️</button>` : ''}
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
                ${comment.isPinned ? '<div style="font-size: 0.75em; font-weight: bold; color: #004a99; margin-bottom: 2px;">📌 PINNED BY AUTHOR</div>' : ''}
                <div style="display: flex; align-items: center; gap: 8px;">
                    <b style="color: #111; font-size: 0.95em;">${comment.name}</b>
                    ${comment.name === currentUser.username ? '<span style="font-size: 0.7em; background: #e2e8f0; color: #475569; padding: 1px 5px; border-radius: 4px;">You</span>' : ''}
                </div>
                <p style="margin: 4px 0 8px 0; font-size: 0.95em; color: #333;">${comment.text}</p>
                
                <div style="display: flex; gap: 12px; align-items: center; margin-top: 8px;">
                    ${menuHTML}
                </div>

                <!-- Hidden Reply Box -->
                <div id="replyBox-${index}" style="display: none; margin-top: 10px; flex-direction: column; gap: 6px; background: #f8f9fa; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <input type="text" id="replyUsername-${index}" value="${currentUser.username !== 'Guest' ? currentUser.username : ''}" placeholder="Your Username..." style="padding: 6px 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 0.8em; outline: none;">
                    <div style="display: flex; gap: 8px;">
                        <input type="text" id="replyInput-${index}" placeholder="Reply to ${comment.name}..." style="flex-grow: 1; padding: 6px 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 0.85em; outline: none;">
                        <button onclick="postReply(${index})" style="background: #004a99; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 0.8em; font-weight: bold; cursor: pointer;">Send</button>
                    </div>
                </div>

                <!-- Threaded Replies Container -->
                <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 5px;">
                    ${repliesHTML}
                </div>
            </div>
        `;

        container.appendChild(newComment);
    });
}


// --- STEP 3: OPERATIONS & RECIPES ---

function toggleLike(index) {
    let comments = JSON.parse(localStorage.getItem('savedComments')) || [];
    
    if (!comments[index].likedBy) {
        comments[index].likedBy = [];
    }

    let userIndex = comments[index].likedBy.indexOf(currentUser.username);

    // If user has NOT liked yet, add them. If they HAVE liked, remove them (unlike)
    if (userIndex === -1) {
        comments[index].likedBy.push(currentUser.username);
    } else {
        comments[index].likedBy.splice(userIndex, 1);
    }

    localStorage.setItem('savedComments', JSON.stringify(comments));
    displayComments();
}

function toggleReplyBox(index) {
    const box = document.getElementById(`replyBox-${index}`);
    if (box) {
        box.style.display = box.style.display === 'none' ? 'flex' : 'none';
    }
}

function postReply(commentIndex) {
    const input = document.getElementById(`replyInput-${commentIndex}`);
    const nameInput = document.getElementById(`replyUsername-${commentIndex}`);
    
    const replyText = input.value.trim();
    const replyName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : currentUser.username;

    if (!replyText) return;

    let comments = JSON.parse(localStorage.getItem('savedComments')) || [];

    if (!comments[commentIndex].replies) {
        comments[commentIndex].replies = [];
    }

    comments[commentIndex].replies.push({
        name: replyName,
        text: replyText
    });

    localStorage.setItem('savedComments', JSON.stringify(comments));
    displayComments();
}

function deleteComment(index) {
    let comments = JSON.parse(localStorage.getItem('savedComments')) || [];
    let commentToDelete = comments[index];

    if (currentUser.role === "developer" || commentToDelete.name === currentUser.username) {
        comments.splice(index, 1);
        localStorage.setItem('savedComments', JSON.stringify(comments));
        displayComments();
    } else {
        alert("Permission denied! You can only delete your own comments.");
    }
}

function deleteReply(commentIndex, replyIndex) {
    let comments = JSON.parse(localStorage.getItem('savedComments')) || [];
    let replyToDelete = comments[commentIndex].replies[replyIndex];

    if (currentUser.role === "developer" || replyToDelete.name === currentUser.username) {
        comments[commentIndex].replies.splice(replyIndex, 1);
        localStorage.setItem('savedComments', JSON.stringify(comments));
        displayComments();
    } else {
        alert("Permission denied! You can only delete your own replies.");
    }
}

function togglePin(index) {
    if (currentUser.role !== "developer") return;
    
    let comments = JSON.parse(localStorage.getItem('savedComments')) || [];
    comments[index].isPinned = !comments[index].isPinned;
    
    comments.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

    localStorage.setItem('savedComments', JSON.stringify(comments));
    displayComments();
}

function toggleHighlight(index) {
    if (currentUser.role !== "developer") return;

    let comments = JSON.parse(localStorage.getItem('savedComments')) || [];
    comments[index].isHighlighted = !comments[index].isHighlighted;
    localStorage.setItem('savedComments', JSON.stringify(comments));
    displayComments();
}


// --- STEP 4: FORM SUBMISSION HANDLER ---

document.addEventListener('DOMContentLoaded', () => {
    displayComments();

    const form = document.getElementById('commentForm');
    if (form) {
        const usernameEl = document.getElementById('usernameInput');
        if (usernameEl && currentUser.username !== "Guest") {
            usernameEl.value = currentUser.username;
        }

        form.addEventListener('submit', function(event) {
            event.preventDefault(); 
            
            const commentEl = document.getElementById('commentInput') || document.getElementById('userCommentInput');
            const inputName = usernameEl ? usernameEl.value.trim() : "";

            const name = inputName || currentUser.username;
            const text = commentEl ? commentEl.value.trim() : "";

            if (!text) return;

            if (name !== currentUser.username && currentUser.role !== "developer") {
                currentUser.username = name;
                localStorage.setItem('savedUsername', name);
            }

            let comments = JSON.parse(localStorage.getItem('savedComments')) || [];
            
            comments.push({ 
                name: name, 
                text: text, 
                isPinned: false, 
                isHighlighted: false,
                likedBy: [], 
                replies: [] 
            });

            localStorage.setItem('savedComments', JSON.stringify(comments));
            
            form.reset();
            
            if (usernameEl) {
                usernameEl.value = currentUser.username;
            }

            displayComments();
        });
    }
});