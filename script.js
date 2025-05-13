// Handle Registration
// Utility: Validate email format
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Utility: Validate password strength (at least 8 chars, 1 number, 1 special char)
function isValidPassword(password) {
    return /^(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(password);
}

// Simple hashing function (for prototyping - use bcrypt in production)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Handle Registration
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const age = document.getElementById('age').value;
        const gender = document.getElementById('gender').value;
        const location = document.getElementById('location').value;
        const interests = document.getElementById('interests').value.split(',').map(i => i.trim());
        const bio = document.getElementById('bio').value;
        const photoInput = document.getElementById('photo');

        // Validation
        if (age < 18) {
            alert('You must be at least 18 to register.');
            return;
        }
        if (!isValidEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        if (!isValidPassword(password)) {
            alert('Password must be at least 8 characters long and include a number and a special character.');
            return;
        }

        // Handle photo upload
        let photo = 'https://via.placeholder.com/150';
        if (photoInput.files && photoInput.files[0]) {
            photo = URL.createObjectURL(photoInput.files[0]);
        }

        // Hash password before storing
        const hashedPassword = await hashPassword(password);

        // Save user with hashed password
        const user = { name, email, password: hashedPassword, age, gender, location, interests, bio, photo };
        localStorage.setItem('user', JSON.stringify(user));

        alert('Registration successful! Please login.');
        window.location.href = 'login.html';
    });
}

// Real-time validation for registration form
if (document.getElementById('registerForm')) {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailFeedback = document.getElementById('emailFeedback');
    const passwordFeedback = document.getElementById('passwordFeedback');

    emailInput.addEventListener('input', () => {
        if (emailInput.value.length === 0) {
            emailFeedback.classList.add('hidden');
            emailInput.classList.remove('border-green-500', 'border-red-500');
        } else if (isValidEmail(emailInput.value)) {
            emailFeedback.textContent = '✓ Valid email';
            emailFeedback.className = 'text-green-500 text-sm mt-1';
            emailInput.classList.add('border-green-500');
            emailInput.classList.remove('border-red-500');
        } else {
            emailFeedback.textContent = 'Please enter a valid email address';
            emailFeedback.className = 'text-red-500 text-sm mt-1';
            emailInput.classList.add('border-red-500');
            emailInput.classList.remove('border-green-500');
        }
        emailFeedback.classList.remove('hidden');
    });

    passwordInput.addEventListener('input', () => {
        if (passwordInput.value.length === 0) {
            passwordFeedback.classList.add('hidden');
            passwordInput.classList.remove('border-green-500', 'border-red-500');
        } else if (isValidPassword(passwordInput.value)) {
            passwordFeedback.textContent = '✓ Strong password';
            passwordFeedback.className = 'text-green-500 text-sm mt-1';
            passwordInput.classList.add('border-green-500');
            passwordInput.classList.remove('border-red-500');
        } else {
            passwordFeedback.textContent = 'Password must be 8+ chars with a number and special character';
            passwordFeedback.className = 'text-red-500 text-sm mt-1';
            passwordInput.classList.add('border-red-500');
            passwordInput.classList.remove('border-green-500');
        }
        passwordFeedback.classList.remove('hidden');
    });
}

// Handle Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Hash the entered password
        const hashedPassword = await hashPassword(password);

        // Retrieve user from localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.email === email && user.password === hashedPassword) {
            localStorage.setItem('loggedIn', 'true');
            window.location.href = 'profile.html';
        } else {
            alert('Invalid email or password.');
        }
    });
}

// Display Profile
if (window.location.pathname.includes('profile.html')) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && localStorage.getItem('loggedIn') === 'true') {
        document.getElementById('profilePhoto').src = user.photo;
        document.getElementById('profileName').textContent = user.name;
        document.getElementById('profileAge').textContent = `${user.age} years old`;
        document.getElementById('profileGender').textContent = `Gender: ${user.gender}`;
        document.getElementById('profileLocation').textContent = `Location: ${user.location || 'Not specified'}`;
        document.getElementById('profileInterests').textContent = `Interests: ${user.interests.join(', ') || 'None'}`;
        document.getElementById('profileBio').textContent = user.bio || 'No bio provided.';
    } else {
        alert('Please login to view your profile.');
        window.location.href = 'login.html';
    }
}

