import {Chessboard} from "react-chessboard";

const Index = () => {
    return (
        <div>
            <div style={{ width: '80dvh'}}>
                <Chessboard
                    id={'basicChessboard'}
                    position="r1bqkbnr/pppppppp/2n5/8/4P3/8/PPPP1PPP/RNBQKBNR"
                    arePremovesAllowed={true}
                />
            </div>
        </div>
    )
}

export default Index;