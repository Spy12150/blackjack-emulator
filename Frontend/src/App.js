import React, { useState } from "react";
import { useSpring, useSprings, animated } from 'react-spring';
import "./App.css";

function App() {
  const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
  const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King", "Ace"];

  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [dealerVisible, setDealerVisible] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [playerWon, setPlayerWon] = useState(null);
  const [chipCount, setChipCount] = useState(1000); // New state for chip count
  const [currentBet, setCurrentBet] = useState(0); // New state for current bet
  const [pendingBet, setPendingBet] = useState(''); // New state for the pending bet
  const [betCounter, setBetCounter] = useState(0);

  // Initialize the deck
  useState(() => {
    setDeck(createDeck());
  }, []);

  const [playerSprings, api] = useSprings(playerHand.length, index => ({
    from: { transform: 'translateX(-100px)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
    delay: index * 100,
  }), [playerHand.length]);

  // Function to handle bet placement
  function handleBetAmountChange(event) {
    const value = event.target.value;
    const amount = parseInt(value, 10);
  
    // Check if the input is an empty string and reset pendingBet if true
    if (value === '') {
      setPendingBet(''); // Allow clearing the input
    } else if (!isNaN(amount) && amount >= 0) {
      setPendingBet(amount); // Update with the parsed amount if it's a number
    }
  }
  
  function confirmBet() {
    const amount = parseInt(pendingBet, 10) || 0;
  
    if (isNaN(amount) || amount <= 0) {
      alert("Please place a valid bet.");
      return;
    }
  
    if (amount > chipCount) {
      alert("Bet amount exceeds chip count.");
      return;
    }
  
    setCurrentBet(amount);
    setChipCount(prevCount => prevCount - amount);
    setPendingBet('');
    setGameOver(false); // Ensure the game is no longer considered over
    setPlayerWon(null); // Reset the win state
    setBetCounter(prevCounter => prevCounter + 1); // Increment the bet counter
  }
  
  // Add this useEffect hook in your component
  React.useEffect(() => {
    if (betCounter > 0 && !gameOver) { // Use betCounter to trigger the effect
      deal();
    }
  }, [betCounter, gameOver]); // Depend on betCounter and gameOver

  function createDeck() {
    let newDeck = [];
    for (let suit of suits) {
      for (let rank of ranks) {
        newDeck.push({
          suit,
          rank,
          value: getValue(rank),
          image: `/PNG-cards-1.3/${rank.toLowerCase()}_of_${suit.toLowerCase()}.png`,
        });
      }
    }
    return shuffle(newDeck); // Assuming you have a shuffle function defined or will define it
  }

  // Define the shuffle function if not already defined
  function shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap
    }
    return deck;
  }

  // Define the getValue function to determine the value of each card
  function getValue(rank) {
    if (["Jack", "Queen", "King"].includes(rank)) {
      return 10;
    } else if (rank === "Ace") {
      return 11; // Aces can be 1 or 11, but we'll start with 11
    } else {
      return parseInt(rank);
    }
  }

  // Your useState call to initialize the deck
  useState(() => {
    setDeck(createDeck());
  }, []);

  function startGame() {
    setChipCount(1000); // Reset chip count to 1000 or to its initial value if different
    setCurrentBet(0); // Reset current bet to 0, ensuring no bet is considered placed
    setPendingBet(''); // Clear any pending bet input
    setPlayerHand([]); // Clear player's hand
    setDealerHand([]); // Clear dealer's hand
    setDealerVisible(false); // Reset dealer's card visibility
    setGameOver(false); // Reset game over status
    setPlayerWon(null); // Reset player win status
    setBetCounter(0); // Optionally reset betCounter if it's used to control game flow
  }

  function deal() {
    if (currentBet <= 0) {
      alert("Please place a bet first.");
      return; // Exit if no bet has been placed
    }

    const newDeck = createDeck();
    const playerInitialHand = [newDeck.pop(), newDeck.pop()];
    const dealerInitialHand = [newDeck.pop(), newDeck.pop()];

    setDeck(newDeck);
    setPlayerHand(playerInitialHand);
    setDealerHand(dealerInitialHand);
    setDealerVisible(false);
    setGameOver(false);
    setPlayerWon(null);
  }
  

  function hit() {
    if (!gameOver && currentBet > 0) {
      const newDeck = [...deck];
      const newPlayerHand = [...playerHand, newDeck.pop()];
      setDeck(newDeck);
      setPlayerHand(newPlayerHand);
  
      if (getHandValue(newPlayerHand) > 21) {
        setDealerVisible(true); // Reveal the dealer's hole card upon player bust
        setGameOver(true);
        setPlayerWon(false); // Indicate the player has lost
      }
    }
  }
  
  function stand() {
    if (currentBet > 0) {
      let newDealerHand = [...dealerHand];
      const newDeck = [...deck];
      setDealerVisible(true);
  
      let dealerHandValue = getHandValue(newDealerHand);
      while (dealerHandValue < 17) {
        newDealerHand.push(newDeck.pop());
        dealerHandValue = getHandValue(newDealerHand);
      }
  
      setDeck(newDeck);
      setDealerHand(newDealerHand);
      const playerScore = getHandValue(playerHand);
      const dealerScore = dealerHandValue;
  
      if (dealerScore > 21 || playerScore > dealerScore) {
        setPlayerWon(true);
        setChipCount(prevCount => prevCount + currentBet * 2); // Correctly handling win
      } else if (playerScore < dealerScore) {
        setPlayerWon(false);
        // No need to adjust chipCount here, since the bet was already deducted
      } else {
        setPlayerWon(null); // It's a tie, consider returning the bet if that's your game rule
        setChipCount(prevCount => prevCount + currentBet); // Returning the bet in case of a tie
      }
  
      setGameOver(true);
    } else {
      alert("Please place a bet before standing.");
    }
  }
  function getHandValue(hand) {
    let value = hand.reduce((acc, card) => acc + card.value, 0);
    let aces = hand.filter((card) => card.rank === "Ace").length;

    while (value > 21 && aces > 0) {
      value -= 10; // Adjust for Ace
      aces -= 1;
    }

    return value;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Ivory's Blackjack</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <button onClick={startGame} style={{ marginRight: '10px' }}>Reset Game</button>
          </div>
          <div className="chip-count">
            Chips: {chipCount}
          </div>
        </div>
        <div className="betting-controls" style={{ marginTop: '20px' }}>
          <input
            type="number"
            value={pendingBet}
            onChange={handleBetAmountChange}
            placeholder="Place your bet"
            style={{ marginRight: '10px' }}
          />
          <button onClick={confirmBet}>Place Bet</button>
        </div>
        <div className="hand">
          <h2>Player's Hand ({getHandValue(playerHand)})</h2>
          <div className="cards">
            {playerSprings.map((styles, index) => (
              <animated.div style={styles} key={index}>
                <img
                  src={playerHand[index].image}
                  alt={`${playerHand[index].rank} of ${playerHand[index].suit}`}
                  style={{ width: '100px', height: 'auto', marginRight: '5px' }}
                />
              </animated.div>
            ))}
          </div>
          {!gameOver && (
            <div style={{ marginTop: '20px' }}>
              <button onClick={hit} style={{ marginRight: '10px' }}>Hit</button>
              <button onClick={stand}>Stand</button>
            </div>
          )}
        </div>
        <div className="hand">
          <h2>Dealer's Hand ({dealerVisible ? getHandValue(dealerHand) : '?'})</h2>
          <div className="cards">
            {dealerHand.map((card, index) => (
              <img
                key={index}
                src={dealerVisible || index === 0 ? card.image : "/PNG-cards-1.3/cardback.png"}
                alt={dealerVisible || index === 0 ? `${card.rank} of ${card.suit}` : "Hidden Card"}
                style={{ width: '100px', height: 'auto', marginRight: '5px' }}
              />
            ))}
          </div>
        </div>
        {gameOver && (
          <div className="outcome" style={{ marginTop: '20px' }}>
            {playerWon === true && <p>You won!</p>}
            {playerWon === false && <p>You lost!</p>}
            {playerWon === null && <p>It's a tie!</p>}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
