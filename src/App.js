import { Fragment, useEffect, useState } from "react";
import Header from "./components/Header";
import getCardsData from "./helpers/getApiData";
import shuffleArray from "./helpers/shuffleArray";
import randomNumbersArray from "./helpers/randomNumbersArray";
import CardDeck from "./components/CardDeck";
import Modal from "./components/Modal";
import useSound from "use-sound";
import cardClickSound from "./music/cardClick.mp3";
import cardShufflingSound from "./music/cards-shuffling.mp3";
import winMessageSound from "./music/levelCompleted.mp3";
import gameOverSound from "./music/gameOver.mp3";
import winImage from "./images/winImage.jpeg";
import gameOverImage from "./images/gameOverImage.jpeg";

// import mainMusic from "./music/mainMusic.mp3";
function App() {
  const [clickSound] = useSound(cardClickSound);
  const [shufflingSound] = useSound(cardShufflingSound);
  const [winSound] = useSound(winMessageSound);
  const [overSound] = useSound(gameOverSound);
  // const [gameMusic, { stop }] = useSound(mainMusic);
  //add an empty array that will hold and array of objects to create the cards.
  const [cardsData, setCardsData] = useState([]);
  //add an empty array to hold the cards that had been clicked
  const [cardsClicked, setCardsClicked] = useState([]);

  const [gameIsActive, setGameIsActive] = useState(true);
  const [shuffleCards, setShuffleCards] = useState(false);
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [level, setLevel] = useState(1);
  //maybe chage this name to number of cards?
  const numberOfCardsOnDeck = 6;
  const maxRandomNumber = 820;
  const [showGameOver, setShowGameOver] = useState(false);
  const [showWinMessage, setShowWinMessage] = useState(false);

  const [flip, setFlip] = useState(false);

  //Handle Restart after game over
  const handleRestartGame = () => {
    setCardsData([]);
    setCardsClicked([]);
    setGameIsActive(true);
    setShowGameOver(false);
    setScore(0);
    setLevel(1);
    // setCardsToRetrieve(4);
    setShuffleCards(!shuffleCards);
  };

  const handleWin = () => {
    setShowWinMessage(false);
    setScore(score + 1);
    setCardsData([]);
    setCardsClicked([]);
    // setCardsToRetrieve((prev) => prev + 4);
    setLevel((prev) => prev + 1);
    setShuffleCards(!shuffleCards);
    shufflingSound();
  };

  //get cards data from API
  /* eslint-disable react-hooks/exhaustive-deps */

  useEffect(() => {
    const fethData = async () => {
      try {
        const charactersId = randomNumbersArray(
          numberOfCardsOnDeck,
          maxRandomNumber
        );
        const data = await getCardsData(charactersId);
        const shuffledCards = shuffleArray(data);
        shufflingSound();
        setCardsData(shuffledCards);
      } catch (error) {
        console.log(error);
      }
    };
    fethData();
  }, [shuffleCards]);
  /* eslint-disable react-hooks/exhaustive-deps */

  //render Max score when score changes and current level
  useEffect(() => {
    setMaxScore((prevMAxScore) => Math.max(prevMAxScore, score));
  }, [score]);

  const handleOnCardClick = (event, data) => {
    if (cardsClicked.some((clickedCard) => clickedCard.id === data.id)) {
      //show game over message
      setShowGameOver(true);
      overSound();
      // stop();
      return;
    }

    if (cardsClicked.length + 1 === cardsData.length) {
      //if all cards clicked on this deck of cards get new cards
      setShowWinMessage(true);
      // stop();
      winSound();
      return;
    } else {
      //card flip
      //active game
      setFlip(!flip);
      setTimeout(() => setFlip(false), 800);
      clickSound();
      // gameMusic();
      setCardsClicked((prev) => [...prev, data]);
      setScore(score + 1);
      //suffle existing card Deck
      setCardsData((prevCardsData) => shuffleArray(prevCardsData));
    }
  };
  return (
    <Fragment>
      <Header score={score} maxScore={maxScore} level={level} />
      {gameIsActive && (
        <CardDeck
          onCardClick={handleOnCardClick}
          cardsData={cardsData}
          flip={flip}
        />
      )}
      {showGameOver && (
        <Modal
          mainMessage="GameOver"
          buttonText="restart"
          onClick={handleRestartGame}
          backgrounImage={gameOverImage}
        />
      )}
      {showWinMessage && (
        <Modal
          mainMessage="Congratulations!! you Win"
          buttonText="continue"
          onClick={handleWin}
          backgrounImage={winImage}
        />
      )}
    </Fragment>
  );
}

export default App;
