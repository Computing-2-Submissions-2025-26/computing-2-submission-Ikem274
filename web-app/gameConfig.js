/**
 * Game Configuration Module
 * Contains all game data: constants, properties, colours, icons, and event cards
 * @namespace GameConfig
 * @author Ikem
 * @version 2026
 */

// ── Game Constants ────────────────────────────────────────

const gameConfig = {
    // Money and finances
    starting_money: 1200,
    student_finance_money: 200,
    gap_year_buyout: 50,

    // Tile IDs
    student_finance_tile: 1,
    bills_due_tile: 3,
    gap_year_tile: 8,
    student_union_tile: 15,
    eastbound_station_tile: 19,
    go_to_gap_year_tile: 22,
    rent_due_tile: 27,

    // Board configuration
    total_tiles: 28,
    gap_year_escape_number: 6,

    // ── Player Token Colours ────────────────────────────────────────
    token_colours: [
        "#e74c3c", "#3498db", "#2ecc71",
        "#f39c12", "#9b59b6", "#1abc9c"
    ],

    // ── Player Icon Choices ────────────────────────────────────────
    icon_choices: [
        { emoji: "🎩", label: "Top Hat" },
        { emoji: "🚗", label: "Car" },
        { emoji: "🐶", label: "Dog" },
        { emoji: "⚓", label: "Anchor" },
        { emoji: "🎲", label: "Dice" },
        { emoji: "👑", label: "Crown" },
        { emoji: "🦊", label: "Fox" },
        { emoji: "🎸", label: "Guitar" },
        { emoji: "🌟", label: "Star" },
        { emoji: "🔮", label: "Crystal Ball" },
        { emoji: "🦉", label: "Owl" },
        { emoji: "🎯", label: "Target" },
        { emoji: "🏆", label: "Trophy" },
        { emoji: "💎", label: "Diamond" },
        { emoji: "🦁", label: "Lion" },
        { emoji: "🐱", label: "Cat" }
    ],

    // ── Property Colour Sets ────────────────────────────────────────
    colour_sets: {
        brown: { colour: "#7C4F36", label: "Brown" },
        light_blue: { colour: "#B9D1E7", label: "Light Blue" },
        pink: { colour: "#AF407E", label: "Pink" },
        orange: { colour: "#CD8E36", label: "Orange" },
        red: { colour: "#BC302B", label: "Red" },
        yellow: { colour: "#E7E24E", label: "Yellow" },
        green: { colour: "#579D57", label: "Green" },
        dark_blue: { colour: "#2C3E50", label: "Dark Blue" },
        station: { colour: "#444444", label: "Station" },
        Museums: { colour: "#EBEEEA", label: "Museums" }
    },

    // ── Property Data Definition ────────────────────────────────────────
    // Rent array: [Without Set, With Set, Level 1: Bachelors, Level 2: Masters, Level 3: PhD]
    // Stations rent: [1 owned, 2 owned]
    property_data: {
        1: { name: "Student Finance", type: "Student_Finance", colourGroup: undefined, description: "Collect £200 when you land on or pass this tile." },
        2: { name: "Huxley", type: "property", price: 150, upgradeCost: 75, sellPrice: 50, rent: [0, 8, 30, 60, 180], colourGroup: "brown", description: "Huxley Building" },
        3: { name: "Bills Due", type: "tax", colourGroup: undefined, taxRate: 0.10, description: "Pay 10% of your total money." },
        4: { name: "Westbound Station", type: "property", price: 250, rent: [100, 200], colourGroup: "station", description: "Take the shuttle service to the other campus." },
        5: { name: "Blackett", type: "property", price: 120, upgradeCost: 100, sellPrice: 75, rent: [6, 12, 30, 90, 270], colourGroup: "light_blue", description: "Blackett Laboratory" },
        6: { name: "Event Card", type: "event", colourGroup: undefined, description: "Draw an Event Card." },
        7: { name: "Roderic Hill", type: "property", price: 140, upgradeCost: 100, sellPrice: 75, rent: [8, 16, 40, 100, 300], colourGroup: "light_blue", description: "Roderic Hill" },
        8: { name: "Gap Year", type: "gap_year", colourGroup: undefined, description: "Just visiting... unless you were sent here." },
        9: { name: "Science Museum", type: "property", price: 175, rent: [10, 20], colourGroup: "Museums", description: "Exhibition Road's finest." },
        10: { name: "Sir Alexander Fleming Building", type: "property", price: 160, upgradeCost: 100, sellPrice: 75, rent: [10, 20, 50, 150, 450], colourGroup: "pink", description: "Sir Alexander Fleming Building." },
        11: { name: "Business School", type: "property", price: 180, upgradeCost: 100, sellPrice: 75, rent: [12, 24, 60, 180, 500], colourGroup: "pink", description: "Imperial College Business School." },
        12: { name: "Event Card", type: "event", colourGroup: undefined, description: "Draw an Event Card." },
        13: { name: "Ace Workshop", type: "property", price: 200, upgradeCost: 150, sellPrice: 100, rent: [14, 28, 70, 200, 550], colourGroup: "orange", description: "The Design Engineering Workshop." },
        14: { name: "Dyson Building", type: "property", price: 220, upgradeCost: 150, sellPrice: 100, rent: [16, 32, 80, 220, 600], colourGroup: "orange", description: "The One and Only Dyson School of Design Engineering." },
        15: { name: "Student Union", type: "Student_Union", colourGroup: undefined, description: "Rest here. Nothing happens." },
        16: { name: "Sherfield Walkway", type: "property", price: 240, upgradeCost: 150, sellPrice: 100, rent: [18, 36, 90, 250, 700], colourGroup: "red", description: "Walkway with all the food you need." },
        17: { name: "Event Card", type: "event", colourGroup: undefined, description: "Draw an Event Card." },
        18: { name: "Abdus Salam Library", type: "property", price: 260, upgradeCost: 150, sellPrice: 100, rent: [20, 40, 100, 300, 750], colourGroup: "red", description: "The Central Library." },
        19: { name: "Eastbound Station", type: "property", price: 250, rent: [100, 200], colourGroup: "station", description: "Take the shuttle service to the other campus." },
        20: { name: "Hammersmith Hospital", type: "property", price: 280, upgradeCost: 200, sellPrice: 140, rent: [22, 44, 110, 330, 800], colourGroup: "yellow", description: "Hammersmith campus" },
        21: { name: "Charing Cross Hospital", type: "property", price: 300, upgradeCost: 200, sellPrice: 140, rent: [24, 48, 120, 360, 850], colourGroup: "yellow", description: "Charing Cross campus" },
        22: { name: "You Fail", type: "go_to_gap_year", colourGroup: undefined, description: "Go directly to Gap Year!" },
        23: { name: "White City Campus", type: "property", price: 320, upgradeCost: 200, sellPrice: 140, rent: [26, 52, 130, 390, 900], colourGroup: "green", description: "White City campus." },
        24: { name: "Natural History Museum", type: "property", price: 175, sellPrice: 87.5, rent: [10, 20], colourGroup: "Museums", description: "Bones and Old Stuff" },
        25: { name: "Queens Tower", type: "property", price: 340, upgradeCost: 200, sellPrice: 140, rent: [28, 56, 150, 450, 1000], colourGroup: "green", description: "THE Queen's Tower" },
        26: { name: "Event Card", type: "event", colourGroup: undefined, description: "Draw an Event Card." },
        27: { name: "House Rent Due", type: "tax", colourGroup: undefined, taxRate: 0.20, description: "Pay 20% of your total money." },
        28: { name: "Royal Albert Hall", type: "property", price: 400, upgradeCost: 250, sellPrice: 175, rent: [0, 100, 200, 600, 1400], colourGroup: "dark_blue", description: "The crown jewel of Kensington." }
    }
};

