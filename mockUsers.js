// Mock user data for demonstration purposes
// Mock user data for matches and messaging
const mockUsers = [
    {
        id: 1,
        name: "Alex Johnson",
        age: 28,
        gender: "Male",
        location: "New York, NY",
        interests: ["hiking", "music", "travel"],
        bio: "Adventure seeker looking for a partner to explore the world!",
        photo: "https://via.placeholder.com/150"
    },
    {
        id: 2,
        name: "Sofia Martinez",
        age: 24,
        gender: "Female",
        location: "Los Angeles, CA",
        interests: ["art", "food", "yoga"],
        bio: "Creative soul who loves good food and great vibes.",
        photo: "https://via.placeholder.com/150"
    },
    {
        id: 3,
        name: "Taylor Lee",
        age: 30,
        gender: "Other",
        location: "Chicago, IL",
        interests: ["gaming", "movies", "tech"],
        bio: "Gamer and tech enthusiast looking for a co-op partner.",
        photo: "https://via.placeholder.com/150"
    }
];

// Mock messages
const mockMessages = {
    1: [
        { sender: "Alex Johnson", content: "Hey, saw you like hiking! What's your favorite trail?", timestamp: "2025-04-24 10:00" },
        { sender: "You", content: "Hi Alex! I love the Appalachian Trail. What's yours?", timestamp: "2025-04-24 10:05" }
    ],
    2: [
        { sender: "Sofia Martinez", content: "Hey, do you enjoy cooking? I love trying new recipes!", timestamp: "2025-04-24 11:00" }
    ]
};