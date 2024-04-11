import {useEffect, useState} from "react";
import { Chessboard } from "react-chessboard";
import SERVER_URL from "@/config";

const TestChessboard = () => {
    const [randomFen, setRandomFen] = useState<string>('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

    const getRandomFen = () => {
        fetch(`${SERVER_URL}/api/random_position`)
            .then(response => response.json())
            .then(data => setRandomFen(data.fen))
            .catch(error => console.error('Error fetching data:', error));
    }

    useEffect(() => {
        getRandomFen();
    }, []);

    return (
        <div>
            <div style={{ width: '80dvh'}}>
                <Chessboard
                    id={'basicChessboard'}
                    position={randomFen}
                    animationDuration={0}
                />
            </div>
        </div>
    )
}

export default TestChessboard;
