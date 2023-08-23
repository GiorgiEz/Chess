import React, {ChangeEvent, FormEvent, useCallback, useState} from "react";
import './Inputs.css'
import {Canvas} from "../Canvas/Canvas";
import {sounds} from "../exports";

interface Props{
    handleWhiteKingInput: (event: ChangeEvent<HTMLInputElement>) => void
    handleBlackKingInput: (event: ChangeEvent<HTMLInputElement>) => void
}

export const NamesInput: React.FC<Props> = ({handleWhiteKingInput, handleBlackKingInput}) => {
    const [formSubmitted, setFormSubmitted] = useState(false);

    const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        sounds.game_start_sound.play()
        Canvas.menuScreen = false
        setFormSubmitted(true);
    }, []);

    return (
        <>
            {!formSubmitted &&
                <form onSubmit={handleSubmit}>
                    <div className={"input-container"}>
                        <label htmlFor="white-king-input">White King:</label>
                        <input
                            type={"text"}
                            id={"white-king-input"}
                            placeholder={"Enter White King's name..."}
                            onChange={handleWhiteKingInput}
                            maxLength={15}
                            minLength={3}
                            required
                        />

                        <label htmlFor="black-king-input">Black king:</label>
                        <input
                            type={"text"}
                            id={"black-king-input"}
                            placeholder={"Enter Black King's name..."}
                            onChange={handleBlackKingInput}
                            maxLength={15}
                            minLength={3}
                            required
                        />
                        <button type={"submit"}>Play</button>
                    </div>
            </form>}
        </>
    )
}
