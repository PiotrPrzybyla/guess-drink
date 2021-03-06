import React, { useState, useEffect } from "react";
import axios from "axios";
import Loading from "./Loading";
import Description from "./Description";
import Result from "./Result";
import Variant from "./Variant";
import "../style/Game.css";

function Game(props) {
	//game properties
	const [drawnDrinks, setDrawnDrinks] = useState([]);
	const [correctDrinks, setcorrectDrinks] = useState([]);
	const [currentPackage, setCurrentPackage] = useState(1);
	const [isLoaded, setIsLoaded] = useState(false);
	const [isEnded, setIsEnded] = useState(false);
	//player properties
	const [correctAnswers, setCorrectAnswers] = useState(0);
	const [currentAnswer, setCurrentAnswer] = useState({});
	const [answers, setAnswers] = useState([]);

	useEffect(() => {
		// Draw correct drink
		let drawnNumber = Math.floor(Math.random() * props.variantAmount);
		for (let i = 0; i < props.drinkAmount * props.variantAmount; i++) {
			axios
				.get("https://www.thecocktaildb.com/api/json/v1/1/random.php")
				// eslint-disable-next-line no-loop-func
				.then((res) => {
					setDrawnDrinks((drawnDrinks) => [
						...drawnDrinks,
						[Math.floor(i % props.variantAmount), res.data.drinks[0]],
					]);

					// In the end of package draw next correct drink
					if (i % props.variantAmount === 0)
						drawnNumber = Math.floor(Math.random() * props.variantAmount + i);
					if (i === drawnNumber) {
						setcorrectDrinks((correctDrinks) => [
							...correctDrinks,
							res.data.drinks[0],
						]);
					}

					if (i === props.drinkAmount * props.variantAmount - 1) {
						setIsLoaded(true);
					}
				})
				.catch((err) => {
					console.log(err);
				});
		}
	}, []);
	function handleQuit(e) {
		props.onQuit();
	}
	function chooseAnswer(e) {
		if (currentAnswer.idDrink === correctDrinks[currentPackage - 1].idDrink)
			setCorrectAnswers(correctAnswers + 1);
		setCurrentPackage(currentPackage + 1);
		setAnswers((answers) => [...answers, currentAnswer]);
		if (currentPackage === props.drinkAmount) {
			setIsEnded(true);
		}
		window.scrollTo(0, 0);
	}

	if (!isLoaded) {
		return <Loading></Loading>;
	} else if (isEnded)
		return (
			<Result
				allAnswers={props.drinkAmount}
				correctDrinks={correctDrinks}
				correctAnswers={correctAnswers}
				answers={answers}
				onQuit={handleQuit}
			></Result>
		);
	else {
		return (
			<React.Fragment>
				<h2>
					Drink {currentPackage} / {props.drinkAmount}
				</h2>
				<Description drink={correctDrinks[currentPackage - 1]}></Description>

				<div className="variants">
					{drawnDrinks.map((drink, id) => {
						if (
							id < currentPackage * props.variantAmount &&
							id >= currentPackage * props.variantAmount - props.variantAmount
						) {
							return (
								<Variant
									isChosen={currentAnswer.idDrink === drink[1].idDrink}
									key={id}
									drink={drink[1]}
									onPick={(e) => setCurrentAnswer(drink[1])}
								></Variant>
							);
						}
					})}
				</div>
				<button className="tertiary_btn" onClick={chooseAnswer}>
					Choose
				</button>
				<button className="tertiary_btn" onClick={handleQuit}>
					Quit
				</button>
			</React.Fragment>
		);
	}
}

export default Game;