// ── Event Cards ────────────────────────────────────────
// Define event cards separately to use tile ID constants
gameConfig.event_cards = [
    { id: 1, title: "Scholarship Award", description: "You've been awarded a scholarship! Collect £100.", effect: { type: "gain", amount: 100 } },
    { id: 2, title: "Late Submission", description: "Your coursework was submitted late. Pay a £50 penalty.", effect: { type: "lose", amount: 50 } },
    { id: 3, title: "ACE Equipment Broken", description: "You broke a 3D printer in the lab. Pay £100.", effect: { type: "lose", amount: 100 } },
    { id: 4, title: "Student Union Prize", description: "You won a Student Union competition! Collect £100.", effect: { type: "gain", amount: 100 } },
    { id: 5, title: "Student Finance Came Early", description: "Go directly to Student Finance. Collect £200.", effect: { type: "move", tileId: gameConfig.student_finance_tile } },
    { id: 6, title: "Library Fine", description: "You returned a book late. Pay £30.", effect: { type: "lose", amount: 30 } },
    { id: 7, title: "Part-time Job", description: "Your campus job paid a bonus! Collect £80.", effect: { type: "gain", amount: 80 } },
    { id: 8, title: "Society Fundraiser", description: "Your society raised funds! Collect £50.", effect: { type: "gain", amount: 50 } },
    { id: 9, title: "Laptop Repair", description: "Your laptop screen cracked. Pay £100.", effect: { type: "lose", amount: 100 } },
    { id: 10, title: "Campus Swap", description: "You need to go to the White City campus. Take the shuttle to Eastbound Station.", effect: { type: "move", tileId: gameConfig.eastbound_station_tile } },
    { id: 11, title: "Halls Maintenance", description: "Your halls need repairs. Pay £60.", effect: { type: "lose", amount: 60 } },
    { id: 12, title: "Research Grant", description: "You received a research grant! Collect £150.", effect: { type: "gain", amount: 150 } },
    { id: 13, title: "Forgot to Revise", description: "You forgot to revise for your exam and Fail! Take a gap year! ", effect: { type: "move", tileId: gameConfig.go_to_gap_year_tile } },
    { id: 14, title: "Extra Budget", description: "You received an extra budget for your university project. Collect £50", effect: { type: "gain", amount: 50 } },
    { id: 15, title: "House Rent Increased", description: "Your landlord has increased your rent! Proceed to Rent Due to pay the additional cost.", effect: { type: "move", tileId: gameConfig.rent_due_tile } }
];

export default Object.freeze(gameConfig);
