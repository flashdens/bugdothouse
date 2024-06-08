import React from 'react';

const Background = () => {
    return (
        <div className="absolute inset-0 -z-10 overflow-hidden w-full h-full">
            <div className="bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 min-h-screen w-full opacity-95"></div>
            <div className="absolute inset-0 bg-pattern bg-opacity-20 animate-pattern"></div>
            <style jsx>{`
              .bg-pattern {
                background-size: cover;
                background-repeat: no-repeat;
                background-position: center;
                width: 100vw;
                height: 100vh;
              }
              @keyframes move {
                0% {
                  transform: translateX(0) translateY(0);
                }
                50% {
                  transform: translateX(10px) translateY(10px);
                }
                100% {
                  transform: translateX(0) translateY(0);
                }
              }
              .animate-pattern {
                animation: move 10s linear infinite;
              }
            `}</style>
        </div>
    );
}

export default Background;
