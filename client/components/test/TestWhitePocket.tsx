import React, { DragEvent } from 'react';
import Chessboard from 'react-chessboard';

const App: React.FC = () => {
  const handleDragStart = (event: DragEvent<HTMLDivElement>, piece: string) => {
    event.dataTransfer.setData('piece', piece);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const piece = event.dataTransfer.getData('piece');
    // Implement logic to place the dropped piece on the board
    console.log('Dropped piece:', piece);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex space-x-4">
          <div
              className="piece-white piece"
              draggable
              onDragStart={(event) => handleDragStart(event, 'wP')}
          >
            PIONECZEK
          </div>
          <div
              className="piece-black piece"
              draggable
              onDragStart={(event) => handleDragStart(event, 'bP')}
          >
            ♟
          </div>
          {/* Add more pieces as needed */}
        </div>
        <div
            className="chessboard ml-4"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
        </div>
      </div>
  );
};

export default App;