// Handle Matches and Search
if (window.location.pathname.includes('matches.html')) {
    const userStorage = new UserStorage();
    const currentUser = userStorage.getCurrentUser();
    const allUsers = userStorage.getAllUsers();
    const matchesList = document.getElementById('matchesList');

    function displayMatches(users) {
        matchesList.innerHTML = '';
        
        if (users.length === 0) {
            matchesList.innerHTML = '<p class="text-center col-span-3 py-8">No matches found. Try adjusting your filters.</p>';
            return;
        }

        users.forEach(user => {
            // Calculate match score based on interests
            const matchScore = calculateMatchScore(currentUser.interests, user.interests);
            
            const card = document.createElement('div');
            card.className = 'match-card bg-white p-6 rounded-lg shadow-lg text-center relative';
            card.innerHTML = `
                <img src="${user.photo}" alt="${user.name}" class="w-24 h-24 rounded-full mx-auto mb-4">
                <div class="absolute top-2 right-2 bg-pink-100 text-pink-800 text-xs font-bold px-2 py-1 rounded-full">
                    ${matchScore}% match
                </div>
                <h3 class="text-lg font-semibold">${user.name}</h3>
                <p class="text-gray-600">${user.age} years old</p>
                <p class="text-gray-600">${user.location}</p>
                <p class="text-gray-600 truncate">Interests: ${user.interests.slice(0, 3).join(', ')}</p>
                <button class="mt-4 bg-pink-600 text-white p-2 rounded-lg hover:bg-pink-700 w-full" onclick="startChat('${user.email}')">Message</button>
            `;
            matchesList.appendChild(card);
        });
    }

    function calculateMatchScore(userInterests, matchInterests) {
        if (!userInterests || !matchInterests) return 0;
        const commonInterests = userInterests.filter(interest => 
            matchInterests.includes(interest)
        ).length;
        return Math.min(Math.round((commonInterests / userInterests.length) * 100), 100);
    }

    // Initial display
    displayMatches(allUsers);

    const searchName = document.getElementById('searchName');
    const filterGender = document.getElementById('filterGender');
    const filterAgeMin = document.getElementById('filterAgeMin');
    const filterAgeMax = document.getElementById('filterAgeMax');
    const applyFilters = document.getElementById('applyFilters');

    // Apply filters
    applyFilters.addEventListener('click', () => {
        const nameQuery = searchName.value.toLowerCase();
        const gender = filterGender.value;
        const ageMin = parseInt(filterAgeMin.value) || 0;
        const ageMax = parseInt(filterAgeMax.value) || 100;

        const filteredUsers = allUsers.filter(user => {
            return (
                (nameQuery === '' || user.name.toLowerCase().includes(nameQuery)) &&
                (gender === '' || user.gender === gender) &&
                user.age >= ageMin &&
                user.age <= ageMax
            );
        });

        displayMatches(filteredUsers);
    });

    // Start chat
    window.startChat = function(userId) {
        localStorage.setItem('currentChat', userId);
        window.location.href = 'messages.html';
    };
}

// Handle Messages
if (window.location.pathname.includes('messages.html')) {
    const chatList = document.getElementById('chatList');
    const chatHeader = document.getElementById('chatHeader');
    const chatMessages = document.getElementById('chatMessages');
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('messageInput');

    // Display chat list
    mockUsers.forEach(user => {
        const li = document.createElement('li');
        li.className = 'p-2 hover:bg-gray-100 cursor-pointer';
        li.textContent = user.name;
        li.onclick = () => {
            localStorage.setItem('currentChat', user.id);
            displayChat(user.id);
        };
        chatList.appendChild(li);
    });

    // Display messages for selected user
    function displayChat(userId) {
        const user = mockUsers.find(u => u.id === userId);
        chatHeader.textContent = `Chat with ${user.name}`;
        chatMessages.innerHTML = '';

        const messages = mockMessages[userId] || [];
        messages.forEach(msg => {
            const div = document.createElement('div');
            div.className = `message ${msg.sender === 'You' ? 'sent' : 'received'}`;
            div.textContent = msg.content;
            chatMessages.appendChild(div);
        });

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Load current chat
    const currentChat = localStorage.getItem('currentChat');
    if (currentChat) {
        displayChat(parseInt(currentChat));
    }

    // Send message
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const content = messageInput.value.trim();
        if (!content || !currentChat) return;

        const user = mockUsers.find(u => u.id === parseInt(currentChat));
        if (!mockMessages[currentChat]) mockMessages[currentChat] = [];
        mockMessages[currentChat].push({
            sender: 'You',
            content,
            timestamp: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0]
        });

        displayChat(parseInt(currentChat));
        messageInput.value = '';
    });
}

// Handle Logout
const logout = document.getElementById('logout');
if (logout) {
    logout.addEventListener('click', () => {
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('currentChat');
        window.location.href = 'index.html';
    });
}
