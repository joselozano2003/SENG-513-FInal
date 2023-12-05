"use client";

import React, { useEffect, useState} from "react";

import CircularTimer from "./CircularTimer";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect, useRouter } from "next/navigation";

interface QuandAProps {
    questions: any;
    gameData: any;
    choices: any;
    
}

interface TriviaQuestionChoice { 
    correct : boolean;
}
export default function QandA({ questions, gameData, choices }: QuandAProps) {

    const supabase = createClientComponentClient()
    const router = useRouter()

    const currentQuestion = gameData![0].currentQuestion
    const [score, setScore] = useState(null)


    if (currentQuestion > 8) {
        redirect(`/trivia-game/${gameData![0].id}/end`)
    }
    console.log(currentQuestion)

    const questionData = questions[currentQuestion - 1]

    const currentChoices = choices[questionData.id]

    useEffect(() => {
        const channel = supabase.channel(`realtime:triviaGame:gameId=eq.${gameData![0].id}`).on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'triviaGame'
        }, () => {
            router.refresh()
        }).subscribe()

        return () => {
            supabase.removeChannel(channel)
        }

    }, [supabase, router, gameData])


    // Commented out because it spends DB's resources. Only uncomment when testing.


    useEffect(() => {
        const timer = setTimeout(async () => {
            await supabase.from('triviaGame').update({ currentQuestion: currentQuestion + 1 }).eq('id', gameData![0].id)
            console.log('This will run after 20 seconds');
        }, 100000000000000); // 20000 milliseconds = 20 seconds
    
        // Clear the timer when the component unmounts
        return () => clearTimeout(timer);
    }, [currentQuestion, gameData, supabase]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            await supabase.from('triviaGame').update({ currentQuestion: currentQuestion + 1 }).eq('id', gameData![0].id)
            console.log('This will run after 20 seconds');
        }, 10000000000000); // 20000 milliseconds = 20 seconds
    
        // Clear the timer when the component unmounts
        return () => clearTimeout(timer);
    }, [currentQuestion, gameData, supabase]);

    // ONCE THE TIMER ABOVE ENDS, DISPLAY CORRECT ANSWER ON SCREEN! (ANOTHER QUERY)
    // CHECK TRIVIAPLAYERANSWER AND TRIVIAQUSTION TABLE
    // VALIDATE ANSWERS IN QUESTION COLUMN AND UPDATE PLAYER SCORE IN PLAYER COLUMN
    // triviaPlayerAnswer : id, playerId,QuestionId,choiceId
    // triviaQuestion : id, question, answer, category
    // if triviaplayeranswer.choice id == triviaquestionchoice.id and it is true, get the player id and score +=1
   
   useEffect(() => {
    const fetchPlayerAnswer = async () => {

        try {
            
            // Fetch player answers with details from triviaquestionchoice
            const { data: playerAnswers, error: playerAnswersError } = await supabase
                .from('triviaPlayerAnswer')
                .select()
                .eq('questionId', questionData.id)
                .eq("gameId", gameData![0].id)
                .eq("gameRound", gameData![0].currentQuestion);

            // CHECK IF ERROR
            if (playerAnswersError) {
                console.error('Error fetching player answers:', playerAnswersError);
                return;
            }
            // When round ends,
                // Get responses from that question
                    // SELECT from <table> WHERE gameId = id and round=currentRound
                // For each player, check their choices and if correct add point
            // for (const answer of playerAnswers) {
            //     const { playerId, choiceId } = answer;
            //     // SELECT from <table> WHERE gameId = id and round=currentRound
            //     const {data: correctAnswer, error: correctAnswerError } = await supabase
            //         .from('triviaQuestionChoice')
            //         .select()
            //         .eq("gameId", gameData![0].id)
            //         .eq("gameRound", gameData![0].currentQuestion);
            //         console.log("correctanswer not rly :", correctAnswer);

            // }

            // // if correct {
            //     const { data : triviaPlayerGameScore, error:riviaPlayerGameScoreError } = await supabase
            //     .from('triviaGamePlayer')
            //     .update({score: score + 20})
            //     .eq("id", id);
            // }
            

            console.log("Player Answers with :", playerAnswers);
            console.log("question data:", questionData);
            console.log("currentQuestion:", currentQuestion);
            // Map over player answers and fetch corresponding details from triviaQuestionChoice
            // once it has "grabbed" all the data from the above (playeranswers) from triviaPlayerAnswer, we fetch 
            // the details from the other database table
            // for reference :promise.all waits for all these promises to settle and returns a new promise that fulfills with the array of the results
            // in these case its the player answers, then we declare a ne constant playerAnswersWithDetails that correspond to it
            const playerAnswersWithDetails = await Promise.all(playerAnswers.map(async (playerAnswer) => {
                const { data: choiceDetails, error: choiceError } = await supabase
                    .from('triviaQuestionChoice')
                    .select('')
                    // check for equality if the id is equal to the playerAnswer.choiceID
                    .eq('id', playerAnswer.choiceId)
                    .eq('correct', true);
                    // .single(); // NOT SURE IF WE NEED THIS LINE
                    console.log("NORMAL Choice Details:", choiceDetails, playerAnswer);
                    
                    // UPDATING THE SCORE HERE
                    if (choiceDetails) {
                        const { data: playerData, error: playerError } = await supabase
                        .from('triviaGamePlayer')
                        .select('score')
                        .eq('gameId', gameData![0].id)

                        if (playerError) {
                            console.error('Error fetching player data:', playerError);
                            return null;
                        }

                        const updatedScore = playerData[0].score + 20; // Assuming you get an array of data

                        const { data: updatedPlayerData, error: updatedPlayerDataError } = await supabase
                        .from('triviaGamePlayer')
                        .update({ score: updatedScore })
                        .eq('gameId', gameData![0].id)


                        console.log("TRYING TO UPDATE PLAYER DATA INFO FROM TRIVIAGAMEPLAYER", playerData);
                        console.log("player data test:", playerData);
                        console.log("trying to check if above is true,it will only print correct Choice Details:", choiceDetails);
                        console.log("here should be where im trying to update the score");
                        console.log("Updated player score:", updatedPlayerData[0].score);
                        // const addedScore = 20;
                        
                        // const newScore = currentScore + addedScore; 
                        // const { data : scoreDetails, error: scoreError } = await supabase 
                        // .from('triviaGamePlayer')
                        // .eq('id', playerAnswers.playerId);

                    }
                      
                    // IF THERE IS AN ERROR FETCHING ONLY THE CORRECT ANSWER
                    if (choiceError) {
                    console.error('Error fetching choice details:', choiceError);
                    return null;
                }
                // const isCorrect = choiceDetails.correct;  // Assuming the 'correct' column indicates whether the answer is correct

                // Update the player's score if the answer is correct
                // if (choiceDetails) {
                //     // Fetch the current player's score from triviaGamePlayer
                //     const { data: playerData, error: playerError } = await supabase
                //         .from('triviaGamePlayer')
                //         .select('score')
                //         .eq('userId', playerAnswer.playerId)
                //         .eq('gameId', gameData![0].id)
                //         .single();
    
                //     // if (playerError) {
                //     //     console.error('Error fetching player data:', playerError);
                //     //     return null;
                //     // }
    
                //     // Update the player's score in triviaGamePlayer
                //     const updatedScore = playerData.score + 1;
    
                //     const { data: updatedPlayer, error: updateError } = await supabase
                //         .from('triviaGamePlayer')
                //         .update({ score: updatedScore })
                //         .eq('userId', playerAnswer.playerId)
                //         .eq('gameId', gameData![0].id)
                //         .single();
    
                //     if (updateError) {
                //         console.error('Error updating player score:', updateError);
                //         return null;
                //     }
    
                //     console.log('Player score updated:', updatedPlayer);
                // }
                return {
                    ...playerAnswer,
                    // isCorrect: , // Add isCorrect field to the player answer
                };
            }));

            // console.log("Player Answers with Details:", playerAnswersWithDetails);
            

            // // Now you can check correctness and update score as needed
            // const correctAnswers = playerAnswersWithDetails.filter(answer => answer.isCorrect);
            // const incorrectAnswers = playerAnswersWithDetails.filter(answer => !answer.isCorrect);

            // console.log("Correct Answers:", correctAnswers);
            // console.log("Incorrect Answers:", incorrectAnswers);

            // // // Update score based on correct answers
            // // setScore(prevScore => prevScore + correctAnswers.length);

        } catch (error) {
            console.error('Error in fetchPlayerAnswer:', error);
        }
    }

    fetchPlayerAnswer();
}, [questionData, supabase, setScore, gameData, currentQuestion]);
   
   
    // get these from the database later
    let answerLetters = ["A", "B", "C", "D", "E"];
    let boxShadows = ["blue", "purple", "red", "green", "orange"];

    return (
        <div className="flex flex-col w-full">
            <div className="flex w-full h-full pt-20 md:pt-10">
                <div className="flex flex-col justify-center items-center w-3/5">
                    <h1
                        className="text-6xl md:text-4xl font-bold text-center w-4/5 bg-opacity-50 py-5 md:py-3 rounded-xl"
                        style={{ textShadow: "2px 2px 4px grey" }}
                    >
                        {questionData.question}
                    </h1>
                    <CircularTimer questionData={questionData}/>
                </div>
                <div className="flex flex-col justify-center items-start w-2/5">
                    {currentChoices.map((choice: any, index: number) => (
                        <div key={index} className="flex items-center text-3xl md:text-xl mb-10 md:mb-5 rounded-xl">
                            <div
                                className="mr-5 w-9 h-11 max-w-9 max-h-11 flex items-center justify-center"
                                style={{
                                    backgroundColor: boxShadows[index],
                                    boxShadow: `0 0 3px 4px ${boxShadows[index]}`,
                                }}
                            >
                                {answerLetters[index]}
                            </div>
                            {choice.choice}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
