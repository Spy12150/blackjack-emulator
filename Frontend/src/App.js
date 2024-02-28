import React, { useState } from "react";
import "./App.css";

function App() {
  const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
  const ranks = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "Jack",
    "Queen",
    "King",
    "Ace",
  ];

  const [deck, setDeck] = useState(createDeck());
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [dealerVisible, setDealerVisible] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [playerWon, setPlayerWon] = useState(null);

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
    return shuffle(newDeck);
  }

  function shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  function getValue(rank) {
    if (["Jack", "Queen", "King"].includes(rank)) {
      return 10;
    } else if (rank === "Ace") {
      return 11; // Aces can be 1 or 11, but we will start with 11.
    } else {
      return parseInt(rank);
    }
  }

  function startGame() {
    const newDeck = createDeck();
    const playerHand = [newDeck.pop(), newDeck.pop()];
    const dealerHand = [newDeck.pop()]; // Dealer starts with one card visible

    setDeck(newDeck);
    setPlayerHand(playerHand);
    setDealerHand(dealerHand);
    setDealerVisible(false); // Dealer's second card is not visible yet
    setGameOver(false);
    setPlayerWon(null);
  }

  function hit() {
    if (!gameOver) {
      const newDeck = [...deck];
      const newPlayerHand = [...playerHand, newDeck.pop()];
      setDeck(newDeck);
      setPlayerHand(newPlayerHand);

      if (getHandValue(newPlayerHand) > 21) {
        setGameOver(true);
        setPlayerWon(false);
      }
    }
  }

  function stand() {
    let newDealerHand = [...dealerHand];
    const newDeck = [...deck];
    newDealerHand.push(newDeck.pop()); // Add second card to dealer's hand
    setDealerVisible(true); // Now dealer's second card becomes visible

    while (getHandValue(newDealerHand) < 17) {
      newDealerHand.push(newDeck.pop());
    }

    setDeck(newDeck);
    setDealerHand(newDealerHand);
    const playerScore = getHandValue(playerHand);
    const dealerScore = getHandValue(newDealerHand);

    if (dealerScore > 21 || playerScore > dealerScore) {
      setPlayerWon(true);
    } else if (playerScore < dealerScore) {
      setPlayerWon(false);
    } else {
      setPlayerWon(null); // It's a tie
    }

    setGameOver(true);
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
        <h1>Blackjack</h1>
        <button onClick={startGame}>Start Game</button>
        <div className="hand">
          <h2>Player's Hand ({getHandValue(playerHand)})</h2>
          <div className="cards">
            {playerHand.map((card, index) => (
              <img
                key={index}
                src={card.image}
                alt={`${card.rank} of ${card.suit}`}
              />
            ))}
          </div>
          {!gameOver && (
            <div>
              <button onClick={hit}>Hit</button>
              <button onClick={stand}>Stand</button>
            </div>
          )}
        </div>
        <div className="hand">
          <h2>
            Dealer's Hand ({dealerVisible ? getHandValue(dealerHand) : "?"})
          </h2>
          <div className="cards">
            {dealerHand.map((card, index) => (
              <img
                key={index}
                src={
                  dealerVisible || index === 0
                    ? card.image
                    : "/PNG-cards-1.3/cardback.png"
                }
                alt={
                  dealerVisible || index === 0
                    ? `${card.rank} of ${card.suit}`
                    : "Hidden Card"
                }
              />
            ))}
            {!dealerVisible && (
              <img src="/PNG-cards-1.3/cardback.png" alt="Hidden Card" />
            )}
          </div>
        </div>
        {gameOver && (
          <div className="outcome">
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
